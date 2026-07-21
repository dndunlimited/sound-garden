import json
import mimetypes
import uuid
from pathlib import Path

VISUAL_ASSET_ROOT = Path.home() / ".sound-garden" / "visual-assets"
METADATA_PATH = VISUAL_ASSET_ROOT / "metadata.json"


def ensure_visual_asset_store():
    VISUAL_ASSET_ROOT.mkdir(parents=True, exist_ok=True)
    if not METADATA_PATH.exists():
        METADATA_PATH.write_text("[]", encoding="utf-8")


def list_visual_assets():
    ensure_visual_asset_store()
    return _read_metadata()


def get_visual_asset(asset_id):
    ensure_visual_asset_store()
    for asset in _read_metadata():
        if asset["id"] == asset_id:
            return asset

    return None


def get_visual_asset_path(asset_id):
    asset = get_visual_asset(asset_id)
    if not asset:
        return None

    path = VISUAL_ASSET_ROOT / asset["storedName"]
    return path if path.exists() else None


async def save_visual_asset_stream(filename, content_type, stream):
    ensure_visual_asset_store()
    asset_id = str(uuid.uuid4())
    safe_filename = Path(filename or "Uploaded visual asset").name
    suffix = Path(safe_filename).suffix
    resolved_content_type = content_type or mimetypes.guess_type(safe_filename)[0] or "application/octet-stream"
    stored_name = f"{asset_id}{suffix}"
    stored_path = VISUAL_ASSET_ROOT / stored_name

    with stored_path.open("wb") as output:
        async for chunk in stream:
            output.write(chunk)

    asset = {
        "id": asset_id,
        "name": safe_filename,
        "contentType": resolved_content_type,
        "size": stored_path.stat().st_size,
        "storedName": stored_name
    }
    assets = [asset, *_read_metadata()]

    _write_metadata(assets)

    return _public_asset(asset)


def delete_visual_asset(asset_id):
    ensure_visual_asset_store()
    assets = _read_metadata()
    asset = next((item for item in assets if item["id"] == asset_id), None)

    if not asset:
        return list_visual_assets()

    path = VISUAL_ASSET_ROOT / asset["storedName"]
    if path.exists():
        path.unlink()

    _write_metadata([item for item in assets if item["id"] != asset_id])

    return list_visual_assets()


def _read_metadata():
    try:
        assets = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        assets = []

    return [_public_asset(asset) for asset in assets if asset.get("id") and asset.get("storedName")]


def _write_metadata(assets):
    METADATA_PATH.write_text(json.dumps(assets, indent=2), encoding="utf-8")


def _public_asset(asset):
    return {
        "id": asset["id"],
        "name": asset["name"],
        "contentType": asset["contentType"],
        "size": asset["size"],
        "storedName": asset["storedName"]
    }
