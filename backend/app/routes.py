from fastapi import APIRouter, UploadFile, File
from .utils import process_sound
from app import app


router = APIRouter()

@router.post("/upload-sound/")
async def upload_sound(sound: UploadFile = File(...)):
    contents = await sound.read()
    visualization = process_sound(contents)
    return {"visualization": visualization}

app.include_router(router)