
import numpy as np
import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.measurement_calculator import MeasurementCalculator
from app.services.pose_detector import PoseLandmark

def create_mock_mask(height, width, top_y, bottom_y, waist_y, shoulder_y, hip_y):
    mask = np.zeros((height, width), dtype=np.float32)
    
    # Simple hourglass shape for testing
    for y in range(top_y, bottom_y):
        # Center x
        cx = width // 2
        
        # Width variation
        if y < shoulder_y:
            current_w = 60 # Head/Neck
        elif y < waist_y:
            # Interpolate from shoulder to waist (decreasing)
            ratio = (y - shoulder_y) / (waist_y - shoulder_y)
            current_w = 160 - (ratio * 40) # 160 -> 120 pixels
        elif y < hip_y:
            # Interpolate from waist to hip (increasing)
            ratio = (y - waist_y) / (hip_y - waist_y)
            current_w = 120 + (ratio * 50) # 120 -> 170 pixels
        else:
            current_w = 170 - ((y - hip_y) * 0.2)
            
        start_x = int(cx - current_w // 2)
        end_x = int(cx + current_w // 2)
        mask[y, start_x:end_x] = 1.0
        
    return mask

def test_measurement_refinement():
    calculator = MeasurementCalculator()
    
    # Mock data dimensions
    h, w = 1000, 800
    
    # Define landmark positions (initialize all 33)
    landmarks = [{'x': 0, 'y': 0, 'z': 0, 'visibility': 0} for _ in range(33)]
    
    landmarks[PoseLandmark.NOSE] = {'x': 0.5, 'y': 0.1, 'z': 0, 'visibility': 0.9}
    landmarks[PoseLandmark.LEFT_SHOULDER] = {'x': 0.4, 'y': 0.2, 'z': 0, 'visibility': 0.9}
    landmarks[PoseLandmark.RIGHT_SHOULDER] = {'x': 0.6, 'y': 0.2, 'z': 0, 'visibility': 0.9}
    # For a person spanning 0.1 to 0.9 (Total range 0.8), torso is 0.8 * 0.28 = 0.224
    # Shoulder y is 0.2, so Hip y should be 0.2 + 0.224 = 0.424
    landmarks[PoseLandmark.LEFT_HIP] = {'x': 0.42, 'y': 0.424, 'z': 0, 'visibility': 0.9}
    landmarks[PoseLandmark.RIGHT_HIP] = {'x': 0.58, 'y': 0.424, 'z': 0, 'visibility': 0.9}
    landmarks[PoseLandmark.LEFT_KNEE] = {'x': 0.43, 'y': 0.7, 'z': 0, 'visibility': 0.9}
    landmarks[PoseLandmark.RIGHT_KNEE] = {'x': 0.57, 'y': 0.7, 'z': 0, 'visibility': 0.9}
    landmarks[PoseLandmark.LEFT_ANKLE] = {'x': 0.45, 'y': 0.9, 'z': 0, 'visibility': 0.9}
    landmarks[PoseLandmark.RIGHT_ANKLE] = {'x': 0.55, 'y': 0.9, 'z': 0, 'visibility': 0.9}
    
    # Create mask: shoulder width is 0.2*800=160px.
    # At 170cm, cf = (0.9-0.1)*1000 / 170 = 4.7 px/cm
    # 160px / 4.7 = 34cm shoulder width.
    mask = create_mock_mask(h, w, 100, 900, 380, 200, 500)
    
    # SCENARIO 1: High Confidence
    print("--- SCENARIO 1: High Confidence (Confidence = 0.9) ---")
    front_landmarks_high = {
        'landmarks': landmarks,
        'image_height': h,
        'image_width': w,
        'segmentation_mask': mask,
        'confidence': 0.9
    }
    
    res_high = calculator.calculate_measurements(front_landmarks_high, None, 170.0, gender="male")
    for k, v in res_high.items():
        print(f"  {k}: {v}")
    
    # SCENARIO 2: Low Confidence (Should pull towards AE)
    print("\n--- SCENARIO 2: Low Confidence (Confidence = 0.5) ---")
    # Low confidence should make it gravitate more to AE.
    # For a 170cm male, AE Chest = 170 * 0.55 = 93.5cm.
    # Our mock CV Chest (at shoulder y=200) width=100px -> 100/4.7 = 21.2cm. 
    # Depth fallback is 0.75 * width = 15.9cm. 
    # CV Circ ~ 58cm (very small for mock).
    # Fused should be significantly higher than 58cm due to AE (93.5cm).
    
    front_landmarks_low = front_landmarks_high.copy()
    front_landmarks_low['confidence'] = 0.5
    
    res_low = calculator.calculate_measurements(front_landmarks_low, None, 170.0, gender="male")
    for k, v in res_low.items():
        print(f"  {k}: {v}")
        
    # SCENARIO 3: Ankle Cutoff (Should trigger Torso Calibration)
    print("\n--- SCENARIO 3: Ankle Cutoff (Shoulder-to-Hip Calibration) ---")
    cutoff_landmarks = [lm.copy() for lm in landmarks]
    # Set ankles to very bottom edge
    cutoff_landmarks[PoseLandmark.LEFT_ANKLE]['y'] = 0.99 
    cutoff_landmarks[PoseLandmark.RIGHT_ANKLE]['y'] = 0.99
    
    front_landmarks_cutoff = {
        'landmarks': cutoff_landmarks,
        'image_height': h,
        'image_width': w,
        'segmentation_mask': mask,
        'confidence': 0.9
    }
    
    res_cutoff = calculator.calculate_measurements(front_landmarks_cutoff, None, 170.0, gender="male")
    print(f"  Shoulder Width: {res_cutoff['shoulder_width']}")
    print(f"  Waist: {res_cutoff['waist']}")
    
    # Check if shoulder width is still sane (around 39cm for 170cm male)
    assert 30 < res_cutoff['shoulder_width'] < 50
    print(f"  [PASS] res_cutoff['shoulder_width'] ({res_cutoff['shoulder_width']}) is sane.")

    # SCENARIO 4: Vision Failure (Should trigger complete AE Fallback)
    print("\n--- SCENARIO 4: Vision Failure (Empty Mask Area) ---")
    # Empty mask at waist level
    broken_mask = mask.copy()
    broken_mask[300:400, :] = 0 
    
    front_landmarks_broken = {
        'landmarks': landmarks,
        'image_height': h,
        'image_width': w,
        'segmentation_mask': broken_mask,
        'confidence': 0.8
    }
    
    res_broken = calculator.calculate_measurements(front_landmarks_broken, None, 170.0, gender="male")
    print(f"  Waist: {res_broken['waist']}")
    
    # AE Waist for 170cm male is 170 * 0.48 = 81.6cm
    assert 75 < res_broken['waist'] < 90
    print(f"  [PASS] res_broken['waist'] ({res_broken['waist']}) fell back to AE correctly.")

    print("\nAll logic validation PASSED!")

if __name__ == "__main__":
    test_measurement_refinement()

if __name__ == "__main__":
    test_measurement_refinement()
