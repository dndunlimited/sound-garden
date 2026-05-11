from backend.app.models.soundNode import SoundNode

class SoundEngine:
    def __init__(self):
        self.nodes = []

    def handle_event(self, event):
        
        print("HANDLE EVENT:", event)

        if event["type"] == "add_node":
            node = SoundNode(
            id=len(self.nodes),
            x=event["x"],
            y=event["y"],
            frequency=200 + event["x"]
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