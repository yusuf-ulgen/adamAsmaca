from PIL import Image

def crop_transparent(path):
    print("Processing", path)
    try:
        img = Image.open(path).convert('RGBA')
        b = img.getbbox()
        if b:
            img = img.crop(b)
            img.save(path)
            print("Cropped", path)
    except Exception as e:
        print("Error on", path, e)

crop_transparent('adam_asmaca_logo.png')
crop_transparent('logo.png')
