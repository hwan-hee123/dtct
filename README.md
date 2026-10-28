# dtct. v13
- 순서: 히어로 → concept → 360 → CMF → Detail → Contact
- 히어로 이미지: assets/images/main.jpg (현재 shot2 임시). 고해상도로 교체하세요.
- 폰트는 fonts/ 폴더에 직접 넣기 (And Then It Ends, Gmarket Sans)
- CMF·Detail 내용은 landing.js 의 CMF_ITEMS / DETAIL_GROUPS 배열 수정 (이미지는 public/cmf, public/detail)


## v13 변경
- 메인 = 왼쪽 dtct. 로고 + 오른쪽 360° 턴테이블(배경 왼쪽 확장), 턴테이블 버튼 제거(드래그만), 자동회전↔드래그↔3초 후 재개
- 순서: 메인(360) → Concept → CMF → Detail → Contact, 하단 카테고리 내비
- 폰트: 로고 = And Then It Ends 단독 / 그 외 = Gmarket Sans 단독. 파일 넣는 법은 fonts/README.txt

## v13 수정본 변경 (10/24)
- 메인: 텍스트(제목·부제·한글 설명·Project/Designer/Tools) 교체, 턴테이블 안내 문구 제거, 제품 뷰어를 CSS로 폭의 10% 왼쪽 이동 (app.js 무수정)
- 팔레트 토큰 추가(styles.css :root), Concept 텍스트 약 15% 확대
- CMF 6종 3×2 / Detail 4종(a·b 2뷰) 정적 그리드, 태블릿 2열·모바일 1열
- 주의: public/detail 의 "01_front frame_a/b.png" 는 파일명에 공백이 있어 그대로 사용(encodeURI). *_c.png 는 지시서에 없어 미사용(파일은 보존)

## v15 변경
- 메인: 상단 마이크로 타이포(Design Portfolio / Project 001 / Mobility / Interface / 2026), 기본 정적 렌더(renders/hero-render.png) ↔ 360° 뷰 아이콘 토글(opacity 220ms). app.js·420프레임 무수정
- Concept: 좌측 public/Vertical main image.png (폭 1/3 화면 밖), 우측 텍스트(Metadata → Concept Overview → Problem → Solution → Design Language), Role = Lead Designer
- CMF/Detail: Concept→CMF 그라데이션 제거, 두 섹션 모두 #000. Detail 은 2·3·2·4장 가로 갤러리(마우스 드래그·트랙패드·터치 스와이프, 자동재생/무한루프 없음)
- 실행: 폴더에서 정적 서버(예: python3 -m http.server) 실행 후 index.html 접속

## v16 변경
- Concept: 세로형 이미지를 가로 중앙(비율 0.6000 유지, 원본 PNG 그대로)에 크게 배치, 상단에 제목·핵심 설명·메타, 좌우 여백에 기존 Problem/Solution/Design Language 문장을 스크롤에 따라 순차 등장(opacity+translateY 20px, 700ms, 양방향). 모바일은 이미지 아래 순서대로 배치
- 히어로 대형 dtct. 로고만 1.8배 (landing.js fitLogo 의 target 값, #logo 전용)
- 턴테이블 영역 반응형 여백(.viewer/.hero-static margin, 모바일 min-height). app.js 무수정
- 턴테이블 시퀀스 교체는 새 파일이 전달되지 않아 미적용 (현재 renders/frames 420장 그대로)

## v17 변경
- 턴테이블: 새 시퀀스 TURNTABLE.107.1~421 (3840×2400 투명 PNG, 7개 ZIP 통합, 누락·중복 파일명 없음) → 웹용 renders/turntable/TURNTABLE.107.<번호>.webp (공통 크롭 2332×1366 → 0.65배 1516×888, 알파 무손실). 원본 PNG 는 프로젝트에 넣지 않음(각 6MB, 총 2.7GB). 재생성: python3 tools/build_turntable.py <원본폴더>
- app.js: FRAMES=421, PATH, BOX/SRC 값, 투명 프레임용 그리기(clearRect) 만 변경. 자동회전·드래그·3초 복귀·방향·감도는 그대로. 이전 renders/frames/frame_000~419.jpg 는 삭제하지 않고 보존
- 참고: 421번 프레임은 1번과 거의 같은 각도(바이트 동일은 아님). 반복 시 한 프레임 정지가 신경 쓰이면 app.js 의 FRAMES 를 420 으로
- 메인: 마이크로카피 3문구(주황 원형 구분점), 정적 모드 = 상단 좌측 로고·정보 + 하단 와이드 렌더(360° 모드 레이아웃 불변), 주황 사각 포인트 → 원형
- Concept: 이미지 확대(최대 960px), 텍스트 등장 14px/500ms, 등장 후 선명 유지
- CMF: 칩 캐러셀(드래그/화살표/터치/←→) + 큰 이미지·설명. Detail: 부품별 개별 캐러셀(드래그/화살표/스와이프, 원형 인디케이터, 1장짜리는 컨트롤 숨김)

## v18 변경
- 상단 정보 바: 좌 KMU Graduation Exhibition / 우 CAM·SCALE·FPS(app.js 루프의 프레임 시각으로 1초마다 실측, 실제 구현이 Canvas 2D 이므로 "CANVAS 2D" 표기)
- 주황 장식 점 제거(타이틀 옆·구분점), 캐러셀 인디케이터는 유지
- 메인 제품 사양(Product Specifications) 추가 (모바일·낮은 360° 화면에서는 숨김)
- 컨셉: 이미지 약 1.3배(최대 1248px), 진입 시 아래에서 올라옴, 첫 드래그(마우스/터치/키보드) 후 옆 설명 컬럼 표시·유지. 메인 설명과 중복되던 lead 문장 제거
- 컨셉→CMF 그라데이션, CMF 칩 호버 시 4px 상승
- 턴테이블: 프레임 421장은 360° 보기를 처음 선택(또는 아이콘에 마우스를 올림/포커스)할 때 로딩

## v19 변경
- 메인 문구(터치스크린 중심…) 삭제 (컨셉 콘텐츠 유지)
- 상단 가로선 ↔ 전환 버튼 위치 교체: 가로선은 `.showroom::after` 로 하단 고정(우측 텍스트 높이와 무관), 버튼은 상단 우측
- FPS: app.js draw() 호출 시각으로 0.5초마다 실측 (CANVAS 2D)
- 턴테이블: FRAMES=420 (TURNTABLE.107.1~420), 421번 파일은 보존·미사용
- 컨셉: 드래그 누적 거리(첫 6px 이후 80px 마다 1개)에 따라 설명이 순차 표시, 컬럼은 항상 화면 안에 위치(JS 계산), 좁은 화면에서는 하단 패널

## v20 변경
- 제품명 "디텍드" → "dtct." (Concept Solution 문장), 메인의 "Mono-Mobility … · 2026" 문구와 사양 제목 아래 실선 삭제
- Photo 모드: 상단 좌 = dtct. + 영문 타이틀 2줄 / 우 = 프로젝트 정보·사양 / 하단 = 제품 이미지(하단 가로선 좌우 끝에 맞춤, 2000×834 비율, 마스크 없음). Turntable 모드: 컬러칩(색상만)이 사양 바로 아래
- 상단 정보 바: FRAME(1~420)·FPS 는 Turntable 모드에서만. FPS = requestAnimationFrame 간격 실측(최근 1초 평균)
- 턴테이블: 1→420 순서·동시 8개 로딩, 현재 프레임 주변만 ImageBitmap 으로 미리 디코딩(전체를 메모리에 올리지 않음), 자동 회전은 준비된 프레임만 1장씩 진행(건너뛰지 않음), Photo 모드에서는 루프 정지
- CMF / Detail: 3열 격자(태블릿 2열·모바일 1열), 이전 캐러셀 제거
- Concept: 스크롤 진행에 따라 설명이 하나씩 나타나고(JS 미지원 시 그대로 표시) 드래그로도 더 빨리 열림
- 큰 모니터(≥2400px, ≥3400px)용 텍스트 크기 보정
