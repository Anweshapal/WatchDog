from __future__ import annotations

from pydantic import BaseModel


class MetricsRead(BaseModel):
    total_logs: int
    total_errors: int
    total_warnings: int
    alerts_triggered: int
    health_score: int
    system_status: str
