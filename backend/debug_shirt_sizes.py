"""Debug script to check shirt size recommendations."""
import sys
sys.path.insert(0, '/home/ideal206/Documents/virtual_tryon_updated/backend')

from app.services.size_recommender import SizeRecommender
from app.models.garment_specs import GarmentCategory

# Test with typical male measurements (170cm height)
test_measurements = {
    'height': 170,
    'shoulder_width': 45,  # Skeleton shoulder-to-shoulder
    'chest': 95,  # Chest circumference
    'waist': 80,  # Waist circumference
    'hip': 100,  # Hip circumference
    'inseam': 80
}

recommender = SizeRecommender()

print("=" * 60)
print("DEBUG: Shirt Size Recommendation Analysis")
print("=" * 60)
print("\nUser Measurements:")
for key, val in test_measurements.items():
    print(f"  {key}: {val} cm")

print("\n" + "=" * 60)
print("MENS_SHIRT Size Chart:")
print("=" * 60)

# Show size chart
import json
with open('/home/ideal206/Documents/virtual_tryon_updated/backend/app/data/size_charts.json', 'r') as f:
    charts = json.load(f)

print("\nSize | Chest | Waist | Shoulder | Height Range")
print("-" * 60)
for size, specs in charts['MENS_SHIRT']['sizes'].items():
    print(f"{size:4s} | {specs.get('chest', 'N/A'):5} | {specs.get('waist', 'N/A'):5} | {specs.get('shoulder_width', 'N/A'):8} | {specs.get('height_range', 'N/A')}")

print("\n" + "=" * 60)
print("RECOMMENDATIONS:")
print("=" * 60)

recommendations = recommender.recommend_sizes(
    test_measurements,
    GarmentCategory.MENS_SHIRT,
    top_n=5
)

for i, rec in enumerate(recommendations, 1):
    print(f"\n{i}. Size {rec.size} - Fit Score: {rec.fit_score}/100")
    print(f"   Fit Category: {recommender.get_fit_category(rec.fit_score)}")
    print(f"   Fit Analysis:")
    for measurement, analysis in rec.fit_analysis.items():
        print(f"     • {measurement}: {analysis}")

print("\n" + "=" * 60)
print("EXPECTED RESULT: Should recommend size M (chest 97cm)")
print("For a 170cm male with 95cm chest")
print("=" * 60)
