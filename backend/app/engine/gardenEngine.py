from backend.app.models.soundNode import SoundNode
from backend.app.engine.pitch_utils import PitchUtils

class SoundEngine:
    def __init__(self):
        self.nodes = []

    def get_plot_coordinates(self, x, y):
        canvas_width = 900
        canvas_height = 600
        plot = {
            "top_left": (0.205, 0.53),
            "top_right": (0.795, 0.53),
            "bottom_left": (0.055, 0.945),
            "bottom_right": (0.945, 0.945)
        }
        top_y = plot["top_left"][1] * canvas_height
        bottom_y = plot["bottom_left"][1] * canvas_height
        v = max(0, min(1, (y - top_y) / (bottom_y - top_y)))
        left_x = (
            plot["top_left"][0] +
            (plot["bottom_left"][0] - plot["top_left"][0]) * v
        ) * canvas_width
        right_x = (
            plot["top_right"][0] +
            (plot["bottom_right"][0] - plot["top_right"][0]) * v
        ) * canvas_width
        u = max(0, min(1, (x - left_x) / (right_x - left_x)))

        return u, v

    def get_canvas_pitch_indexes(self, x, y):
        notes = PitchUtils.get_canvas_note_names()
        octaves = PitchUtils.get_canvas_octaves()
        u, v = self.get_plot_coordinates(x, y)
        note_index = int(max(0, min(len(notes) - 1, u * len(notes))))
        octave_index = int(max(0, min(len(octaves) - 1, v * len(octaves))))

        return note_index, octave_index

    def get_canvas_pitch_from_indexes(self, note_index, octave_index):
        notes = PitchUtils.get_canvas_note_names()
        octaves = PitchUtils.get_canvas_octaves()
        note = notes[note_index]
        octave = octaves[octave_index]

        if note_index == len(notes) - 1:
            return note, octave + 1

        if note in ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]:
            return note, octave + 1

        return note, octave

    def get_canvas_pitch(self, x, y):
        note_index, octave_index = self.get_canvas_pitch_indexes(x, y)

        return self.get_canvas_pitch_from_indexes(note_index, octave_index)

    def get_tuner_pitch(self, start_x, start_y, x, y):
        notes = PitchUtils.get_canvas_note_names()
        start_u, _ = self.get_plot_coordinates(start_x, start_y)
        current_u, _ = self.get_plot_coordinates(x, y)
        start_note_index = int(max(0, min(len(notes) - 1, start_u * len(notes))))
        _, current_octave_index = self.get_canvas_pitch_indexes(x, y)
        note, octave = self.get_canvas_pitch_from_indexes(
            start_note_index,
            current_octave_index
        )
        semitone_offset = (current_u - start_u) * len(notes)
        base_frequency = PitchUtils.get_frequency(note, octave)
        frequency = round(base_frequency * (2 ** (semitone_offset / 12)), 2)

        return note, octave, frequency

    def handle_event(self, event):
        
        print("HANDLE EVENT:", event)

        if event["type"] == "remove_last_node":
            return self.remove_last_node()

        if event["type"] == "add_node":
            audio_mode = event.get("audioMode", "notes")
            harmonic_type = event.get("harmonicType", "perfect_fifth")
            sound_type = event.get("soundType", "pitch")
            plant_type = event.get("plantType", "glow_bloom")
            visual_type = event.get("visualType", "plant")
            is_muted = bool(event.get("isMuted", False))

            raw_frequency = 200 + event["x"]
            quantized_frequency = PitchUtils.quantize_x_to_pitch(event["x"])
            note = event.get("note", "A")
            octave = int(event.get("octave", 4))

            if event.get("pitchSource") == "canvas":
                note, octave = self.get_canvas_pitch(event["x"], event["y"])

            if event.get("pitchSource") == "tuner":
                note, octave, raw_frequency = self.get_tuner_pitch(
                    event.get("startX", event["x"]),
                    event.get("startY", event["y"]),
                    event["x"],
                    event["y"]
                )

            frequency = PitchUtils.get_frequency(note, octave)
            if event.get("pitchSource") == "tuner":
                frequency = raw_frequency
            else:
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
                octave=octave,
                sound_type=sound_type,
                plant_type=plant_type,
                visual_type=visual_type,
                is_muted=is_muted
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

    def remove_last_node(self):
        if not self.nodes:
            return {"status": "empty", "node": None}

        node = self.nodes.pop()
        return {"status": "removed", "node": node.to_dict()}
