from fastapi import APIRouter
from app.db.session import db_ping

router = APIRouter(prefix="/db", tags=["health"])

@router.get("/ready")
def db_ready():
    ok = False
    try:
        ok = db_ping()
    except Exception as e:
        return {"db_ready": False, "error": str(e)}
    return {"db_ready": ok}
