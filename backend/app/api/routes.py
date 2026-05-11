from fastapi import APIRouter
from backend.app.engine.gardenEngine import SoundEngine



router = APIRouter()
engine = SoundEngine()

@router.post("/api/event")
def handle_event(event: dict):
   
    print("EVENT RECEIVED:", event)

    result = engine.handle_event(event)

    print("ENGINE RESULT:", result)

    return result

@router.get("/api/garden/state")
def get_state():
    print("GETTING GARDEN STATE")
    state = engine.get_state()
    print("GARDEN STATE:", state)
    return state

@router.post("/event")
def handle_event(event: dict):
    print("EVENT RECEIVED:", event)
    return engine.handle_event(event)

@router.post("/api/garden/reset")
def reset():
    return engine.reset()