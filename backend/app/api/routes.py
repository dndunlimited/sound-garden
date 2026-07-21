import os
import threading

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from backend.app.engine.gardenEngine import SoundEngine
from backend.app.engine.pitch_utils import PitchUtils
from backend.app.storage.visualAssetStore import (
    delete_visual_asset,
    get_visual_asset,
    get_visual_asset_path,
    list_visual_assets,
    save_visual_asset_stream
)



router = APIRouter()
engine = SoundEngine()

@router.post("/api/event")
def handle_event(event: dict):
    return engine.handle_event(event)

@router.get("/api/audio/harmonic-intervals")
def get_audio_harmonic_intervals():
    return {
        "intervals": PitchUtils.get_harmonic_intervals()
    }

@router.get("/api/audio/pitch-grid")
def get_audio_pitch_grid():
    return {
        "notes": PitchUtils.get_note_names(),
        "canvasNotes": PitchUtils.get_canvas_note_names(),
        "octaves": PitchUtils.get_octaves(),
        "canvasOctaves": PitchUtils.get_canvas_octaves(),
        "grid": PitchUtils.get_pitch_grid()
    }

@router.get("/api/garden/state")
def get_state():
    return engine.get_state()

@router.post("/event")
def handle_legacy_event(event: dict):
    return engine.handle_event(event)

@router.post("/api/garden/reset")
def reset():
    return engine.reset()

@router.post("/api/app/close")
def close_app():
    threading.Timer(0.25, lambda: os._exit(0)).start()

    return {"status": "closing"}

@router.get("/api/visual-assets")
def get_visual_assets():
    return {
        "assets": list_visual_assets()
    }

@router.post("/api/visual-assets")
async def upload_visual_asset(request: Request):
    content_type = request.headers.get("content-type", "")
    filename = request.headers.get("x-file-name", "Uploaded visual asset")

    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    return await save_visual_asset_stream(filename, content_type, request.stream())

@router.delete("/api/visual-assets/{asset_id}")
def remove_visual_asset(asset_id: str):
    return {
        "assets": delete_visual_asset(asset_id)
    }

@router.get("/api/visual-assets/{asset_id}/file")
def get_visual_asset_file(asset_id: str):
    asset = get_visual_asset(asset_id)
    path = get_visual_asset_path(asset_id)

    if not asset or not path:
        raise HTTPException(status_code=404, detail="Visual asset not found.")

    return FileResponse(path, media_type=asset["contentType"], filename=asset["name"])
