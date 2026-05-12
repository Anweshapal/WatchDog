from __future__ import annotations

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from ..models.log import Log
from ..schemas.log import LogCreate


def create_log(db: Session, log_in: LogCreate) -> Log:
    log_data: dict[str, object] = {
        "service": log_in.service,
        "level": log_in.level,
        "message": log_in.message,
    }
    if log_in.timestamp is not None:
        log_data["timestamp"] = log_in.timestamp

    log = Log(**log_data)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_recent_logs(db: Session, limit: int = 100) -> list[Log]:
    stmt = select(Log).order_by(desc(Log.timestamp)).limit(limit)
    return list(db.scalars(stmt).all())


def count_logs(db: Session) -> int:
    stmt = select(func.count(Log.id))
    return int(db.scalar(stmt) or 0)


def count_by_level(db: Session, level: str) -> int:
    normalized = level.strip().lower()
    stmt = select(func.count(Log.id)).where(func.lower(Log.level) == normalized)
    return int(db.scalar(stmt) or 0)
