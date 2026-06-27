#!/bin/bash

# BOK 투자 파비콘 생성 스크립트

cd "$(dirname "$0")"

python3 << 'EOF'
from PIL import Image, ImageDraw
import os

# 파비콘 생성
size = 64
img = Image.new('RGB', (size, size), '#1a1a2e')
draw = ImageDraw.Draw(img)

# 그라데이션 배경 (원형)
for i in range(size//2, 0, -1):
    # 인디고 -> 에메랄드 그라데이션
    ratio = i / (size//2)
    r = int(99 + (16 - 99) * ratio)  # 6366f1 -> 10b981
    g = int(102 + (185 - 102) * ratio)
    b = int(241 + (129 - 241) * ratio)
    color = f'#{r:02x}{g:02x}{b:02x}'

    x = (size - 2*i) // 2
    draw.ellipse([x, x, x+2*i, x+2*i], fill=color)

# 텍스트 "B"
try:
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 44)
except:
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 44)
    except:
        font = ImageFont.load_default()

from PIL import ImageFont
draw.text((32, 34), "B", fill='white', font=font, anchor='mm')

# 저장
favicon_path = "favicon.ico"
img.save(favicon_path, format='ICO')
print(f"✅ 파비콘 생성 완료: {favicon_path}")
print(f"   크기: 64x64")
print(f"   색상: 인디고 → 에메랄드 그라데이션")
print(f"   로고: B (BOK)")
EOF
