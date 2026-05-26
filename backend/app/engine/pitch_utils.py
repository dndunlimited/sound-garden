class PitchUtils:
    NOTES = [
        220.00,  # A3
        233.08,  # A#3 / Bb3
        246.94,  # B3
        261.63,  # C4
        277.18,  # C#4 / Db4
        293.66,  # D4
        311.13,  # D#4 / Eb4
        329.63,  # E4
        349.23,  # F4
        369.99,  # F#4 / Gb4
        392.00,  # G4
        415.30,  # G#4 / Ab4
        440.00,  # A4
        466.16,  # A#4 / Bb4
        493.88,  # B4
        523.25,  # C5
        554.37,  # C#5 / Db5
        587.33,  # D5
        622.25,  # D#5 / Eb5
        659.25,  # E5
        698.46,  # F5
        739.99,  # F#5 / Gb5
        783.99,  # G5
        830.61,  # G#5 / Ab5
        880.00,  # A5
    ]

    NOTE_NAMES_SHARP = [
        "A",
        "A#",
        "B",
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
    ]

    NOTE_NAMES_STANDARD = [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    ]

    FLAT_EQUIVALENTS = {
        "C#": "Db",
        "D#": "Eb",
        "F#": "Gb",
        "G#": "Ab",
        "A#": "Bb",
    }
    HARMONIC_INTERVALS = [
        {
            "id": "octave",
            "label": "Octave",
            "ratio": 2.0,
            "gain": 0.02
        },
        {
            "id": "perfect_fourth",
            "label": "Perfect 4th",
            "ratio": 4/3,
            "gain": 0.02
        },
        {
            "id": "perfect_fifth",
            "label": "Perfect 5th",
            "ratio": 3/2,
            "gain": 0.02
        },
        {
            "id": "major_third",
            "label": "Major 3rd",
            "ratio": 5/4,
            "gain": 0.02
        },
        {
            "id": "minor_third",
            "label": "Minor 3rd",
            "ratio": 6/5,
            "gain": 0.02
        }
    ]

    def get_harmonic_intervals():
        return PitchUtils.HARMONIC_INTERVALS
    
    def quantize_x_to_pitch(x, canvas_width=900):
        x = max(0, min(canvas_width, x))

        index = round((x / canvas_width) * (len(PitchUtils.NOTES) - 1))

        return PitchUtils.NOTES[index]


    def midi_number(note_name: str, octave: int) -> int:
        note_index = PitchUtils.NOTE_NAMES_STANDARD.index(note_name)
        return (octave + 1) * 12 + note_index


    def frequency_from_note(note_name: str, octave: int) -> float:
        midi = PitchUtils.midi_number(note_name, octave)
        return round(440.0 * (2 ** ((midi - 69) / 12)), 2)


    def format_note_label(note_name: str, octave: int) -> str:
        if note_name in PitchUtils.FLAT_EQUIVALENTS:
            return f"{note_name}{octave} / {PitchUtils.FLAT_EQUIVALENTS[note_name]}{octave}"

        return f"{note_name}{octave}"


    def format_note_id(note_name: str, octave: int) -> str:
        return note_name.replace("#", "_sharp").lower() + str(octave)


    def get_note_names():
        return PitchUtils.NOTE_NAMES_SHARP

    def get_canvas_note_names():
        return PitchUtils.NOTE_NAMES_SHARP + ["A"]


    def get_octaves():
        return [2, 3, 4, 5, 6]


    def get_canvas_octaves():
        return [2, 3, 4, 5]


    def get_pitch_grid():
        grid = []

        for octave in PitchUtils.get_octaves():
            for note_name in PitchUtils.get_note_names():
                grid.append({
                    "id": PitchUtils.format_note_id(note_name, octave),
                    "note": note_name,
                    "octave": octave,
                    "label": PitchUtils.format_note_label(note_name, octave),
                    "frequency": PitchUtils.frequency_from_note(note_name, octave)
                })

        return grid


    def get_frequency(note_name: str, octave: int) -> float:
        return PitchUtils.frequency_from_note(note_name, octave)

