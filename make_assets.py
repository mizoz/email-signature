# Builds the social icons, demo images and og.png. Run: python3 make_assets.py (needs Pillow)
from PIL import Image, ImageDraw, ImageFont
import os

BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

COLORS = {
    "slate": "#374151",
    "black": "#111111",
    "gray": "#6b7280",
    "blue": "#2563eb",
    "teal": "#0f766e",
    "red": "#b91c1c",
    "purple": "#6d28d9",
}
# plain letter marks, not the official logos
NETS = {
    "linkedin": "in",
    "x": "X",
    "instagram": "IG",
    "facebook": "f",
    "youtube": None,  # play triangle
    "tiktok": "TT",
    "github": "GH",
}

os.makedirs("icons", exist_ok=True)
os.makedirs("demo", exist_ok=True)


def font(path, size):
    return ImageFont.truetype(path, size)


def icon(net, color):
    big = 288  # draw 3x then shrink for smooth edges
    im = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((0, 0, big - 1, big - 1), fill=color)
    mark = NETS[net]
    if mark is None:
        c = big / 2
        d.polygon([(c - 40, c - 58), (c - 40, c + 58), (c + 62, c)], fill="white")
    else:
        size = {1: 150, 2: 112}[len(mark)]
        f = font(BOLD, size)
        d.text((big / 2, big / 2 + 4), mark, font=f, fill="white", anchor="mm")
    im.resize((96, 96), Image.LANCZOS).save(f"icons/{net}-{color_name}.png", optimize=True)


for color_name, color in COLORS.items():
    for net in NETS:
        icon(net, color)

# demo headshot placeholder
im = Image.new("RGB", (240, 240), "#dbeafe")
d = ImageDraw.Draw(im)
d.ellipse((70, 40, 170, 140), fill="#2563eb")
d.ellipse((30, 150, 210, 330), fill="#2563eb")
im.save("demo/photo.png", optimize=True)

# demo logo, transparent
im = Image.new("RGBA", (360, 96), (0, 0, 0, 0))
d = ImageDraw.Draw(im)
d.rounded_rectangle((0, 12, 72, 84), radius=16, fill="#2563eb")
d.text((36, 48), "N", font=font(BOLD, 48), fill="white", anchor="mm")
d.text((88, 48), "Northwind", font=font(BOLD, 44), fill="#1f2937", anchor="lm")
im.save("demo/logo.png", optimize=True)

# og image
W, H = 1200, 630
im = Image.new("RGB", (W, H), "#0f172a")
d = ImageDraw.Draw(im)
d.rectangle((0, 0, 18, H), fill="#3b82f6")
d.text((90, 150), "Email Signature Generator", font=font(BOLD, 68), fill="white")
d.text((90, 250), "Free HTML signatures for Gmail, Outlook", font=font(REG, 40), fill="#cbd5e1")
d.text((90, 302), "and Apple Mail. No watermark.", font=font(REG, 40), fill="#cbd5e1")
# little signature mock
d.rounded_rectangle((90, 390, 760, 530), radius=14, fill="#1e293b")
d.ellipse((115, 415, 205, 505), fill="#3b82f6")
d.rectangle((230, 418, 232, 502), fill="#3b82f6")
d.text((255, 420), "Alex Rivera", font=font(BOLD, 34), fill="white")
d.text((255, 465), "Marketing Manager | Northwind", font=font(REG, 24), fill="#94a3b8")
d.text((90, 560), "free · no sign-up · mizoz.github.io", font=font(REG, 30), fill="#94a3b8")
im.save("og.png", optimize=True)
print("done")
