#!/usr/bin/env python3
"""
Python CLI Greeting Card Generator
Spekctrum.com & Partner Brands
"""

import os
import sys
import argparse
from PIL import Image, ImageDraw, ImageFont

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
TEMPLATES_DIR = os.path.join(ROOT_DIR, 'assets', 'templates')
DEFAULT_OUTDIR = os.path.join(ROOT_DIR, 'output')

TEMPLATES = {
    '1': {
        'id': '1',
        'key': 'soldier',
        'name': 'Tricolour & Soldiers',
        'file': os.path.join(TEMPLATES_DIR, 'template1_soldier.jpg'),
        'font_candidates': [
            os.path.join(ROOT_DIR, 'assets', 'fonts', 'LiberationSerif-Regular.ttf'),
            '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
            '/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
        ],
        'text_color': (138, 54, 56),     # #8A3638 (Crimson maroon)
        'bg_color': (251, 243, 232),      # #FBF3E8 (Antique cream)
        'mask_comma': True,
        'comma_rect': [266, 532, 274, 546],
        'positions': {
            'bottom': {
                'anchor_x': 184,
                'anchor_y': 548,
                'baseline_y': 578,
                'font_size': 38,
                'max_width': 720,
                'leading_space': False
            },
            'side': {
                'anchor_x': 268,
                'anchor_y': 514,
                'baseline_y': 543,
                'font_size': 42,
                'max_width': 680,
                'leading_space': True
            }
        }
    },
    '2': {
        'id': '2',
        'key': 'diyas',
        'name': 'Golden Hanging Diyas',
        'file': os.path.join(TEMPLATES_DIR, 'template2_diyas.jpg'),
        'font_candidates': [
            os.path.join(ROOT_DIR, 'assets', 'fonts', 'LiberationSans-Bold.ttf'),
            '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf'
        ],
        'text_color': (122, 49, 1),       # #7A3101 (Warm chocolate brown)
        'bg_color': (254, 237, 193),      # #FEEDC1
        'mask_comma': False,
        'positions': {
            'bottom': {
                'anchor_x': 106,
                'anchor_y': 330,
                'baseline_y': 365,
                'font_size': 44,
                'max_width': 840,
                'leading_space': False
            },
            'side': {
                'anchor_x': 208,
                'anchor_y': 262,
                'baseline_y': 292,
                'font_size': 44,
                'max_width': 760,
                'leading_space': True
            }
        }
    },
    '3': {
        'id': '3',
        'key': 'corporate',
        'name': 'Corporate Reflections',
        'file': os.path.join(TEMPLATES_DIR, 'template3_corporate.jpg'),
        'font_candidates': [
            os.path.join(ROOT_DIR, 'assets', 'fonts', 'LiberationSans-Bold.ttf'),
            '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf'
        ],
        'text_color': (122, 49, 1),       # #7A3101
        'bg_color': (243, 239, 229),      # #F3EFE5
        'mask_comma': False,
        'positions': {
            'bottom': {
                'anchor_x': 129,
                'anchor_y': 170,
                'baseline_y': 205,
                'font_size': 44,
                'max_width': 820,
                'leading_space': False
            },
            'side': {
                'anchor_x': 230,
                'anchor_y': 101,
                'baseline_y': 131,
                'font_size': 44,
                'max_width': 530,
                'leading_space': True
            }
        }
    }
}

def get_font(candidates, size):
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()

def render_card(template_id, name, output_path=None, add_comma=True, position='bottom'):
    cfg = TEMPLATES[str(template_id)]
    
    if not os.path.exists(cfg['file']):
        raise FileNotFoundError(f"Template image not found: {cfg['file']}")
    
    img = Image.open(cfg['file']).convert('RGB')
    draw = ImageDraw.Draw(img)
    
    if cfg.get('mask_comma'):
        rect = cfg['comma_rect']
        draw.rectangle(rect, fill=cfg['bg_color'])
    
    pos_key = 'side' if position in ['side', 'beside'] else 'bottom'
    pos_cfg = cfg['positions'].get(pos_key, cfg['positions']['bottom'])
    
    name = name.strip()
    prefix = ' ' if pos_cfg.get('leading_space') else ''
    display_text = f"{prefix}{name}," if add_comma else f"{prefix}{name}"
    
    font_size = pos_cfg['font_size']
    font = get_font(cfg['font_candidates'], font_size)
    
    bbox = font.getbbox(display_text)
    text_width = bbox[2] - bbox[0]
    
    while text_width > pos_cfg['max_width'] and font_size > 22:
        font_size -= 2
        font = get_font(cfg['font_candidates'], font_size)
        bbox = font.getbbox(display_text)
        text_width = bbox[2] - bbox[0]
    
    draw.text((pos_cfg['anchor_x'], pos_cfg['anchor_y']), display_text, fill=cfg['text_color'], font=font)
    
    if output_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        img.save(output_path, 'JPEG', quality=98)
        print(f"Generated: {output_path}")
    
    return img

def main():
    parser = argparse.ArgumentParser(description="Diwali Greeting Card Generator (Python)")
    parser.add_argument("--name", type=str, help="Recipient name")
    parser.add_argument("--file", type=str, help="Text/CSV file with names")
    parser.add_argument("--template", type=str, default="all", choices=["1", "2", "3", "all"])
    parser.add_argument("--position", type=str, default="bottom", choices=["bottom", "side"])
    parser.add_argument("--outdir", type=str, default=DEFAULT_OUTDIR)
    parser.add_argument("--no-comma", action="store_true")
    
    args = parser.parse_args()
    names = []
    if args.name:
        names.append(args.name)
    elif args.file:
        with open(args.file, 'r', encoding='utf-8') as f:
            names.extend([line.strip().strip(',').strip('"') for line in f if line.strip()])
    else:
        try:
            val = input("Enter recipient name: ").strip()
            if val:
                names.append(val)
        except (KeyboardInterrupt, EOFError):
            sys.exit(0)
    
    if not names:
        print("No names provided. Exiting.")
        sys.exit(0)
    
    templates_to_run = ['1', '2', '3'] if args.template == 'all' else [args.template]
    os.makedirs(args.outdir, exist_ok=True)
    
    for name in names:
        safe_name = "".join([c if c.isalnum() or c in " _-" else "_" for c in name])
        for t_id in templates_to_run:
            cfg = TEMPLATES[t_id]
            out_name = f"Diwali_Greeting_{safe_name}_Template_{t_id}_{cfg['key']}_{args.position}.jpg"
            out_path = os.path.join(args.outdir, out_name)
            render_card(t_id, name, output_path=out_path, add_comma=not args.no_comma, position=args.position)

if __name__ == "__main__":
    main()
