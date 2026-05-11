class SoundNode:

    def __init__(self, id, x, y, frequency):

        self.id = id
        self.x = x
        self.y = y
        self.frequency = frequency

    def to_dict(self):

        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "frequency": self.frequency
        }