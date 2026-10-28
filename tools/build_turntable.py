#!/usr/bin/env python3
"""턴테이블 웹용 프레임 생성 (원본 PNG 는 수정하지 않음).
원본: TURNTABLE.107.<번호>.png (3840×2400, RGBA, 번호 1~421)
출력: renders/turntable/TURNTABLE.107.<번호>.webp  — 원본 번호·파일명 유지, 알파(투명) 유지
공통 크롭 창(전 프레임 제품 영역의 합집합 + 여백)을 모든 프레임에 동일하게 적용하므로 제품의 위치·비율은 변하지 않는다.
사용: python3 tools/build_turntable.py <원본폴더> [시작번호 끝번호]
"""
import sys, os
from PIL import Image
SRC = sys.argv[1]; A = int(sys.argv[2]) if len(sys.argv) > 2 else 1; B = int(sys.argv[3]) if len(sys.argv) > 3 else 421
CROP = (728, 505, 3060, 1871)      # 합집합 영역 (744,521)-(3044,1855) + 16px 여백 → 2332×1366
SCALE = 0.65                        # 웹 표시용 배율 (원본 대비)
QUALITY = 88                        # WebP 색 품질 (알파는 무손실 alpha_quality=100)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "renders", "turntable")
os.makedirs(OUT, exist_ok=True)
for n in range(A, B + 1):
    im = Image.open(os.path.join(SRC, f"TURNTABLE.107.{n}.png")).convert("RGBA").crop(CROP)
    im = im.resize((round(im.width * SCALE), round(im.height * SCALE)), Image.LANCZOS)
    im.save(os.path.join(OUT, f"TURNTABLE.107.{n}.webp"), "WEBP", quality=QUALITY, alpha_quality=100, method=4)
print("done", A, B, im.size)
