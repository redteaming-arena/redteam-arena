import os, json
import hashlib
import io
from PIL import Image, ImageDraw

DB_DIR="db/json/"

def load_json(file_path):
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return json.load(f)
    return {}

def save_json(file_path, data):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)

def load_txt(file_path):
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return f.read().strip()
    return None

def save_txt(file_path, data):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w") as f:
        f.write(data)
        
        
def generate_identicon(username: str, size: int = 250) -> Image.Image:
    # Create a hash of the username
    hash_object = hashlib.md5(username.encode())
    hash_hex = hash_object.hexdigest()

    # Create a new image with a white background
    image = Image.new('RGB', (size, size), color='black')
    draw = ImageDraw.Draw(image)

    # Define colors
    colors = ['black', 'gray', 'white']

    # Calculate the size of each grid cell
    cell_size = size // 5

    # Iterate through the hash and draw the identicon
    for i in range(5):
        for j in range(3):  # We only need to draw half, then mirror it
            if int(hash_hex[i*3 + j], 16) % 2 == 0:
                color = colors[int(hash_hex[i*3 + j], 16) % 3]
                draw.rectangle(
                    [j*cell_size, i*cell_size, (j+1)*cell_size, (i+1)*cell_size],
                    fill=color
                )
                # Mirror the pixel to the right side
                draw.rectangle(
                    [(4-j)*cell_size, i*cell_size, (5-j)*cell_size, (i+1)*cell_size],
                    fill=color
                )

    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()