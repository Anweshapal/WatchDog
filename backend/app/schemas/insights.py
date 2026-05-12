from __future__ import annotations

from pydantic import BaseModel


class InsightsRead(BaseModel):
    insights: list[str]
