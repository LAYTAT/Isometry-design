#!/usr/bin/env python3
"""
DOT ASSET GENERATOR (Python version)

Converts an image with dots/circles into a TypeScript asset file.
More reliable than the JS version - uses OpenCV or PIL.

Usage:
    python scripts/generate-asset.py <input-image> <output-name> [options]

Examples:
    python scripts/generate-asset.py ./my-dots.png myNewScene
    python scripts/generate-asset.py ./design.png wheelchair --threshold 200

Options:
    --threshold <0-255>  Brightness threshold (default: 200)
    --min-area <px>      Minimum dot area in pixels (default: 10)
    --max-area <px>      Maximum dot area in pixels (default: 5000)
    --invert             Detect dark dots on light background

Requirements:
    pip install opencv-python numpy
    # OR
    pip install pillow numpy scipy
"""

import sys
import os
from pathlib import Path
from datetime import datetime

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(0)

    input_path = sys.argv[1]
    output_name = sys.argv[2]
    
    # Parse options
    threshold = 200
    min_area = 10
    max_area = 5000
    invert = False
    
    i = 3
    while i < len(sys.argv):
        if sys.argv[i] == '--threshold' and i + 1 < len(sys.argv):
            threshold = int(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == '--min-area' and i + 1 < len(sys.argv):
            min_area = int(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == '--max-area' and i + 1 < len(sys.argv):
            max_area = int(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == '--invert':
            invert = True
            i += 1
        else:
            i += 1

    print(f"Processing: {input_path}")
    print(f"Output name: {output_name}")
    print(f"Threshold: {threshold}, Min area: {min_area}, Max area: {max_area}")
    
    # Try OpenCV first, fall back to PIL
    try:
        dots, width, height = process_with_opencv(input_path, threshold, min_area, max_area, invert)
    except ImportError:
        print("OpenCV not found, trying PIL...")
        try:
            dots, width, height = process_with_pil(input_path, threshold, min_area, max_area, invert)
        except ImportError:
            print("Error: Neither OpenCV nor PIL found.")
            print("Install with: pip install opencv-python numpy")
            print("         OR: pip install pillow numpy scipy")
            sys.exit(1)
    
    print(f"Image size: {width} x {height}")
    print(f"Found {len(dots)} dots")
    
    # Sort by Y then X
    dots.sort(key=lambda d: (d[1], d[0]))
    
    # Generate TypeScript
    var_name = output_name.upper() + '_DOTS_SOURCE'
    
    output = f"""// Auto-generated dot asset
// Source image: {os.path.basename(input_path)}
// Source image resolution: {width} x {height}
// Generated: {datetime.now().isoformat()}

export const {var_name}: Array<[number, number, number]> = [
"""
    for x, y, r in dots:
        output += f"  [{x:.3f}, {y:.3f}, {r:.3f}],\n"
    output += "];\n"
    
    # Write output
    script_dir = Path(__file__).parent
    output_path = script_dir.parent / 'src' / 'assets' / f'{output_name}Dots.ts'
    output_path.write_text(output)
    
    print(f"\n✅ Generated: {output_path}")
    print(f"   {len(dots)} dots exported")
    print(f"\nTo use this asset:")
    print(f"1. Import in targets.ts:")
    print(f'   import {{ {var_name} }} from "../assets/{output_name}Dots";')
    print(f"2. Create a sampler function similar to existing ones")
    print(f"3. Add scene config in config.ts")


def process_with_opencv(input_path, threshold, min_area, max_area, invert):
    import cv2
    import numpy as np
    
    # Read image
    img = cv2.imread(input_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Could not read image: {input_path}")
    
    height, width = img.shape
    
    # Invert if needed
    if invert:
        img = 255 - img
    
    # Threshold
    _, binary = cv2.threshold(img, threshold, 255, cv2.THRESH_BINARY)
    
    # Find contours
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    dots = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if min_area <= area <= max_area:
            # Get centroid
            M = cv2.moments(contour)
            if M["m00"] > 0:
                cx = M["m10"] / M["m00"]
                cy = M["m01"] / M["m00"]
                # Estimate radius from area
                radius = (area / 3.14159) ** 0.5
                dots.append((round(cx, 3), round(cy, 3), round(radius, 3)))
    
    return dots, width, height


def process_with_pil(input_path, threshold, min_area, max_area, invert):
    from PIL import Image
    import numpy as np
    from scipy import ndimage
    
    # Read image
    img = Image.open(input_path).convert('L')
    width, height = img.size
    arr = np.array(img)
    
    # Invert if needed
    if invert:
        arr = 255 - arr
    
    # Threshold
    binary = arr >= threshold
    
    # Label connected components
    labeled, num_features = ndimage.label(binary)
    
    dots = []
    for i in range(1, num_features + 1):
        component = labeled == i
        area = np.sum(component)
        
        if min_area <= area <= max_area:
            # Get centroid
            y_coords, x_coords = np.where(component)
            cx = np.mean(x_coords)
            cy = np.mean(y_coords)
            # Estimate radius from area
            radius = (area / 3.14159) ** 0.5
            dots.append((round(cx, 3), round(cy, 3), round(radius, 3)))
    
    return dots, width, height


if __name__ == '__main__':
    main()
