from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.health import router as health_router
from api.v1.ready import router as ready_router
app = FastAPI(title="watercooler-api", version="0.1.0")

# allow local frontend (tweak later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api/v1")
app.include_router(ready_router, prefix="/api/v1")