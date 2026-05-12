from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import alert as alert_schemas
from ..schemas import health as health_schemas
from ..schemas import insights as insights_schemas
from ..schemas import metrics as metrics_schemas
from ..services import alerts_service, observability_service

router = APIRouter(tags=["observability"])


@router.get("/alerts", response_model=list[alert_schemas.AlertRead])
def read_alerts(
    limit: int = Query(100, ge=1, le=1000), db: Session = Depends(get_db)
):
    return alerts_service.get_alerts(db, limit=limit)


@router.get("/metrics", response_model=metrics_schemas.MetricsRead)
def read_metrics(db: Session = Depends(get_db)):
    return observability_service.get_metrics(db)


@router.get("/health", response_model=health_schemas.HealthRead)
def read_health(db: Session = Depends(get_db)):
    return observability_service.get_health(db)


@router.get("/insights", response_model=insights_schemas.InsightsRead)
def read_insights(db: Session = Depends(get_db)):
    return observability_service.get_insights(db)
