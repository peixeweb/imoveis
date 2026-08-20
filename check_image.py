from PIL import Image
img = Image.open('public/logopj.webp')
print(f'Size: {img.size}')
print(f'Mode: {img.mode}')

# Check if there are any transparent pixels
has_transparency = False
for y in range(img.height):
    for x in range(img.width):
        pixel = img.getpixel((x, y))
        if len(pixel) == 4 and pixel[3] < 255:
            has_transparency = True
            break
    if has_transparency:
        break

print(f'Has Transparent Pixels: {has_transparency}')

# Also check corners to see if background is transparent
corners = [(0,0), (img.width-1,0), (0,img.height-1), (img.width-1,img.height-1)]
for corner in corners:
    pixel = img.getpixel(corner)
    print(f'Corner {corner}: {pixel}')