# Generates a 1200x630 Open Graph share card (dark, coder style).
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
PAD = 84

# --- dark vertical gradient background (hero-like) ---
top = (14, 23, 19)     # #0e1713
bot = (5, 9, 8)        # #050908
img = Image.new("RGB", (W, H), bot)
px = img.load()
for y in range(H):
    t = y / H
    r = int(top[0] * (1 - t) + bot[0] * t)
    g = int(top[1] * (1 - t) + bot[1] * t)
    b = int(top[2] * (1 - t) + bot[2] * t)
    for x in range(W):
        px[x, y] = (r, g, b)

draw = ImageDraw.Draw(img)

# subtle top accent line
draw.rectangle([0, 0, W, 5], fill=(24, 210, 110))

# --- fonts (Consolas = clean monospace, matches the coding vibe) ---
FB = "C:/Windows/Fonts/consolab.ttf"   # bold
FR = "C:/Windows/Fonts/consola.ttf"    # regular
f_name = ImageFont.truetype(FB, 76)
f_role = ImageFont.truetype(FB, 34)
f_dom  = ImageFont.truetype(FR, 28)

name = "Jamshid Mirkhadjayev"
role = "IT Project Manager  ·  Java Backend Developer"
dom  = "mirkhadjayev.uz"

# --- name (off-white) ---
ny = 248
draw.text((PAD, ny), name, font=f_name, fill=(238, 255, 243))

# --- role (green), wrap if wider than usable width ---
usable = W - PAD * 2
def wrap(text, font):
    words, lines, cur = text.split(" "), [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=font) <= usable:
            cur = test
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

ry = ny + 100
for line in wrap(role, f_role):
    draw.text((PAD, ry), line, font=f_role, fill=(46, 207, 116))
    ry += 46

# --- domain (muted), bottom-right ---
dw = draw.textlength(dom, font=f_dom)
draw.text((W - PAD - dw, H - 70), dom, font=f_dom, fill=(120, 138, 126))

img.save("assets/img/og-card.png", "PNG", optimize=True)
print("saved assets/img/og-card.png", img.size)
