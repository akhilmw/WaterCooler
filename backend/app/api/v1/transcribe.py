from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import httpx

router = APIRouter()


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Accepts an audio file and returns a transcription using OpenAI Whisper API."""
    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured on server (OPENAI_API_KEY)")

    content = await file.read()

    url = "https://api.openai.com/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {openai_key}"}

    # multipart/form-data with file and model
    files = {
        "file": (file.filename or "recording.webm", content, file.content_type or "audio/webm")
    }
    data = {"model": "whisper-1"}

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(url, headers=headers, data=data, files=files)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Transcription request failed: {e}")

    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=f"Transcription failed: {resp.text}")

    body = resp.json()
    # OpenAI's Whisper returns { text: "..." }
    text = body.get("text") or body.get("transcription") or ""
    return {"text": text}
