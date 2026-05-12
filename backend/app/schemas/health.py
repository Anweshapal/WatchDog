from __future__ import annotations

from pydantic import BaseModel


class HealthRead(BaseModel):
    health_score: int
    system_status: str
    total_logs: int
    error_count: int
    error_rate: float
