class SoundEngine:
    def __init__(self):
        self.nodes = []

    def handle_event(self, event):
        
        print("HANDLE EVENT:", event)

        if event["type"] == "add_node":
            node = {
                "id": len(self.nodes),
                "x": event["x"],
                "y": event["y"],
                "frequency": 200 + event["x"]
            }
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
        return {"nodes": self.nodes}

    def reset(self):
        self.nodes = []
        return {"status": "reset"}