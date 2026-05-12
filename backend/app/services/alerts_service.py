from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models.alert import Alert


def create_alert(
    db: Session,
    service: str,
    severity: str,
    message: str,
    anomaly_score: float,
) -> Alert:
    alert = Alert(
        service=service,
        severity=severity,
        message=message,
        anomaly_score=anomaly_score,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def get_alerts(db: Session, limit: int = 100) -> list[Alert]:
    stmt = select(Alert).order_by(Alert.timestamp.desc()).limit(limit)
    return list(db.scalars(stmt).all())


def count_alerts(db: Session) -> int:
    stmt = select(func.count(Alert.id))
    return int(db.scalar(stmt) or 0)


def has_recent_duplicate(
    db: Session, service: str, message: str, minutes: int = 10
) -> bool:
    cutoff = datetime.utcnow() - timedelta(minutes=minutes)
    stmt = (
        select(Alert.id)
        .where(
            Alert.service == service,
            Alert.message == message,
            Alert.timestamp >= cutoff,
        )
        .limit(1)
    )
    return db.scalar(stmt) is not None
