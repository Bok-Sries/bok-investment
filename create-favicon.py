#!/usr/bin/env python3
"""
BOK 투자 파비콘 생성 스크립트
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_favicon():
    # 파비콘 크기: 64x64 (표준 크기)
    size = (64, 64)

    # 배경색: 어두운 배경 (앱의 다크 테마 색상)
    bg_color = "#1a1a2e"  # 어두운 배경

    # 이미지 생성
    img = Image.new('RGB', size, bg_color)
    draw = ImageDraw.Draw(img)

    # 그라데이션 효과를 위해 여러 색상의 원을 그림
    # 파란색 계열 (앱의 주 색상)
    primary_color = "#6366f1"  # 인디고
    accent_color = "#10b981"   # 에메랄드 (상승 신호)

    # 배경에 그라데이션 효과 (원형)
    center = (32, 32)
    radius = 28

    # 그라데이션 원 그리기
    for i in range(radius, 0, -2):
        alpha = int(255 * (1 - i / radius) * 0.6)
        # 파란색에서 에메랄드로 변화
        if i > radius / 2:
            color = primary_color
        else:
            color = accent_color
        draw.ellipse(
            [center[0] - i, center[1] - i, center[0] + i, center[1] + i],
            outline=color,
            width=1
        )

    # 텍스트 "B" 그리기
    try:
        # 시스템 폰트 사용
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
    except:
        # 폰트를 찾을 수 없으면 기본 폰트 사용
        font = ImageFont.load_default()

    # "B" 텍스트 그리기
    text = "B"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # 중앙에 배치
    text_x = (64 - text_width) // 2
    text_y = (64 - text_height) // 2 - 2

    # 흰색 텍스트
    draw.text((text_x, text_y), text, fill="#ffffff", font=font)

    # 파비콘 저장
    favicon_path = os.path.join(os.path.dirname(__file__), "favicon.ico")
    img.save(favicon_path, format="ICO", sizes=[size])

    print(f"✅ 파비콘 생성 완료: {favicon_path}")
    print(f"   크기: {size}")
    print(f"   디자인: BOK 투자 로고 (B 문자)")

if __name__ == "__main__":
    create_favicon()
