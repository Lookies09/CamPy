import os
import sys
import threading
import uvicorn
import webview
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api import router as api_router

app = FastAPI()

if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
    os.chdir(os.path.dirname(sys.executable))
    static_path = os.path.join(base_path, "dist_web")
else:
    base_path = os.path.dirname(os.path.abspath(__file__))
    static_path = os.path.abspath(os.path.join(base_path, "..", "frontend", "dist"))

os.makedirs("outputs", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api")

app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

if os.path.exists(static_path):
    app.mount("/", StaticFiles(directory=static_path, html=True), name="static")
    print(f"정적 파일 연결 성공: {static_path}")
else:
    print(f"경고: 정적 파일 경로를 찾을 수 없습니다: {static_path}")

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

if __name__ == "__main__":
    # 서버 실행
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    # URL 결정 (DEV_MODE 환경변수가 있으면 Vite, 없으면 FastAPI)
    url = "http://localhost:5173" if os.environ.get("DEV_MODE") else "http://127.0.0.1:8000"
    
    window = webview.create_window(
        "ScanCAM - Sliding Window Grad-CAM Analyzer",
        url=url,
        width=1200,
        height=800,
        resizable=True
    )

    # 빌드 후에는 debug=False로 두는 것이 깔끔합니다.
    webview.start(debug=not getattr(sys, 'frozen', False))