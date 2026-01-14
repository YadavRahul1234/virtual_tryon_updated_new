
import cv2
import numpy as np
import os
import sys

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from app.services.pose_detector import PoseDetector
from app.services.measurement_calculator import MeasurementCalculator

def run_repro():
    detector = PoseDetector()
    calculator = MeasurementCalculator()
    
    # Path to the user-uploaded image from metadata
    front_image_path = "/home/ideal206/.gemini/antigravity/brain/ece383e7-0cc9-466a-8264-a454aad4c584/uploaded_image_1768377507696.png"
    
    print(f"Loading image: {front_image_path}")
    img = cv2.imread(front_image_path)
    if img is None:
        print("Error: Could not load image")
        return
    
    # MediaPipe expects RGB
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    print("Detecting landmarks...")
    results = detector.detect_landmarks(rgb_img)
    if not results or not results['landmarks']:
        print("Error: No landmarks detected")
        return
    
    print(f"Landmarks detected with confidence: {results['confidence']:.2f}")
    
    # Parameters from the screenshot
    height_cm = 168.0
    gender = "male"
    
    print(f"\nCalculating measurements (Height: {height_cm}cm, Gender: {gender})...")
    measurements = calculator.calculate_measurements(
        results,
        None, # No side image in screenshot
        height_cm,
        gender=gender
    )
    
    print("\nResults:")
    for key, value in measurements.items():
        print(f"  {key}: {value}")

    # Check raw pixels for shoulders
    f_w = results['image_width']
    f_h = results['image_height']
    l_shoulder = calculator._get_landmark_point(results['landmarks'], 11, f_w, f_h)
    r_shoulder = calculator._get_landmark_point(results['landmarks'], 12, f_w, f_h)
    if l_shoulder and r_shoulder:
        dist = calculator.calculate_distance(l_shoulder, r_shoulder)
        print(f"\nRaw Shoulder Distance (Pixels): {dist:.2f}")
        # Get calibration factor to check matches
        cf = calculator.calculate_calibration_factor(results['landmarks'], f_h, height_cm, results['segmentation_mask'])
        print(f"Calibration Factor: {cf:.4f} px/cm")
        print(f"Shoulder Width (Pixels/CF): {dist/cf:.2f} cm")

if __name__ == "__main__":
    run_repro()
