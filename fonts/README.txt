dtct. 폰트 파일 넣는 곳 (이 폴더에 아래 파일명으로 저장)

[로고 — And Then It Ends]  (웹폰트는 1개만 있으면 됨)
  AndThenItEnds.woff2   (권장)  또는  AndThenItEnds.woff / AndThenItEnds.ttf / AndThenItEnds.otf

[그 외 모든 텍스트 — Gmarket Sans]  (제공 웨이트: Light 300 / Medium 500 / Bold 700, Regular 400은 없음)
  GmarketSansLight.woff2   GmarketSansMedium.woff2   GmarketSansBold.woff2
  (woff2가 없으면 .woff 또는 GmarketSansTTFLight.ttf / GmarketSansTTFMedium.ttf / GmarketSansTTFBold.ttf 도 인식)

파일명이 다르면 styles.css 맨 위 @font-face 4줄의 url()만 고치면 됩니다.
폰트 파일이 없으면 로고는 시스템 sans-serif, 본문도 시스템 sans-serif로 보입니다(서로 섞이지는 않음).
