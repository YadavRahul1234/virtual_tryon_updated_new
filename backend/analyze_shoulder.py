"""Analyze the uploaded image to see what shoulder measurement we'd get"""
import sys
sys.path.insert(0, '/home/ideal206/Documents/virtual_tryon_updated/backend')

from PIL import Image
import numpy as np
from app.services.pose_detector import PoseDetector
from app.services.measurement_calculator import MeasurementCalculator
from app.utils.image_processor import ImageProcessor

# Load the image
img_path = "/home/ideal206/.gemini/antigravity/brain/ece383e7-0cc9-466a-8264-a454aad4c584/uploaded_image_1768377507696.png"

img = Image.open(img_path)
img_array = np.array(img)

# Convert RGBA to RGB if needed
if img_array.shape[2] == 4:
    img_array = img_array[:,:,:3]

# Detect pose
detector = PoseDetector()
landmarks_data = detector.detect_landmarks(img_array)

if not landmarks_data:
    print("❌ No pose detected in image")
    sys.exit(1)

print("=" * 70)
print("ANALYZING SHOULDER WIDTH CALCULATION")
print("=" * 70)

# Calculate with new method
calc = MeasurementCalculator()

# Let's manually check what the segmentation gives us at shoulder level
from app.services.pose_detector import PoseLandmark

landmarks = landmarks_data['landmarks']
h = landmarks_data['image_height']
w = landmarks_data['image_width']
mask = landmarks_data['segmentation_mask']

# Get shoulder landmarks
l_shoulder_norm = landmarks[PoseLandmark.LEFT_SHOULDER]
r_shoulder_norm = landmarks[PoseLandmark.RIGHT_SHOULDER]

l_shoulder_px = (int(l_shoulder_norm['x'] * w), int(l_shoulder_norm['y'] * h))
r_shoulder_px = (int(r_shoulder_norm['x'] * w), int(r_shoulder_norm['y'] * h))

# Skeletal distance (old method)
skeletal_distance_px = np.sqrt(
    (r_shoulder_px[0] - l_shoulder_px[0])**2 + 
    (r_shoulder_px[1] - l_shoulder_px[1])**2
)

print(f"\nImage size: {w}x{h}")
print(f"Landmark confidence: {landmarks_data['confidence']:.2f}")
print(f"\nLeft shoulder: {l_shoulder_px}")
print(f"Right shoulder: {r_shoulder_px}")
print(f"\nSkeletal distance (old method): {skeletal_distance_px:.1f} pixels")

# Segmentation-based width (new method)
shoulder_y = (l_shoulder_px[1] + r_shoulder_px[1]) // 2
print(f"Shoulder Y-level: {shoulder_y}")

if mask is not None:
    # Get width at shoulder level
    row = mask[shoulder_y, :]
    body_pixels = np.where(row > 0.5)[0]
    
    if len(body_pixels) > 0:
        seg_width_px = body_pixels[-1] - body_pixels[0]
        print(f"Segmentation width (new method): {seg_width_px:.1f} pixels")
        print(f"Segmentation width with 0.92 correction: {seg_width_px * 0.92:.1f} pixels")
        
        print(f"\n📊 Ratio: Segmentation / Skeletal = {seg_width_px / skeletal_distance_px:.2f}x")
        
        if seg_width_px / skeletal_distance_px > 1.1:
            print("✓ Segmentation method captures more width (expected)")
        else:
            print("⚠️  Segmentation width similar to skeletal - may indicate arms down")
    else:
        print("❌ No body mask found at shoulder level")
else:
    print(" No segmentation mask available")

print("=" * 70)
