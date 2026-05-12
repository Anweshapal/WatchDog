from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AlertRead(BaseModel):
    id: int
    timestamp: datetime
    service: str = Field(..., max_length=100)
    severity: str = Field(..., max_length=20)
    message: str = Field(..., max_length=2000)
    anomaly_score: float

    model_config = ConfigDict(from_attributes=True)
