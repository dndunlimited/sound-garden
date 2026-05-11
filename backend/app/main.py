import sys

from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from backend.app.api.routes import router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"] ,
    #allow_origins=["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if getattr(sys, "frozen", False):
    BASE_DIR = Path(sys.executable).resolve().parent / "_internal"
else:
    BASE_DIR = Path(__file__).resolve().parents[2]

FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

app.mount(
    "/assets",
    StaticFiles(directory=FRONTEND_DIST / "assets"),
    name="assets"
)

@app.get("/")
def serve_app():
    return FileResponse(FRONTEND_DIST / "index.html")

""" @app.get("/{full_path:path}")
def serve_spa(full_path: str):
    return FileResponse(FRONTEND_DIST / "index.html") """