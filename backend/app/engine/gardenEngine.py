from backend.app.models.soundNode import SoundNode
from backend.app.engine.pitch_utils import PitchUtils

class SoundEngine:
    def __init__(self):
        self.nodes = []

    def get_canvas_pitch(self, x, y):
        notes = PitchUtils.get_note_names()
        octaves = PitchUtils.get_octaves()
        canvas_width = 600
        canvas_height = 400
        column_width = canvas_width / len(notes)
        row_height = canvas_height / len(octaves)
        note_index = int(max(0, min(len(notes) - 1, x // column_width)))
        octave_index = int(max(0, min(len(octaves) - 1, y // row_height)))
        note = notes[note_index]
        octave = octaves[octave_index]

        if note in ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]:
            return note, octave + 1

        return note, octave

    def handle_event(self, event):
        
        print("HANDLE EVENT:", event)

        if event["type"] == "add_node":
            audio_mode = event.get("audioMode", "notes")
            harmonic_type = event.get("harmonicType", "perfect_fifth")

            raw_frequency = 200 + event["x"]
            quantized_frequency = PitchUtils.quantize_x_to_pitch(event["x"])
            note = event.get("note", "A")
            octave = int(event.get("octave", 4))

            if event.get("pitchSource") == "canvas":
                note, octave = self.get_canvas_pitch(event["x"], event["y"])

            frequency = PitchUtils.get_frequency(note, octave)
            raw_frequency = frequency

            node = SoundNode(
                id=len(self.nodes),
                x=event["x"],
                y=event["y"],
                frequency=frequency,
                raw_frequency=raw_frequency,
                audio_mode=audio_mode,
                harmonic_type=harmonic_type,
                note=note,
                octave=octave
            )
            print("CREATING NODE:", node)
            self.nodes.append(node)
            print("CURRENT NODES:", self.nodes)
            return {"status": "ok", "node": node}

            return {
                "status": "ok",
                "node": node
            }
        return {"status": "ignored"}

    def get_state(self):
        return {
            "nodes": [node.to_dict() for node in self.nodes]
        }

    def reset(self):
        self.nodes = []
        return {"status": "reset"}
