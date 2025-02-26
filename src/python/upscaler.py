# python/upscaler.py
import sys
import os
import base64
import io
import torch
import numpy as np
from PIL import Image
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer

def upscale_image_base64(base64_string):
    try:
        # Decode base64 string to image
        img_data = base64.b64decode(base64_string)
        img = Image.open(io.BytesIO(img_data))
        img_array = np.array(img)
        
        # Get the path to the model file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, '..'))
        model_path = os.path.join(project_root, 'public', 'models', 'RealESRGAN_x4plus.pth')
        
        # Load model
        state_dict = torch.load(model_path, map_location=torch.device('cpu'))['params_ema']
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
        model.load_state_dict(state_dict, strict=True)
        
        # Initialize upscaler
        upscaler = RealESRGANer(
            scale=4,
            model_path=model_path,
            model=model,
            tile=400,  # Use tiling for memory efficiency
            tile_pad=10,
            pre_pad=0,
            half=False,  # Use half precision to save memory
        )
        
        # Upscale image
        output, _ = upscaler.enhance(img_array, outscale=2)  # Upscale by 2x
        
        # Convert output to base64
        output_image = Image.fromarray(output)
        buffer = io.BytesIO()
        output_image.save(buffer, format="JPEG", quality=90)
        upscaled_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return upscaled_base64
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return None

if __name__ == "__main__":
    # Read base64 input from stdin
    base64_input = sys.stdin.read().strip()
    
    # Process the image
    result = upscale_image_base64(base64_input)
    
    # Output the result
    if result:
        print(result)
    else:
        sys.exit(1)