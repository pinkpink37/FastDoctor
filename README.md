# Fast Doctor — GitHub Pages 버전

모바일 브라우저에서 실행되는 증상 입력 → KCD8 분류 → 추천 진료과 → 지도(카카오맵) 흐름의 웹앱입니다. PWA를 포함해 홈 화면에 설치할 수 있습니다.

## 1) 폴더 구조
```
.
├─ index.html            # 증상 입력/챗봇 + 위급도(간이 KTAS) + 권장 조치
├─ map.html              # 카카오맵 — 추천 진료과 키워드로 주변 병원 검색
├─ profile.html          # 사용자 정보(나이, 기저질환, 알레르기 등)
├─ app.js / triage.js / map.js / profile.js
├─ styles.css            # 화이트/블루, 동글 버튼, 큰 폰트
├─ data/
│  ├─ kcd_specialty.json # 업로드하신 JSON을 정규화한 파일 (Top3/퍼센트 포함)
│  ├─ ktas_under15.csv   # 참고용(향후 상세 KTAS 파싱에 사용 가능)
│  └─ ktas_over15.csv    # 참고용
├─ icons/                # PWA 아이콘
├─ manifest.json         # PWA
├─ env.example.js        # 키 예시 파일
├─ env.js                # 실제 키를 넣는 파일 (배포 전 수정)
└─ service-worker.js     # 오프라인 캐싱
```

## 2) API 키 설정 (중요)
- `env.js` 파일에서
  - `OPENAI_API_KEY` : OpenAI API 키 (분류/권장조치 생성에 사용)
  - `KAKAO_JS_KEY`   : 카카오맵 JS SDK 앱키
- 퍼블릭 저장소에 진짜 키를 올리지 마세요. `env.js`를 `.gitignore` 처리한 뒤, 배포 시 GitHub Pages의 *Private Repo* 또는 별도 배포 방식을 고려하세요.

## 3) 로컬 미리보기
로컬에서 `index.html`을 파일로 여는 경우, `service-worker`나 `fetch` 제약이 있을 수 있으니 간단한 HTTP 서버를 사용하세요.

예: Python 3
```
python -m http.server 8000
# http://localhost:8000
```

## 4) GitHub Pages 배포
1. 본 폴더 전체를 GitHub 저장소 루트에 넣습니다.
2. 저장소 Settings → Pages → Branch를 `main`/`root`로 설정합니다.
3. 배포 URL이 나오면, 그 URL을 QR 코드로 만들면 됩니다.

## 5) 데이터
- `FD_disease_specialty_counts_2022_2024.json`을 `data/kcd_specialty.json`으로 정규화(Top3/%) 해 두었습니다.
- KTAS CSV(성인/소아)는 현재 앱 로직에 직접 사용하지 않고, 추후 정교화에 활용할 수 있도록 `data/`에 포함했습니다.
  - 현재 위급도는 간이 KTAS(최대 4문항) 로직으로 계산합니다.

## 6) 주의
- 이 앱은 **의료 자문이 아닙니다.** 정보 제공 목적이며, 응급 의심시 119/응급실 이용을 권장합니다.
