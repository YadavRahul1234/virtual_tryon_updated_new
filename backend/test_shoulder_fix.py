"""Quick test to verify the new shoulder calculation works"""
import sys
sys.path.insert(0, '/home/ideal206/Documents/virtual_tryon_updated/backend')

import numpy as np
from app.services.measurement_calculator import MeasurementCalculator
from app.services.pose_detector import PoseLandmark

# Create a simple test
calc = MeasurementCalculator()

# Mock data - 180cm person
h, w = 800, 600
landmarks = [None] * 33

# Set required landmarks
landmarks[PoseLandmark.NOSE] = {'x': 0.5, 'y': 0.1, 'z': 0, 'visibility': 0.9}
landmarks[PoseLandmark.LEFT_SHOULDER] = {'x': 0.4, 'y': 0.2, 'z': 0, 'visibility': 0.9}
landmarks[PoseLandmark.RIGHT_SHOULDER] = {'x': 0.6, 'y': 0.2, 'z': 0, 'visibility': 0.9}
landmarks[PoseLandmark.LEFT_HIP] = {'x': 0.42, 'y': 0.424, 'z': 0, 'visibility': 0.9}
landmarks[PoseLandmark.RIGHT_HIP] = {'x': 0.58, 'y': 0.424, 'z': 0, 'visibility': 0.9}
landmarks[PoseLandmark.LEFT_ANKLE] = {'x': 0.45, 'y': 0.9, 'z': 0, 'visibility': 0.9}
landmarks[PoseLandmark.RIGHT_ANKLE] = {'x': 0.55, 'y': 0.9, 'z': 0, 'visibility': 0.9}

# Create a mock mask with realistic shoulder width at shoulder level
mask = np.zeros((h, w), dtype=np.float32)
shoulder_y_px = int(h * 0.2)

# Shoulder should be about 26% of height for clothing
# For 180cm person, shoulder should be ~47cm
# If person spans 0.8 of image height (80% of 800px = 640px)
# and that represents 180cm, then 47cm shoulder = (47/180) * 640 = 167px

# Draw a body with realistic proportions
for y in range(h):
    if y < shoulder_y_px - 20:
        w_at_y = 60  # Head
    elif y < shoulder_y_px + 20:
        w_at_y = 180  # Shoulders (realistic for 180cm person)
    elif y < int(h * 0.424):  # Hip level
        w_at_y = 150  # Torso tapering
    else:
        w_at_y = 140  # Hips and legs
    
    cx = w // 2
    start_x = max(0, cx - w_at_y // 2)
    end_x = min(w, cx + w_at_y // 2)
    mask[y, start_x:end_x] = 1.0

front_landmarks = {
    'landmarks': landmarks,
    'image_height': h,
    'image_width': w,
    'segmentation_mask': mask,
    'confidence': 0.9
}

# Calculate
results = calc.calculate_measurements(front_landmarks, None, 180.0, gender="male")

print("=" * 70)
print("SHOULDER WIDTH CALCULATION TEST")
print("=" * 70)
print(f"Height: {results.get('height', 'N/A')} cm (expected: 180)")
print(f"Shoulder: {results.get('shoulder_width', 'N/A')} cm (expected: ~47)")
print(f"Chest: {results.get('chest', 'N/A')} cm")

if results.get('shoulder_width', 0) > 45:
    print("\n✓ PASS: Shoulder width is realistic (>45cm)")
else:
    print(f"\n✗ FAIL: Shoulder width too small ({results.get('shoulder_width', 0)}cm)")
print("=" * 70)
