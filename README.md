# CamPy — 슬라이딩 윈도우 Grad-CAM 분석 도구

CamPy는 CNN(합성곱 신경망)이 특정 클래스를 예측할 때 이미지에서 어떤 영역에 주목하는지를 시각적으로 보여주는 **Grad-CAM(Gradient-weighted Class Activation Mapping)** 추출 도구입니다. React 기반 프론트엔드, Python FastAPI 백엔드, 그리고 Pywebview 데스크톱 래퍼를 결합하여 하나의 완성된 애플리케이션을 제공합니다.


<div align="center">
  <img width="49%" alt="분석 화면" src="https://github.com/user-attachments/assets/85a307e6-0484-400d-8613-3624c0de159d" />
  <img width="49%" alt="결과 화면" src="https://github.com/user-attachments/assets/d6611b1d-7330-46ae-b20f-256224a4c115" />
</div>

---

## 주요 기능

- **Grad-CAM 시각화** — 모델의 예측 근거가 되는 히트맵을 생성하고 시각화합니다.
- **슬라이딩 윈도우 분석** — 이미지 전체에 걸쳐 슬라이딩 윈도우 방식으로 Grad-CAM을 적용해 포괄적인 분석을 제공합니다.
- **모델 & 이미지 업로드** — UI를 통해 커스텀 모델과 이미지를 손쉽게 업로드할 수 있습니다.
- **데스크톱 앱** — Pywebview를 활용한 크로스 플랫폼 데스크톱 애플리케이션으로 실행됩니다.
- **React 프론트엔드** — React, Vite, Styled Components로 구축된 직관적인 UI를 제공합니다.
- **FastAPI 백엔드** — PyTorch 및 Ultralytics YOLO 모델을 활용한 고성능 Python 백엔드입니다.

---

## 기술 스택

### 프론트엔드

| 기술 | 설명 |
|---|---|
| React | UI 구축을 위한 JavaScript 라이브러리 |
| Vite | 빠른 프론트엔드 빌드 도구 |
| Axios | HTTP 비동기 통신 클라이언트 |
| Styled Components | CSS-in-JS 스타일링 라이브러리 |
| ESLint | JavaScript 코드 품질 검사 도구 |

### 백엔드

| 기술 | 설명 |
|---|---|
| Python | 메인 프로그래밍 언어 (3.10 ~ 3.12) |
| FastAPI | 고성능 Python 웹 API 프레임워크 |
| Uvicorn | FastAPI 구동을 위한 ASGI 서버 |
| Pywebview | 웹뷰 기반 경량 크로스 플랫폼 데스크톱 래퍼 |
| Ultralytics YOLO | 객체 감지 모델 라이브러리 (PyTorch · OpenCV · NumPy 포함) |
| python-multipart | 파일 업로드를 위한 멀티파트 폼 데이터 파서 |
| tqdm | 진행률 표시 라이브러리 |

---

## 시작하기

### 사전 요구사항

- Node.js (프론트엔드 개발용)
- Python 3.10 ~ 3.12
- uv (Python 패키지 관리자)

### 설치

**1. 저장소 클론**

```bash
git clone https://github.com/your-username/CamPy.git
cd CamPy
```

**2. 프론트엔드 설정**

```bash
cd frontend
npm install
```

**3. 백엔드 설정**

가상 환경 생성 후 의존성을 설치합니다.

```bash
cd ../backend

# 가상 환경 생성 및 의존성 설치
uv sync
```

---

## 실행 방법

### 개발 모드

프론트엔드는 Vite 개발 서버로, 백엔드는 FastAPI로 구동됩니다.

**터미널 1 — 프론트엔드 서버 시작**

```bash
cd frontend
npm run dev
# 기본적으로 http://localhost:5173 에서 실행됩니다.
```

**터미널 2 — 백엔드 및 데스크톱 앱 실행**

```bash
cd backend

# 개발 모드 환경변수 설정
export DEV_MODE=true    # macOS / Linux
set DEV_MODE=true       # Windows

python main.py
```

### 프로덕션 모드

**1. 프론트엔드 빌드**

```bash
cd frontend
npm run build
# frontend/dist 폴더에 빌드 결과물이 생성됩니다.
```

**2. 백엔드 및 데스크톱 앱 실행**

```bash
cd backend
python main.py
```

---

## API 엔드포인트

### `POST /api/analyze`

모델 파일과 이미지 파일을 업로드하고, 지정된 파라미터를 사용해 Grad-CAM 분석을 수행합니다.

**요청 파라미터 (Form Data)**

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `model_file` | File | — | 신경망 모델 파일 |
| `image_file` | File | — | 분석할 이미지 파일 |
| `target_id` | int | `0` | Grad-CAM 대상 클래스 ID |
| `m_top` | int | `30` | 슬라이딩 윈도우 상단 마진 |
| `m_bottom` | int | `30` | 슬라이딩 윈도우 하단 마진 |
| `m_left` | int | `30` | 슬라이딩 윈도우 좌측 마진 |
| `m_right` | int | `30` | 슬라이딩 윈도우 우측 마진 |
| `window_size` | int | `100` | 슬라이딩 윈도우 크기 |
| `stride` | int | `10` | 슬라이딩 윈도우 이동 보폭 |

**응답**

```json
{
  "status": "success",
  "result_path": "outputs/heatmap.png",
  "confidence": 0.87
}
```

---

### `POST /api/open-folder`

Grad-CAM 결과 이미지가 저장된 `outputs` 디렉토리를 엽니다.

**응답**

```json
{
  "status": "success",
  "message": "폴더를 열었습니다."
}
```
