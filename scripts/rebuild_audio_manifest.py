import os
import re
import json

PUBLIC_AUDIO_DIR = "/Users/tranthithuynhi/my-react-app/public/audio"
MANIFEST_PATH = "/Users/tranthithuynhi/my-react-app/src/utils/audioManifest.json"

def norm(s):
    if not s:
        return ""
    return re.sub(r'[^a-zA-Z0-9]', '', s).lower()

def rebuild_manifest():
    manifest = {}

    # Nạp manifest hiện tại làm dữ liệu chuẩn (phục vụ các file đã tải lên R2)
    if os.path.exists(MANIFEST_PATH):
        try:
            with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception:
            manifest = {}

    # Nếu thư mục local public/audio có tồn tại, quét bổ sung file
    if os.path.exists(PUBLIC_AUDIO_DIR):
        folders_in_order = []
        for root, dirs, files in os.walk(PUBLIC_AUDIO_DIR):
            if "old" in root.lower():
                folders_in_order.append(root)

        for root, dirs, files in os.walk(PUBLIC_AUDIO_DIR):
            if "old" not in root.lower():
                folders_in_order.append(root)

        for folder_path in folders_in_order:
            if not os.path.exists(folder_path):
                continue
            for file in os.listdir(folder_path):
                if file.endswith(".mp3") and not file.startswith("_temp"):
                    abs_file_path = os.path.join(folder_path, file)
                    rel_url = "/" + os.path.relpath(abs_file_path, os.path.join(PUBLIC_AUDIO_DIR, "..")).replace("\\", "/")
                    
                    base_name = os.path.splitext(file)[0]
                    key = norm(base_name)

                    if "old" not in folder_path.lower():
                        manifest[key] = rel_url
                    elif key not in manifest:
                        manifest[key] = rel_url

    # Write sorted manifest
    sorted_manifest = dict(sorted(manifest.items()))
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted_manifest, f, ensure_ascii=False, indent=2)

    print(f"✅ Đã rebuild audioManifest.json thành công!")
    print(f"📊 Tổng số key trong manifest: {len(sorted_manifest)}")

if __name__ == "__main__":
    rebuild_manifest()

