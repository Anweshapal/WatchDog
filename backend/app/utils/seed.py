from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models.log import Log


def seed_logs_if_empty(db: Session) -> int:
    stmt = select(func.count(Log.id))
    existing = int(db.scalar(stmt) or 0)
    if existing > 0:
        return 0

    now = datetime.utcnow()
    entries = [
        ("auth-service", "INFO", "login ok"),
        ("auth-service", "ERROR", "database timeout"),
        ("auth-service", "ERROR", "database timeout"),
        ("auth-service", "ERROR", "database timeout"),
        ("payment-service", "ERROR", "gateway timeout"),
        ("payment-service", "WARNING", "retrying payment"),
        ("orders-service", "INFO", "order created"),
        ("orders-service", "WARNING", "slow inventory response"),
        ("search-service", "INFO", "indexed 200 items"),
        ("profile-service", "INFO", "profile updated"),
        ("billing-service", "INFO", "invoice sent"),
        ("auth-service", "ERROR", "database timeout"),
        ("notification-service", "INFO", "email sent"),
        ("payment-service", "ERROR", "gateway timeout"),
        ("payment-service", "ERROR", "gateway timeout"),
        ("payment-service", "INFO", "payment confirmed"),
        ("auth-service", "INFO", "token refreshed"),
        ("search-service", "INFO", "cache warm complete"),
        ("profile-service", "WARNING", "avatar resize delay"),
        ("auth-service", "ERROR", "database timeout"),
    ]

    logs = []
    for index, (service, level, message) in enumerate(entries):
        logs.append(
            Log(
                timestamp=now - timedelta(minutes=index),
                service=service,
                level=level,
                message=message,
            )
        )

    db.add_all(logs)
    db.commit()
    return len(logs)
