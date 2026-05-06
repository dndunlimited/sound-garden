from fastapi import APIRouter
from app.engine.sound_engine import SoundEngine



router = APIRouter()
engine = SoundEngine()

@router.post("/event")
def handle_event(event: dict):
    return engine.handle_event(event)

@router.get("/state")
def get_state():
    return engine.get_state()

@router.post("/reset")
def reset():
    return engine.reset()