from dotenv import load_dotenv
load_dotenv()  # load backend/.env

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.health import router as health_router           
from app.api.v1.ready import router as ready_router
from app.api.v1.me import router as me_router
# from app.api.v1.db_ready import router as db_ready_router
from app.api.v1.token_debug import router as token_debug_router
from app.api.v1.profile import router as profile_router
from app.api.v1.upload import router as upload_router
from app.api.v1.transcribe import router as transcribe_router
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
app.include_router(me_router, prefix="/api/v1")
# app.include_router(db_ready_router, prefix="/api/v1")
app.include_router(token_debug_router, prefix="/api/v1")
app.include_router(profile_router, prefix="/api/v1")
app.include_router(upload_router, prefix="/api/v1")
app.include_router(transcribe_router, prefix="/api/v1")