from __future__ import annotations

from collections import Counter
from typing import Any

from sqlalchemy.orm import Session

from ..models.log import Log
from ..schemas.health import HealthRead
from ..schemas.insights import InsightsRead
from ..schemas.metrics import MetricsRead
from ..services import alerts_service, logs_service
from ..utils.webhook import build_webhook_payload, record_webhook

ANALYSIS_LIMIT = 20
HEALTH_LIMIT = 100
INSIGHT_LIMIT = 50
ALERT_DEDUP_MINUTES = 10


def evaluate_recent_logs(db: Session):
    logs = logs_service.get_recent_logs(db, limit=ANALYSIS_LIMIT)
    if not logs:
        return None

    features = extract_features(logs)
    anomaly = detect_anomaly(logs, features)
    if not anomaly["triggered"]:
        return None

    if alerts_service.has_recent_duplicate(
        db, anomaly["service"], anomaly["message"], minutes=ALERT_DEDUP_MINUTES
    ):
        return None

    alert = alerts_service.create_alert(
        db,
        service=anomaly["service"],
        severity=anomaly["severity"],
        message=anomaly["message"],
        anomaly_score=anomaly["anomaly_score"],
    )

    payload = build_webhook_payload(alert, features)
    record_webhook(payload)
    return alert


def extract_features(logs: list[Log]) -> dict[str, Any]:
    total_logs = len(logs)
    logs_per_service = Counter(log.service for log in logs)
    level_counts = Counter(_normalize_level(log.level) for log in logs)

    error_count = level_counts.get("error", 0)
    warning_count = level_counts.get("warning", 0)
    info_count = level_counts.get("info", 0)
    error_rate = error_count / total_logs if total_logs else 0.0

    return {
        "total_logs": total_logs,
        "error_count": error_count,
        "warning_count": warning_count,
        "info_count": info_count,
        "logs_per_service": dict(logs_per_service),
        "error_rate": error_rate,
    }


def detect_anomaly(logs: list[Log], features: dict[str, Any]) -> dict[str, Any]:
    total_logs = features["total_logs"]
    error_count = features["error_count"]

    service_errors = Counter(
        log.service for log in logs if _normalize_level(log.level) == "error"
    )
    if service_errors:
        top_service, top_count = service_errors.most_common(1)[0]
    else:
        top_service, top_count = "system", 0

    threshold_hit = error_count > 5
    repeated_failure = top_count >= 3

    if not (threshold_hit or repeated_failure):
        return {
            "triggered": False,
            "service": "system",
            "severity": "warning",
            "message": "",
            "anomaly_score": 0.0,
        }

    if threshold_hit:
        message = f"Error spike detected: {error_count} ERROR logs in last {total_logs} logs."
        if top_service != "system":
            message = f"{message} Top service: {top_service}."
    else:
        message = (
            f"Repeated failures in {top_service}: {top_count} ERROR logs in last {total_logs} logs."
        )

    severity = "critical" if error_count >= 8 or top_count >= 5 else "warning"
    anomaly_score = _anomaly_score(error_count, top_count, total_logs)

    return {
        "triggered": True,
        "service": top_service,
        "severity": severity,
        "message": message,
        "anomaly_score": anomaly_score,
    }


def compute_health(features: dict[str, Any]) -> tuple[int, str]:
    error_rate = features["error_rate"]
    score = max(0, 100 - int(error_rate * 100 * 1.5))

    if score >= 85:
        status = "Healthy"
    elif score >= 60:
        status = "Warning"
    else:
        status = "Critical"

    return score, status


def get_metrics(db: Session) -> MetricsRead:
    total_logs = logs_service.count_logs(db)
    total_errors = logs_service.count_by_level(db, "error")
    total_warnings = logs_service.count_by_level(db, "warning")
    alerts_triggered = alerts_service.count_alerts(db)

    features = extract_features(logs_service.get_recent_logs(db, limit=HEALTH_LIMIT))
    health_score, system_status = compute_health(features)

    return MetricsRead(
        total_logs=total_logs,
        total_errors=total_errors,
        total_warnings=total_warnings,
        alerts_triggered=alerts_triggered,
        health_score=health_score,
        system_status=system_status,
    )


def get_health(db: Session) -> HealthRead:
    features = extract_features(logs_service.get_recent_logs(db, limit=HEALTH_LIMIT))
    health_score, system_status = compute_health(features)

    return HealthRead(
        health_score=health_score,
        system_status=system_status,
        total_logs=features["total_logs"],
        error_count=features["error_count"],
        error_rate=round(features["error_rate"], 3),
    )


def get_insights(db: Session) -> InsightsRead:
    logs = logs_service.get_recent_logs(db, limit=INSIGHT_LIMIT)
    alerts = alerts_service.get_alerts(db, limit=3)
    features = extract_features(logs)

    insights: list[str] = []

    top_error_service = _top_service_by_level(logs, "error")
    common_error = _most_common_error_message(logs)

    if top_error_service and common_error:
        insights.append(
            f"Spike detected in {top_error_service} due to repeated {common_error}."
        )
    elif top_error_service:
        insights.append(f"{top_error_service} experiencing elevated error frequency.")

    if alerts:
        latest_alert = alerts[0]
        insights.append(f"Recent alert: {latest_alert.message}")

    warning_service = _top_service_by_level(logs, "warning")
    if warning_service and features["warning_count"]:
        insights.append(f"Warnings rising in {warning_service}.")

    if not insights:
        insights.append("No incidents detected from recent logs.")

    return InsightsRead(insights=insights[:3])


def _normalize_level(level: str | None) -> str:
    if not level:
        return ""
    return level.strip().lower()


def _anomaly_score(error_count: int, top_count: int, total_logs: int) -> float:
    denominator = max(1, total_logs)
    base = (error_count / denominator) * 1.5
    focus = (top_count / denominator) * 0.5
    return round(min(1.0, base + focus), 3)


def _top_service_by_level(logs: list[Log], level: str) -> str:
    normalized = level.strip().lower()
    counts = Counter(
        log.service for log in logs if _normalize_level(log.level) == normalized
    )
    if not counts:
        return ""
    return counts.most_common(1)[0][0]


def _most_common_error_message(logs: list[Log]) -> str:
    messages = [
        log.message for log in logs if _normalize_level(log.level) == "error"
    ]
    if not messages:
        return ""

    message, _ = Counter(messages).most_common(1)[0]
    return _compact_message(message, limit=80)


def _compact_message(message: str, limit: int = 80) -> str:
    if len(message) <= limit:
        return message
    return message[: limit - 3].rstrip() + "..."
