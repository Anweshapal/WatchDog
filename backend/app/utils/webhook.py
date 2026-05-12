from __future__ import annotations

from collections import deque
from typing import Deque

from ..models.alert import Alert

WEBHOOK_OUTBOX: Deque[dict[str, object]] = deque(maxlen=50)


def build_webhook_payload(alert: Alert, features: dict[str, object]) -> dict[str, object]:
    return {
        "event_id": f"alert-{alert.id}",
        "event_type": "anomaly.alert",
        "timestamp": alert.timestamp.isoformat(),
        "service": alert.service,
        "severity": alert.severity,
        "message": alert.message,
        "anomaly_score": alert.anomaly_score,
        "metrics": {
            "total_logs": features.get("total_logs", 0),
            "error_count": features.get("error_count", 0),
            "warning_count": features.get("warning_count", 0),
            "error_rate": round(float(features.get("error_rate", 0.0)), 3),
        },
    }


def record_webhook(payload: dict[str, object]) -> None:
    WEBHOOK_OUTBOX.append(payload)


def recent_webhooks(limit: int = 10) -> list[dict[str, object]]:
    if limit <= 0:
        return []
    return list(WEBHOOK_OUTBOX)[-limit:]
