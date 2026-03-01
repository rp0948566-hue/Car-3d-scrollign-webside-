from PIL import Image, ImageDraw, ImageFont

# Create image
width, height = 1080, 1920
img = Image.new("RGB", (width, height), "black")
draw = ImageDraw.Draw(img)

# Try to load a serif font (fallback if not available)
try:
    font = ImageFont.truetype("DejaVuSerif-Bold.ttf", 90)
except:
    font = ImageFont.load_default()

text = "My female friend sang this song\nfor me 🎀🎶"

# Calculate text position
bbox = draw.multiline_textbbox((0, 0), text, font=font, align="center", spacing=20)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]

x = (width - text_width) / 2
y = (height - text_height) / 2

# Draw text
draw.multiline_text((x, y), text, fill="white", font=font, align="center", spacing=20)

# Save image
path = "/mnt/data/instagram_text_image.png"
img.save(path)

path