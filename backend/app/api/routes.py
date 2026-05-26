from fastapi import APIRouter
from backend.app.engine.gardenEngine import SoundEngine
from backend.app.engine.pitch_utils import PitchUtils



router = APIRouter()
engine = SoundEngine()

@router.post("/api/event")
def handle_event(event: dict):
   
    print("EVENT RECEIVED:", event)

    result = engine.handle_event(event)

    print("ENGINE RESULT:", result)

    return result

@router.get("/api/audio/harmonic-intervals")
def get_audio_harmonic_intervals():
    print("GETTING HARMONIC INTERVALS")

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
