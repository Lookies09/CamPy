import torch
import torch.nn.functional as F
import cv2
import numpy as np
from ultralytics import YOLO
import os
import time

class GradCAMRaw:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self.handle_f = self.target_layer.register_forward_hook(self.save_activation)
        self.handle_b = self.target_layer.register_full_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activations = output[0] if isinstance(output, tuple) else output

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]

    def __call__(self, input_tensor, target_id):
        output = self.model(input_tensor)
        if isinstance(output, (list, tuple)): 
            output = output[0]
        
        with torch.no_grad():
            if output.shape[-1] > target_id:
                current_score = torch.softmax(output, dim=-1)[0, target_id].item()
            else:
                current_score = output.max().item()    
            
        try:
            score = output[0, target_id]
        except:
            score = output[0].max() 

        self.model.zero_grad()
        score.backward(retain_graph=True)

        weights = torch.mean(self.gradients, dim=[2, 3], keepdim=True)
        cam = torch.sum(weights * self.activations, dim=1, keepdim=True)
        cam = F.relu(cam) 
        
        cam = cam.squeeze().cpu().detach().numpy()
        cam = cv2.resize(cam, (input_tensor.shape[3], input_tensor.shape[2]))
        
        return cam, current_score

    def release_hooks(self):
        self.handle_f.remove()
        self.handle_b.remove()

def run_gradcam_process(model_path, image_path, target_id, margins, window_size, stride):
    """
    margins: (top, bottom, left, right)
    """
    m_top, m_bottom, m_left, m_right = margins

    # 1. 모델 및 이미지 로드
    yolo = YOLO(model_path)
    model = yolo.model
    model.eval()
    for param in model.parameters():
        param.requires_grad = True

    full_img = cv2.imread(image_path)
    if full_img is None:
        raise ValueError(f"이미지를 불러올 수 없습니다: {image_path}")
    
    H, W = full_img.shape[:2]
    
    # 2. GradCAM 준비
    all_convs = [m for m in model.modules() if isinstance(m, torch.nn.Conv2d)]
    gradcam = GradCAMRaw(model, all_convs[-3])

    # 3. 윈도우 마스크 생성
    hann_1d = np.hanning(window_size)
    window_mask = np.outer(hann_1d, hann_1d)

    # 4. 누적용 어큐뮬레이터
    heatmap_accumulator = np.zeros((H, W), dtype=np.float32)
    weight_accumulator = np.zeros((H, W), dtype=np.float32)
    total_confidence = 0.0
    patch_count = 0

    # 5. 슬라이딩 윈도우 루프
    y_range = range(m_top, H - window_size - m_bottom + 1, stride)
    x_range = range(m_left, W - window_size - m_right + 1, stride)
    
    for y in y_range:
        for x in x_range:
            patch = full_img[y:y+window_size, x:x+window_size]
            patch_rgb = cv2.cvtColor(patch, cv2.COLOR_BGR2RGB)
            
            input_tensor = patch_rgb.astype(np.float32) / 255.0
            input_tensor = torch.from_numpy(input_tensor.transpose(2, 0, 1)).unsqueeze(0)
            input_tensor.requires_grad = True

            raw_cam, patch_score = gradcam(input_tensor, target_id)

            total_confidence += patch_score
            patch_count += 1

            weighted_cam = raw_cam * window_mask
            heatmap_accumulator[y:y+window_size, x:x+window_size] += weighted_cam
            weight_accumulator[y:y+window_size, x:x+window_size] += window_mask

    # 6. 후처리
    gradcam.release_hooks() # 메모리 해제용 훅 제거
    avg_confidence = (total_confidence / patch_count) * 100 if patch_count > 0 else 0
    
    weight_accumulator[weight_accumulator == 0] = 1.0
    avg_heatmap = heatmap_accumulator / weight_accumulator
    
    global_min, global_max = np.min(avg_heatmap), np.max(avg_heatmap)
    norm_heatmap = (avg_heatmap - global_min) / (global_max - global_min + 1e-8)
    norm_heatmap[norm_heatmap < 0.25] = 0

    heatmap_uint8 = np.uint8(255 * norm_heatmap)
    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    result = cv2.addWeighted(full_img, 0.6, heatmap_color, 0.4, 0)

    # # 결과물에 텍스트 삽입
    # text = f"Class {target_id}: {avg_confidence:.2f}%"
    # cv2.putText(result, text, (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 2, cv2.LINE_AA)

    # 7. 파일 저장 (경로 중복 방지를 위해 temp 폴더나 유니크한 이름 권장)
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)
    
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = f"result_{target_id}_{timestamp}.png"
    output_path = os.path.join(output_dir, filename)
    
    cv2.imwrite(output_path, result)
    
    return output_path, avg_confidence