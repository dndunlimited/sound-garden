import threading
import time
import traceback
import uvicorn
import webview

from backend.app.main import app


def run_server():
    try:
        print("Starting FastAPI server...")

        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000,
            log_level="debug"
        )

    except Exception as e:
        print("SERVER ERROR:")
        traceback.print_exc()


if __name__ == "__main__":

    try:
        print("Launching Sound Garden...")

        server_thread = threading.Thread(
            target=run_server,
            daemon=True
        )

        server_thread.start()

        time.sleep(1)

        print("Opening window...")

        webview.create_window(
            "Sound Garden",
            "http://127.0.0.1:8000",
            width=1000,
            height=700,
            resizable=True,
        )

        webview.start(debug=True)

    except Exception as e:
        print("APPLICATION ERROR:")
        traceback.print_exc()

    finally:
        input("\nPress Enter to exit...")