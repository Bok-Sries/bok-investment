#\!/usr/bin/env python3
"""
BOK 투자 - 여러 아이콘 디자인 옵션
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os

def create_icon_option1(size):
    """옵션1: 큰 검은색 '福' + 테두리"""
    img = Image.new('RGB', (size, size), '#000000')
    draw = ImageDraw.Draw(img)
    center = size // 2
    
    # 노란색 원
    radius = int(size * 0.42)
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], fill='#FFD700')
    
    # 금색 테두리
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                 outline='#DAA520', width=int(size*0.02))
    
    # 큰 검은색 '福'
    try:
        font_paths = ["/System/Library/Fonts/STHeiti Medium.ttc", 
                     "/usr/share/fonts/opentype/noto/NotoSerifCJK-Medium.ttc"]
        font = None
        for path in font_paths:
            try:
                font = ImageFont.truetype(path, int(size * 0.45))
                break
            except: pass
        if not font: font = ImageFont.load_default()
        
        text = "福"
        bbox = draw.textbbox((0, 0), text, font=font)
        x = center - (bbox[2]-bbox[0])//2
        y = center - (bbox[3]-bbox[1])//2
        draw.text((x, y), text, fill='#000000', font=font)
    except: pass
    
    return img

def create_icon_option2(size):
    """옵션2: 흰색 '福' + 검은색 아웃라인"""
    img = Image.new('RGB', (size, size), '#000000')
    draw = ImageDraw.Draw(img)
    center = size // 2
    
    # 노란색 원
    radius = int(size * 0.42)
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], fill='#FFD700')
    
    # 금색 테두리
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                 outline='#DAA520', width=int(size*0.02))
    
    # 흰색 '福' + 검은색 아웃라인
    try:
        font_paths = ["/System/Library/Fonts/STHeiti Medium.ttc",
                     "/usr/share/fonts/opentype/noto/NotoSerifCJK-Medium.ttc"]
        font = None
        for path in font_paths:
            try:
                font = ImageFont.truetype(path, int(size * 0.45))
                break
            except: pass
        if not font: font = ImageFont.load_default()
        
        text = "福"
        bbox = draw.textbbox((0, 0), text, font=font)
        x = center - (bbox[2]-bbox[0])//2
        y = center - (bbox[3]-bbox[1])//2
        
        # 아웃라인 효과
        for adj_x in [-2, -1, 0, 1, 2]:
            for adj_y in [-2, -1, 0, 1, 2]:
                if adj_x \!= 0 or adj_y \!= 0:
                    draw.text((x+adj_x, y+adj_y), text, fill='#000000', font=font)
        
        # 흰색 텍스트
        draw.text((x, y), text, fill='#FFFFFF', font=font)
    except: pass
    
    return img

def create_icon_option3(size):
    """옵션3: 간단한 심볼 (◇ 다이아몬드)"""
    img = Image.new('RGB', (size, size), '#000000')
    draw = ImageDraw.Draw(img)
    center = size // 2
    
    # 노란색 원
    radius = int(size * 0.42)
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], fill='#FFD700')
    
    # 금색 테두리
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                 outline='#DAA520', width=int(size*0.02))
    
    # 검은색 다이아몬드 심볼
    diamond_size = int(size * 0.2)
    points = [
        (center, center - diamond_size),
        (center + diamond_size, center),
        (center, center + diamond_size),
        (center - diamond_size, center),
    ]
    draw.polygon(points, fill='#000000', outline='#000000', width=2)
    
    return img

def create_icon_option4(size):
    """옵션4: 더 작은 검은색 '福' (더 선명)"""
    img = Image.new('RGB', (size, size), '#000000')
    draw = ImageDraw.Draw(img)
    center = size // 2
    
    # 노란색 원
    radius = int(size * 0.42)
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], fill='#FFD700')
    
    # 금색 테두리
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                 outline='#DAA520', width=int(size*0.02))
    
    # 중간 크기 검은색 '福'
    try:
        font_paths = ["/System/Library/Fonts/STHeiti Medium.ttc",
                     "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc"]
        font = None
        for path in font_paths:
            try:
                font = ImageFont.truetype(path, int(size * 0.35))
                break
            except: pass
        if not font: font = ImageFont.load_default()
        
        text = "福"
        bbox = draw.textbbox((0, 0), text, font=font)
        x = center - (bbox[2]-bbox[0])//2
        y = center - (bbox[3]-bbox[1])//2 - int(size*0.02)
        draw.text((x, y), text, fill='#000000', font=font)
    except: pass
    
    return img

def create_icon_option5(size):
    """옵션5: 검은색 테두리 + 큰 '福'"""
    img = Image.new('RGB', (size, size), '#000000')
    draw = ImageDraw.Draw(img)
    center = size // 2
    
    # 노란색 원
    radius = int(size * 0.42)
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], fill='#FFD700')
    
    # 검은색 테두리 (금색 대신)
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                 outline='#000000', width=int(size*0.03))
    
    # 큰 검은색 '福'
    try:
        font_paths = ["/System/Library/Fonts/STHeiti Medium.ttc",
                     "/usr/share/fonts/opentype/noto/NotoSerifCJK-Medium.ttc"]
        font = None
        for path in font_paths:
            try:
                font = ImageFont.truetype(path, int(size * 0.42))
                break
            except: pass
        if not font: font = ImageFont.load_default()
        
        text = "福"
        bbox = draw.textbbox((0, 0), text, font=font)
        x = center - (bbox[2]-bbox[0])//2
        y = center - (bbox[3]-bbox[1])//2
        draw.text((x, y), text, fill='#000000', font=font)
    except: pass
    
    return img

def create_icon_option6(size):
    """옵션6: 굵은 검은색 아웃라인 '福'"""
    img = Image.new('RGB', (size, size), '#000000')
    draw = ImageDraw.Draw(img)
    center = size // 2
    
    # 노란색 원
    radius = int(size * 0.42)
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], fill='#FFD700')
    
    # 금색 테두리
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                 outline='#DAA520', width=int(size*0.02))
    
    # 아웃라인만 있는 검은색 '福'
    try:
        font_paths = ["/System/Library/Fonts/STHeiti Medium.ttc",
                     "/usr/share/fonts/opentype/noto/NotoSerifCJK-Medium.ttc"]
        font = None
        for path in font_paths:
            try:
                font = ImageFont.truetype(path, int(size * 0.45))
                break
            except: pass
        if not font: font = ImageFont.load_default()
        
        text = "福"
        bbox = draw.textbbox((0, 0), text, font=font)
        x = center - (bbox[2]-bbox[0])//2
        y = center - (bbox[3]-bbox[1])//2
        
        # 굵은 아웃라인
        for adj_x in range(-3, 4):
            for adj_y in range(-3, 4):
                if adj_x \!= 0 or adj_y \!= 0:
                    draw.text((x+adj_x, y+adj_y), text, fill='#000000', font=font)
        
        # 흰색 텍스트 위에 겹치기
        draw.text((x, y), text, fill='#FFFFFF', font=font)
    except: pass
    
    return img

# 아이콘 생성
base_path = os.path.dirname(__file__)
options = [
    (create_icon_option1, "option1_큰검은색福.png", "옵션1: 큰 검은색 '福'"),
    (create_icon_option2, "option2_흰색아웃라인.png", "옵션2: 흰색 '福' + 검은색 아웃라인"),
    (create_icon_option3, "option3_다이아몬드.png", "옵션3: 검은색 다이아몬드 심볼"),
    (create_icon_option4, "option4_중간크기.png", "옵션4: 중간 크기 검은색 '福'"),
    (create_icon_option5, "option5_검은테두리.png", "옵션5: 검은색 테두리 + 큰 '福'"),
    (create_icon_option6, "option6_아웃라인.png", "옵션6: 아웃라인 '福' (흰색)"),
]

print("🎨 BOK 투자 아이콘 옵션 생성 중...\n")
for func, filename, description in options:
    img = func(256)
    path = os.path.join(base_path, filename)
    img.save(path, format='PNG')
    print(f"✅ {description}")
    print(f"   {filename}\n")

print("완료\! 6개 옵션이 생성되었습니다.")
print("마음에 드는 디자인을 선택해주세요\!")

