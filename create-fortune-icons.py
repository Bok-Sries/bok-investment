#\!/usr/bin/env python3
"""
BOK 투자 - 운세 테마 아이콘/파비콘 생성 스크립트
노란색 배경에 검은색 '福' 한자
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os

def create_fortune_icon(size, output_filename):
    """
    크기별 운세 테마 아이콘 생성
    
    요소:
    - 노란색 원형 배경
    - 금색 테두리
    - 팔괘 기호 8개 배치
    - 중앙에 한자 '福' (검은색)
    - 하단에 산 모양
    """
    
    # 이미지 생성
    img = Image.new('RGB', (size, size), '#000000')
    draw = ImageDraw.Draw(img)
    
    # 색상 정의
    yellow_bg = '#FFD700'   # 노란색/황금색 배경
    gold_color = '#DAA520'  # 진한 금색 테두리
    black_text = '#000000'  # 검은색 텍스트
    
    center = size // 2
    
    # ========== 1. 중앙 원형 배경 (노란색) ==========
    center_circle_radius = int(size * 0.42)
    draw.ellipse(
        [center - center_circle_radius, center - center_circle_radius,
         center + center_circle_radius, center + center_circle_radius],
        fill=yellow_bg
    )
    
    # ========== 2. 외부 원형 테두리 (금색) ==========
    outer_radius = int(size * 0.45)
    draw.ellipse(
        [center - outer_radius, center - outer_radius,
         center + outer_radius, center + outer_radius],
        outline=gold_color,
        width=int(size * 0.02)
    )
    
    # 외부 장식 원 (더 큰 원)
    outer_dec_radius = int(size * 0.48)
    draw.ellipse(
        [center - outer_dec_radius, center - outer_dec_radius,
         center + outer_dec_radius, center + outer_dec_radius],
        outline=gold_color,
        width=1
    )
    
    # ========== 3. 팔괘 기호 (8개 배치) ==========
    ba_gua_radius = int(size * 0.38)
    num_symbols = 8
    
    for i in range(num_symbols):
        # 각도 계산 (위에서부터 시계방향)
        angle = (360 / num_symbols) * i - 90  # 위쪽부터 시작
        rad = math.radians(angle)
        
        x = center + ba_gua_radius * math.cos(rad)
        y = center + ba_gua_radius * math.sin(rad)
        
        # 팔괘 기호를 간단한 선으로 표현
        line_length = int(size * 0.05)
        line_width = max(1, int(size * 0.008))
        
        # 각 괘마다 다른 패턴 (solid, broken line 등)
        if i % 2 == 0:
            # 솔리드 라인 (—)
            draw.line(
                [(x - line_length, y), (x + line_length, y)],
                fill=gold_color,
                width=line_width
            )
        else:
            # 브로큰 라인 (- -)
            gap = int(line_length * 0.3)
            draw.line(
                [(x - line_length, y), (x - gap, y)],
                fill=gold_color,
                width=line_width
            )
            draw.line(
                [(x + gap, y), (x + line_length, y)],
                fill=gold_color,
                width=line_width
            )
        
        # 작은 원 표시
        symbol_dot_radius = max(1, int(size * 0.012))
        draw.ellipse(
            [x - symbol_dot_radius, y - symbol_dot_radius,
             x + symbol_dot_radius, y + symbol_dot_radius],
            fill=gold_color
        )
    
    # ========== 4. 내부 원 테두리 (금색) ==========
    inner_radius = int(size * 0.32)
    draw.ellipse(
        [center - inner_radius, center - inner_radius,
         center + inner_radius, center + inner_radius],
        outline=gold_color,
        width=int(size * 0.015)
    )
    
    # ========== 5. 중앙 한자 '福' (검은색) ==========
    try:
        # Mac 시스템 폰트 시도
        font_paths = [
            "/System/Library/Fonts/STHeiti Medium.ttc",
            "/System/Library/Fonts/Songti.ttc",
            "/usr/share/fonts/opentype/noto/NotoSerifCJK-Medium.ttc",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        ]
        
        font = None
        font_size = int(size * 0.4)
        
        for font_path in font_paths:
            try:
                font = ImageFont.truetype(font_path, font_size)
                break
            except:
                continue
        
        if font is None:
            font = ImageFont.load_default()
        
        # '복' 한자 그리기
        text = "福"
        
        # 텍스트 위치 계산
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        text_x = center - text_width // 2
        text_y = center - text_height // 2 - int(size * 0.02)
        
        # 텍스트 그리기 (검은색)
        draw.text((text_x, text_y), text, fill=black_text, font=font)
        
    except Exception as e:
        print(f"폰트 렌더링 실패: {e}")
    
    # ========== 6. 하단 산 모양 ==========
    mountain_height = int(size * 0.12)
    mountain_points = [
        (center - int(size * 0.12), center + int(size * 0.20)),  # 좌측 베이스
        (center, center + int(size * 0.20) - mountain_height),    # 중앙 피크
        (center + int(size * 0.12), center + int(size * 0.20)),   # 우측 베이스
    ]
    
    draw.polygon(mountain_points, outline=gold_color, width=max(1, int(size * 0.01)))
    draw.polygon(mountain_points, fill=gold_color)
    
    return img

# ========== 파일 생성 ==========
base_path = os.path.dirname(__file__)

print("🎨 BOK 투자 운세 테마 아이콘 생성 중...\n")

# 1. 파비콘 (64x64)
print("1️⃣  파비콘 생성 (64x64)...")
favicon_img = create_fortune_icon(64, 'favicon.ico')
favicon_path = os.path.join(base_path, 'favicon.ico')
favicon_img.save(favicon_path, format='ICO', sizes=[(64, 64)])
print(f"   ✅ {favicon_path}")

# 2. 서비스 아이콘 - 중간 크기 (256x256)
print("2️⃣  서비스 아이콘 생성 (256x256 PNG)...")
icon_256_img = create_fortune_icon(256, 'icon.png')
icon_256_path = os.path.join(base_path, 'icon.png')
icon_256_img.save(icon_256_path, format='PNG')
print(f"   ✅ {icon_256_path}")

# 3. 서비스 아이콘 - 큰 크기 (512x512)
print("3️⃣  서비스 아이콘 생성 (512x512 PNG)...")
icon_512_img = create_fortune_icon(512, 'icon-large.png')
icon_512_path = os.path.join(base_path, 'icon-large.png')
icon_512_img.save(icon_512_path, format='PNG')
print(f"   ✅ {icon_512_path}")

print("\n✨ 모든 아이콘 생성 완료\!")
print("   🟡 노란색 원에 검은색 '福' 한자")

