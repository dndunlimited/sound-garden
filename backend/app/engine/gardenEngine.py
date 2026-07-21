from backend.app.models.soundNode import SoundNode
from backend.app.engine.pitch_utils import PitchUtils

class SoundEngine:
    def __init__(self):
        self.nodes = []

    def get_plot_coordinates(self, x, y):
        canvas_width = 900
        canvas_height = 600
        plot = {
            "top_left": (0.49, 0.65),
            "top_right": (0.64, 0.65),
            "bottom_left": (-0.02, 0.9),
            "bottom_right": (1.03, 0.93),
            "left_control": (0.2, 0.87),
            "right_control": (0.78, 0.8)
        }

        def quadratic_point(start, control, end, amount):
            inverse = 1 - amount
            return (
                inverse * inverse * start[0] + 2 * inverse * amount * control[0] + amount * amount * end[0],
                inverse * inverse * start[1] + 2 * inverse * amount * control[1] + amount * amount * end[1]
            )

        def plot_side_points(amount):
            return (
                quadratic_point(plot["top_left"], plot["left_control"], plot["bottom_left"], amount),
                quadratic_point(plot["top_right"], plot["right_control"], plot["bottom_right"], amount)
            )

        lower = 0
        upper = 1

        for _ in range(24):
            middle = (lower + upper) / 2
            left, right = plot_side_points(middle)
            center_y = ((left[1] + right[1]) / 2) * canvas_height

            if center_y < y:
                lower = middle
            else:
                upper = middle

        v = max(0, min(1, (lower + upper) / 2))
        left, right = plot_side_points(v)
        left_x = left[0] * canvas_width
        right_x = right[0] * canvas_width
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
        if event["type"] == "remove_last_node":
            return self.remove_last_node()

        if event["type"] == "add_node":
            audio_mode = event.get("audioMode", "noise")
            harmonic_type = event.get("harmonicType", "perfect_fifth")
            sound_type = event.get("soundType", "pitch")
            plant_type = event.get("plantType", "glow_bloom")
            visual_type = event.get("visualType", "plant")
            visual_asset_id = event.get("visualAssetId")
            sample_id = event.get("sampleId")
            sample_playback_mode = event.get("samplePlaybackMode", "pitched")
            is_glow_enabled = bool(event.get("isGlowEnabled", True))
            is_motion_enabled = bool(event.get("isMotionEnabled", True))
            is_muted = bool(event.get("isMuted", False))

            raw_frequency = 200 + event["x"]
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
                visual_asset_id=visual_asset_id,
                sample_id=sample_id,
                sample_playback_mode=sample_playback_mode,
                is_glow_enabled=is_glow_enabled,
                is_motion_enabled=is_motion_enabled,
                is_muted=is_muted
            )
            self.nodes.append(node)
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
