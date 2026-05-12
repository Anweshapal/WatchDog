from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import log as log_schemas
from ..services import logs_service, observability_service

router = APIRouter(tags=["logs"])


@router.post("/logs", response_model=log_schemas.LogRead, status_code=201)
def create_log(log: log_schemas.LogCreate, db: Session = Depends(get_db)):
    created = logs_service.create_log(db, log)
    observability_service.evaluate_recent_logs(db)
    return created


@router.get("/logs", response_model=list[log_schemas.LogRead])
def read_logs(
    limit: int = Query(100, ge=1, le=1000), db: Session = Depends(get_db)
):
    return logs_service.get_recent_logs(db, limit=limit)
