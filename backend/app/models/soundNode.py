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
        visual_asset_id=None,
        sample_id=None,
        sample_playback_mode="pitched",
        is_glow_enabled=True,
        is_motion_enabled=True,
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
        self.visual_asset_id = visual_asset_id
        self.sample_id = sample_id
        self.sample_playback_mode = sample_playback_mode
        self.is_glow_enabled = is_glow_enabled
        self.is_motion_enabled = is_motion_enabled
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
            "visualAssetId": self.visual_asset_id,
            "sampleId": self.sample_id,
            "samplePlaybackMode": self.sample_playback_mode,
            "isGlowEnabled": self.is_glow_enabled,
            "isMotionEnabled": self.is_motion_enabled,
            "isMuted": self.is_muted
        }
