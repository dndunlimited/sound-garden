class SoundNode:

    def __init__(
        self,
        id,
        x,
        y,
        frequency,
        raw_frequency=None,
        audio_mode="harmonics",
        harmonic_type="perfect_fifth"
    ):
        self.id = id
        self.x = x
        self.y = y
        self.frequency = frequency
        self.raw_frequency = raw_frequency if raw_frequency is not None else frequency
        self.audio_mode = audio_mode
        self.harmonic_type = harmonic_type

    def to_dict(self):
        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "frequency": self.frequency,
            "rawFrequency": self.raw_frequency,
            "audioMode": self.audio_mode,
            "harmonicType": self.harmonic_type
        }