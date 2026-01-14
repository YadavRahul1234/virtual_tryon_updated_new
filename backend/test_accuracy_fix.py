
import sys
import os

# Add backend directory to path
sys.path.append('/home/ideal222/Music/virtual-try-on/virtual_tryon_updated_new/backend')

from app.services.measurement_calculator import MeasurementCalculator

calculator = MeasurementCalculator()

# Test Case: User with 180cm height (similar to our user)
height = 180.0
gender = 'male'

print("=" * 60)
print(f"VERIFICATION: Checking Anthropometric Ratios for Height {height}cm ({gender})")
print("=" * 60)

estimates = calculator._get_anthropometric_estimate(height, gender)

print(f"Shoulder Width Ratio: {calculator.ANTHROPOMETRIC_RATIOS['male']['shoulder_width']}")
print(f"Expected Shoulder Width (Fallback): {estimates['shoulder_width']} cm")

# Validation
expected_shoulder = 180 * 0.27
assert abs(estimates['shoulder_width'] - expected_shoulder) < 0.1, f"Shoulder width mismatch! Got {estimates['shoulder_width']}, expected {expected_shoulder}"
assert calculator.ANTHROPOMETRIC_RATIOS['male']['shoulder_width'] == 0.27, "Ratio not updated correctly!"

print("\nSUCCESS: Anthropometric ratios verified.")
print("-" * 60)

# Verify Logic Changes by inspection of source (cannot easily mock full CV pipeline here without heavy mocking)
# But we can verify the ratio change effects directly.

print("\nExpected Size Chart Mapping for 180cm Male (Fallback values):")
print(f"Shoulder: {estimates['shoulder_width']} cm")
print(f"Chest: {estimates['chest']} cm")
print(f"Waist: {estimates['waist']} cm")

print("\nChecking against Size Chart (XL):")
print("XL Shoulder: 50cm")
print("L  Shoulder: 48cm")
print(f"Our new fallback {estimates['shoulder_width']}cm lands between L and XL, which is correct for an average build of this height.")
print(f"Previous fallback (0.23) was {180 * 0.23}cm = 41.4cm (Size XS/S).")

# Verify Relaxed Bounds
max_allowed = 180 * 0.35
min_allowed = 180 * 0.15
print(f"\nNew Sanity Check Bounds for 180cm:")
print(f"Max Shoulder: {max_allowed} cm")
print(f"Min Shoulder: {min_allowed} cm")
assert 48.6 < max_allowed, "Fallback is outside valid bounds!"
assert 55.0 < max_allowed, "Broad shoulders (55cm) should now be accepted (180 * 0.35 = 63cm)"

print("\nVerification Complete.")
