from fastapi import APIRouter, UploadFile, File, Form
from typing import Annotated
import shutil
import os
from processor import run_gradcam_process

router = APIRouter()

@router.post("/analyze")
async def analyze(
    model_file: Annotated[UploadFile, File()],
    image_file: Annotated[UploadFile, File()],
    target_id: Annotated[int, Form()] = 0,
    m_top: Annotated[int, Form()] = 30,
    m_bottom: Annotated[int, Form()] = 30,
    m_left: Annotated[int, Form()] = 30,
    m_right: Annotated[int, Form()] = 30,
    window_size: Annotated[int, Form()] = 100,
    stride: Annotated[int, Form()] = 10
):
    # 1. 임시 폴더 생성 및 저장
    os.makedirs("temp", exist_ok=True)
    m_path = os.path.join("temp", model_file.filename)
    i_path = os.path.join("temp", image_file.filename)
    
    # 파일 저장 (with 문으로 안전하게 처리)
    try:
        with open(m_path, "wb") as f:
            shutil.copyfileobj(model_file.file, f)
        with open(i_path, "wb") as f:
            shutil.copyfileobj(image_file.file, f)
            
        result_path, confidence = run_gradcam_process(
            m_path, i_path, target_id, 
            (m_top, m_bottom, m_left, m_right), 
            window_size, stride
        )

        safe_path = result_path.replace("\\", "/")

        return {
            "status": "success",
            "result_path": safe_path, 
            "confidence": confidence
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
    finally:
        await model_file.close()
        await image_file.close()
        
        
        
@router.post("/open-folder")
async def open_folder():
    output_dir = os.path.abspath("outputs")
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
    
    try:
        system_platform = platform.system()
        
        if system_platform == "Windows":
            os.startfile(output_dir)
        elif system_platform == "Darwin":  # macOS
            subprocess.run(["open", output_dir])
        else:  # Linux (Ubuntu 등)
            subprocess.run(["xdg-open", output_dir])
            
        return {"status": "success", "message": "Folder opened"}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}