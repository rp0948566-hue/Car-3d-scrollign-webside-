from PIL import Image, ImageDraw, ImageFont

# Re-create image cleanly
width, height = 1080, 1920
img = Image.new("RGB", (width, height), "#000000")
draw = ImageDraw.Draw(img)

try:
    font = ImageFont.truetype("DejaVuSerif-Bold.ttf", 90)
except:
    font = ImageFont.load_default()

text = "My female friend sang this song\nfor me 🎀🎶"

bbox = draw.multiline_textbbox((0, 0), text, font=font, align="center", spacing=20)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]

x = (width - tw) // 2
y = (height - th) // 2

draw.multiline_text((x, y), text, fill="white", font=font, align="center", spacing=20)

path = "/mnt/data/female_friend_song_instagram.png"
img.save(path)

path