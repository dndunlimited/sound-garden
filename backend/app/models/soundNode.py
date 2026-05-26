class SoundNode:

    def __init__(
        self,
        id,
        x,
        y,
        frequency,
        raw_frequency=None,
        audio_mode="notes",
        harmonic_type="perfect_fifth",
        note="A",
        octave=4,
        sound_type="pitch",
        plant_type="glow_bloom",
        visual_type="plant",
        is_muted=False
    ):
        self.id = id
        self.x = x
        self.y = y
        self.frequency = frequency
        self.raw_frequency = raw_frequency if raw_frequency is not None else frequency
        self.audio_mode = audio_mode
        self.harmonic_type = harmonic_type
        self.note = note
        self.octave = octave
        self.sound_type = sound_type
        self.plant_type = plant_type
        self.visual_type = visual_type
        self.is_muted = is_muted

    def to_dict(self):
        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "frequency": self.frequency,
            "rawFrequency": self.raw_frequency,
            "audioMode": self.audio_mode,
            "harmonicType": self.harmonic_type,
            "note": self.note,
            "octave": self.octave,
            "soundType": self.sound_type,
            "plantType": self.plant_type,
            "visualType": self.visual_type,
            "isMuted": self.is_muted
        }
