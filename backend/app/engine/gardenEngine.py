from backend.app.models.soundNode import SoundNode
from backend.app.engine.pitch_utils import quantize_x_to_pitch
class SoundEngine:
    def __init__(self):
        self.nodes = []

    def handle_event(self, event):
        
        print("HANDLE EVENT:", event)

        if event["type"] == "add_node":
            audio_mode = event.get("audioMode", "harmonics")
            harmonic_type = event.get("harmonicType", "perfect_fifth")

            raw_frequency = 200 + event["x"]
            quantized_frequency = quantize_x_to_pitch(event["x"])

            node = SoundNode(
                id=len(self.nodes),
                x=event["x"],
                y=event["y"],
                frequency=quantized_frequency,
                raw_frequency=raw_frequency,
                audio_mode=audio_mode,
                harmonic_type=harmonic_type
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