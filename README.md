# Fast Doctor — General App (Web, React/TS)

모바일 우선 웹앱(MPA 수준, Router 포함, PWA 준비) — **깃허브 레포지토리 기준**으로 구성.
- 설계 근거: 업로드된 설계안/데이터(`docs/`, `src/data/`) 반영
- 주요 기능: 증상 입력·분류(KTAS 질문 흐름), 위급도 게이지, 권장 조치 요약, 지도+병원 추천, 사용자 프로필
- 외부 연동: OpenAI API(권장 조치 요약), Kakao Map JS SDK(지도), 로컬 장치(아두이노) 센서 브리지, 별도 파이썬 키패드

## 빠른 시작 (Windows 기준)
```bat
scripts\dev.bat
```
첫 실행 시 자동으로 `npm i` 후 개발 서버가 5173 포트에서 뜹니다.  
키패드/센서 브리지는 별도 .bat로 실행하세요.

## 환경변수
`.env` 또는 `.env.local`에 아래를 설정하세요.
```
VITE_OPENAI_API_KEY=sk-...
VITE_KAKAO_MAP_APP_KEY=여기에_키
VITE_SENSOR_BRIDGE_WS=ws://127.0.0.1:8787
VITE_KEYPAD_WS=ws://127.0.0.1:8765
```

## 설계 반영 체크리스트
- [x] FD-001 증상 입력/챗봇 + KTAS 흐름표 일부 구현 (json 트리 기반)
- [x] 위급도 게이지(0~100) / 임계치 데모
- [x] “지도로 이동하기” 버튼과 Kakao Map 자리표시자
- [x] FD-002 병원 추천 스코어러(거리/평점/혼잡도 가중치; 혼잡도 미제공 시 재가중)
- [x] FD-003 사용자 프로필(로컬 암호화 대신 로컬스토리지 데모; 동의 토글)
- [x] 오프라인 우선(PWA 준비 파일), 모바일 최적화 레이아웃
- [x] 센서 브리지(Node.js, 시리얼→WebSocket) 스켈레톤
- [x] 파이썬 온스크린 키패드(WebSocket) 스켈레톤
- [x] GitHub Actions: 빌드 확인용 CI

> 병원 마스터 데이터/평점/혼잡도는 실제 운영 데이터로 교체하세요. KakaoMap 스크립트 로드 후 `MapView` 컴포넌트를 활성화합니다.

## Kakao Map 연결
`index.html` 에서 SDK 스크립트를 키로 로드:
```html
<script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey={your_key}&libraries=services"></script>
```
또는 `react-kakao-maps-sdk`를 사용해도 됩니다. (`MapView.tsx` 참조)

## 아두이노 센서 브리지
`sensor_bridge/README.md` 를 참고해 시리얼 포트를 설정하고 `scripts\run-sensor-bridge.bat` 로 실행하세요.
앱은 `VITE_SENSOR_BRIDGE_WS` 로부터 실시간 체온/심박 데이터를 구독합니다.

## 파이썬 온스크린 키패드
`scripts\run-keypad.bat` 로 실행합니다.  
키입력은 `VITE_KEYPAD_WS` 로 전송되고, 브라우저가 이를 받아 입력창에 반영합니다.

## 빌드
```bash
npm run build
npx serve -s dist
```

## 폴더 구조
```
fast-doctor/
  src/
    pages/              # FD-001/002/003 화면
    components/         # 공용 컴포넌트(게이지, 리스트, 맵 자리표시자 등)
    hooks/              # KTAS, 센서, 스페셜티 훅
    services/           # OpenAI, 추천 스코어러, 지오 유틸
    data/               # kcd_specialty.json, ktas_* (업로드본 포함)
  kiosk_keyboard/       # 파이썬 키패드 (WS 8765)
  sensor_bridge/        # Node 시리얼→WS 브리지 (WS 8787)
  scripts/              # .bat 실행기
  docs/                 # 설계안 등 참조자료
```
