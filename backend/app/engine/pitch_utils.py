PERFECT_FIFTH = 3/2
OCTAVE = 2
FOURTH = 4/3

NOTES = [
    261.63,  # C4
    293.66,  # D4
    329.63,  # E4
    392.00,  # G4
    440.00,  # A4
    523.25,  # C5
    587.33,  # D5
    659.25,  # E5
    783.99,  # G5
    880.00,  # A5
]

def quantize_x_to_pitch(x, canvas_width=600):
    x = max(0, min(canvas_width, x))

    index = round((x / canvas_width) * (len(NOTES) - 1))

    return NOTES[index]