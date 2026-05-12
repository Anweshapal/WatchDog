from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LogBase(BaseModel):
    service: str = Field(..., max_length=100)
    level: str = Field(..., max_length=50)
    message: str = Field(..., max_length=2000)


class LogCreate(LogBase):
    timestamp: datetime | None = None


class LogRead(LogBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
