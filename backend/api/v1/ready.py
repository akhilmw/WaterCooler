from fastapi import APIRouter

router = APIRouter(prefix="/ready", tags=["health"])

@router.get("")
def ready():
    return {"ready": True}
