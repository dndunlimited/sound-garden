
#PERFECT_FIFTH = 3/2
#OCTAVE = 2
#FOURTH = 4/3

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


def quantize_x_to_pitch(x, canvas_width=600):
    x = max(0, min(canvas_width, x))

    index = round((x / canvas_width) * (len(NOTES) - 1))

    return NOTES[index]


def get_harmonic_intervals():
    return HARMONIC_INTERVALS