from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
import httpx

router = APIRouter()


@router.post("/upload/avatar")
async def upload_avatar(file: UploadFile = File(...)):
    """Upload an avatar to Supabase storage using the service_role key on the server.

    Expects: multipart form `file`.
    Returns: { "url": public_url }
    """
    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE")

    if not supabase_url or not service_key:
        raise HTTPException(status_code=500, detail="Supabase configuration missing on server (SUPABASE_SERVICE_ROLE/SUPABASE_URL)")

    # generate a safe filename
    ext = (file.filename or "").split(".")[-1] if file.filename else "jpg"
    filename = f"{uuid.uuid4()}-{int(__import__('time').time()*1000)}.{ext}"

    content = await file.read()

    upload_url = f"{supabase_url}/storage/v1/object/avatars/{filename}"

    headers = {
        "Authorization": f"Bearer {service_key}",
        "apikey": service_key,
    }

    files = {
        "file": (filename, content, file.content_type or "application/octet-stream")
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(upload_url, headers=headers, files=files, timeout=30.0)

    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=f"Upload failed: {resp.text}")

    # public URL for objects in public bucket
    public_url = f"{supabase_url}/storage/v1/object/public/avatars/{filename}"
    return {"url": public_url, "key": filename}
