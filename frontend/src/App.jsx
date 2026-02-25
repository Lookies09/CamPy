import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';

// 전반적인 폰트와 배경색 설정
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Pretendard', -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    background-color: #0f1115;
    color: #e0e0e0;
  }
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const SidePanel = styled.aside`
  width: 360px;
  background: #1a1d23;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #2d3139;
  z-index: 10;
  overflow-y: auto; // 설정이 많아질 경우를 대비해 스크롤 허용
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #3e4451; border-radius: 10px; }
`;

const Header = styled.div`
  margin-bottom: 10px;
  h2 { font-size: 24px; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.5px; }
  p { font-size: 13px; color: #8e949e; margin-top: 8px; }
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  text-transform: uppercase;
  color: #5d636f;
  letter-spacing: 1px;
  margin-bottom: 16px;
  margin-top: 24px;
`;

const MainContent = styled.main`
  flex: 1;
  background: radial-gradient(circle at center, #1e2229 0%, #0f1115 100%);
  display: flex;
  flex-direction: column;
  padding: 40px;
  position: relative;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px; // 18px에서 24px로 늘려 가독성 확보

  label { font-size: 13px; color: #abb2bf; margin-bottom: 10px; font-weight: 600; }
  
  input[type="number"], input[type="text"] {
    background: #252932;
    border: 1px solid #3e4451;
    border-radius: 8px;
    padding: 12px; // 패딩을 조금 더 줘서 클릭하기 편하게 수정
    color: #fff;
    font-size: 14px;
    width: 100%;
    box-sizing: border-box; // 박스 사이즈 고정
    transition: all 0.2s ease;
    &:focus { outline: none; border-color: #007AFF; box-shadow: 0 0 0 2px rgba(0,122,255,0.2); }
  }

  input[type="file"] {
    font-size: 12px;
    color: #8e949e;
    &::-webkit-file-upload-button {
      background: #3e4451;
      border: none;
      border-radius: 4px;
      color: white;
      padding: 6px 12px;
      margin-right: 10px;
      cursor: pointer;
      &:hover { background: #4d5565; }
    }
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #007AFF 0%, #0051ff 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
  margin-top: auto;
  box-shadow: 0 4px 15px rgba(0,122,255,0.3);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,122,255,0.4);
  }
  &:active { transform: translateY(0); }
`;

const ViewPort = styled.div`
  flex: 1;
  border: 1px dashed #3e4451;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,0.02);
  color: #5d636f;
  
  svg { width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }
`;

const ResultImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  object-fit: contain;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0,122,255,0.2);
  border-top-color: #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const OpenFolderLink = styled.div`
  font-size: 18px;
  color: #8e949e;
  text-decoration: underline;
  text-align: center;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: #fff; }
`;

const GuideContainer = styled.div`
  margin-bottom: 10px;
  background: #252932;
  border-radius: 8px;
  border: 1px solid #3e4451;
  position: relative; 
  z-index: 100; 
`;

const GuideHeader = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #2d3139;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  &:hover { background: #353b45; }
`;

const GuideContent = styled.div`
  position: absolute;
  top: calc(100% + 8px); 
  left: 0;
  right: 0;
  
  opacity: ${props => (props.$isOpen ? '1' : '0')};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  transform: ${props => (props.$isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  background: #1e2229; 
  padding: 20px;
  font-size: 12px;
  line-height: 1.6;
  color: #abb2bf;
  border-radius: 12px;
  border: 1px solid #3e4451;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
  
  section {
    margin-bottom: 16px;
  }

  strong { 
    color: #fff; 
    display: block; 
    margin-bottom: 4px;
    font-size: 13px;
  }

  ul { 
    padding-left: 16px; 
    margin: 0; 
    list-style-type: circle;
  }

  li { 
    margin-bottom: 6px; 
    &::marker { color: #007AFF; } 
  }
`;

const Signature = styled.div`
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid #2d3139;
  text-align: right;
  font-size: 11px;
  color: #5d636f;
  font-style: italic;

  span {
    color: #8e949e;
    font-weight: 600;
    font-style: normal;
    margin-left: 4px;
  }
`;

export default function App() {
  const [modelFile, setModelFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultImg, setResultImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avgScore, setAvgScore] = useState(null);

  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [params, setParams] = useState({
    targetClass: 0,
    windowSize: 100,
    stride: 50,
    marginTop: 20, 
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20
  });

  const handleModelChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setModelFile(file);
      setResultImg(null); 
      setAvgScore(null);  
    }
  };

  // 이미지 선택 시 미리보기 생성
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setResultImg(null); 
      setAvgScore(null);  
    }
  };

  const openOutputFolder = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/open-folder');
    } catch (e) {
      console.log("폴더 열기 실패:", e);
      alert("폴더를 열 수 없습니다.");
    }
  };

  const handleRun = async () => {
    if (!modelFile || !imageFile) {
      alert("모델 파일과 분석할 이미지를 모두 선택해주세요!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    formData.append('model_file', modelFile);
    formData.append('image_file', imageFile);
    
    formData.append('target_id', params.targetClass.toString());
    formData.append('window_size', params.windowSize.toString());
    formData.append('stride', params.stride.toString());
    formData.append('m_top', params.marginTop.toString());
    formData.append('m_bottom', params.marginBottom.toString());
    formData.append('m_left', params.marginLeft.toString());
    formData.append('m_right', params.marginRight.toString());

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status === 'success') {
        const timestamp = new Date().getTime();
        const finalUrl = `http://127.0.0.1:8000/${res.data.result_path.replace("\\", "/")}?t=${timestamp}`;
        
        setResultImg(finalUrl);
        setAvgScore(res.data.confidence); 
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("분석 중 오류가 발생했습니다. 백엔드 콘솔을 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <MainContent>
          <ViewPort>
            {loading ? (
              <>
                <LoadingSpinner /> 
                <p style={{ marginTop: '20px' }}>Analyzing with Sliding Window...</p>
              </>
            ) : resultImg ? (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ResultImage src={resultImg} alt="Analysis Result" />
                  
                  {avgScore !== null && (
                    <div style={{ 
                      marginTop: '20px', 
                      fontSize: '20px', 
                      fontWeight: '800', 
                      color: '#007AFF',
                      background: 'rgba(0,122,255,0.1)',
                      padding: '8px 20px',
                      borderRadius: '100px'
                    }}>
                      Confidence: {avgScore.toFixed(2)}%
                    </div>
                  )}
                </div>
              ) : previewUrl ? (
              <ResultImage src={previewUrl} alt="Original Preview" style={{opacity: 0.5}} />
            ) : (
              <>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Ready to Analyze</p>
                <span style={{fontSize: '12px'}}>업로드한 이미지가 이곳에 표시됩니다.</span>
              </>
            )}
          </ViewPort>
        </MainContent>
        
        
        <SidePanel>
          <Header>
            <GuideContainer>
              <GuideHeader onClick={() => setIsGuideOpen(!isGuideOpen)}>
                <span>사용 설명서</span>
                <span>{isGuideOpen ? '▲' : '▼'}</span>
              </GuideHeader>
              
              <GuideContent $isOpen={isGuideOpen}>
                <h2>Campy v1.0</h2>
                <p>모델의 Grad Cam을 시각화 해주는 프로그램입니다.</p>

                <section>
                  <strong>1. Assets 설정</strong>
                  <ul>
                    <li>학습 완료된 PyTorch 모델과 분석 대상 이미지를 업로드합니다.</li>
                  </ul>
                </section>

                <section>
                  <strong>2. Analysis Parameters</strong>
                  <ul>
                    <li><strong>Target ID:</strong> 모델의 특정 클래스를 분석합니다. (단일 클래스 모델은 0 입력)</li>
                    <li><strong>Window Size:</strong> 모델 학습 시 사용된 Input 규격과 일치할 때 가장 정확합니다.</li>
                    <li><strong>Stride:</strong> 분석 윈도우의 이동 간격입니다. 값이 작을수록 정밀도는 높으나 연산 시간이 증가합니다.</li>
                  </ul>
                </section>

                <section>
                  <strong>3. Region of Interest (Margins)</strong>
                  <ul>
                    <li>이미지 가장자리의 불필요한 영역을 분석 범위에서 제외하여 노이즈를 줄입니다.</li>
                  </ul>
                </section>

                <Signature>
                  Developed by <span>김형균</span>
                </Signature>
              </GuideContent>
            </GuideContainer>
          </Header>          

          <SectionTitle>Assets</SectionTitle>
          <InputGroup>
            <label>Model Weights (.pt)</label>
            <input type="file" accept=".pt" onChange={handleModelChange} />
          </InputGroup>

          <InputGroup>
            <label>Target Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </InputGroup>

          <SectionTitle>Analysis Parameters</SectionTitle>
          <InputGroup>
            <label>클래스 아이디(Target Class ID)</label>
            <input type="number" value={params.targetClass} 
              onChange={e => setParams({...params, targetClass: parseInt(e.target.value) || 0})} />
          </InputGroup>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            <InputGroup>
              <label>영역 사이즈(Window Size)</label>
              <input type="number" value={params.windowSize} 
                onChange={e => setParams({...params, windowSize: parseInt(e.target.value) || 0})} />
            </InputGroup>
            <InputGroup>
              <label>보폭(Stride)</label>
              <input type="number" value={params.stride} 
                onChange={e => setParams({...params, stride: parseInt(e.target.value) || 0})} />
            </InputGroup>
          </div>

          <SectionTitle>Region of Interest (Margins)</SectionTitle>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            <InputGroup>
              <label>Margin Top</label>
              <input type="number" value={params.marginTop} 
                onChange={e => setParams({...params, marginTop: parseInt(e.target.value) || 0})} />
            </InputGroup>
            <InputGroup>
              <label>Margin Bottom</label>
              <input type="number" value={params.marginBottom} 
                onChange={e => setParams({...params, marginBottom: parseInt(e.target.value) || 0})} />
            </InputGroup>
            <InputGroup>
              <label>Margin Left</label>
              <input type="number" value={params.marginLeft} 
                onChange={e => setParams({...params, marginLeft: parseInt(e.target.value) || 0})} />
            </InputGroup>
            <InputGroup>
              <label>Margin Right</label>
              <input type="number" value={params.marginRight} 
                onChange={e => setParams({...params, marginRight: parseInt(e.target.value) || 0})} />
            </InputGroup>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <OpenFolderLink onClick={openOutputFolder}>
              📁 분석 결과 폴더 열기
            </OpenFolderLink>
            <ActionButton onClick={handleRun} disabled={loading}>
              {loading ? "ANALYZING..." : "RUN ANALYSIS"}
            </ActionButton>
          </div>

          
        </SidePanel>
      </Container>
    </>
  );
}