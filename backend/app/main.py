from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import ALLOWED_ORIGINS
from .database import SessionLocal, init_db
from .routes import logs as logs_routes
from .routes import observability as observability_routes
from .services import observability_service
from .utils.seed import seed_logs_if_empty

app = FastAPI(
    title="Watchdog API",
    version="0.2.0",
    description="API-first intelligent observability for the Watchdog MVP.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    db = SessionLocal()
    try:
        seed_logs_if_empty(db)
        observability_service.evaluate_recent_logs(db)
    finally:
        db.close()


app.include_router(logs_routes.router)
app.include_router(observability_routes.router)
