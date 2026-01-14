"""Debug actual measurements and size recommendations from API."""
import sys
sys.path.insert(0, '/home/ideal206/Documents/virtual_tryon_updated/backend')

import json
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def debug_latest_measurement():
    # Connect directly
    client = AsyncIOMotorClient("mongodb+srv://rahulyadav3idealittechno_db_user:fFqFMJCd1LXDqrwI@cluster0.b4heail.mongodb.net/")
    db = client["virtual_try_on"]
    
    # Get the most recent measurement
    measurement = await db.measurements.find_one(
        sort=[("created_at", -1)]
    )
    
    if not measurement:
        print("No measurements found in database")
        client.close()
        return
    
    print("=" * 70)
    print("LATEST MEASUREMENT FROM DATABASE")
    print("=" * 70)
    print(f"\nUser: {measurement.get('user_id', 'Unknown')}")
    print(f"Height: {measurement.get('height', 'N/A')} cm")
    print(f"Gender: {measurement.get('gender', 'N/A')}")
    
    measurements = measurement.get('measurements', {})
    print("\nBody Measurements:")
    for key, value in measurements.items():
        print(f"  {key}: {value} cm")
    
    # Now test size recommendations with these measurements
    from app.services.size_recommender import SizeRecommender
    from app.models.garment_specs import GarmentCategory
    
    recommender = SizeRecommender()
    
    test_measurements = {
        'height': measurement.get('height'),
        'shoulder_width': measurements.get('shoulder_width'),
        'chest': measurements.get('chest'),
        'waist': measurements.get('waist'),
        'hip': measurements.get('hip'),
        'inseam': measurements.get('inseam')
    }
    
    print("\n" + "=" * 70)
    print("SHIRT SIZE RECOMMENDATIONS")
    print("=" * 70)
    
    recommendations = recommender.recommend_sizes(
        test_measurements,
        GarmentCategory.MENS_SHIRT,
        top_n=3
    )
    
    for i, rec in enumerate(recommendations, 1):
        print(f"\n{i}. Size {rec.size} - Score: {rec.fit_score}/100")
        print(f"   Category: {recommender.get_fit_category(rec.fit_score)}")
        print(f"   Fit Analysis:")
        for measurement, analysis in rec.fit_analysis.items():
            print(f"     • {measurement}: {analysis}")
    
    # Show size chart for comparison
    print("\n" + "=" * 70)
    print("SIZE CHART REFERENCE (MENS_SHIRT)")
    print("=" * 70)
    with open('/home/ideal206/Documents/virtual_tryon_updated/backend/app/data/size_charts.json', 'r') as f:
        charts = json.load(f)
    
    print("\nSize | Chest | Shoulder | Expected User Type")
    print("-" * 70)
    for size, specs in charts['MENS_SHIRT']['sizes'].items():
        print(f"{size:4s} | {specs.get('chest', 'N/A'):5} | {specs.get('shoulder_width', 'N/A'):8} | ", end="")
        chest = specs.get('chest', 0)
        if chest < 90:
            print("Very slim build")
        elif chest < 95:
            print("Slim build")
        elif chest < 100:
            print("Average build")
        elif chest < 105:
            print("Athletic/Broad build")
        else:
            print("Large/Extra Large build")
    
    print("\n" + "=" * 70)
    print("ANALYSIS")
    print("=" * 70)
    print(f"Your chest: {measurements.get('chest', 'N/A')} cm")
    print(f"Your shoulder: {measurements.get('shoulder_width', 'N/A')} cm")
    print(f"Your height: {measurement.get('height', 'N/A')} cm")
    print("\nQUESTION: Do these measurements seem accurate for your body?")
    print("If they're too small, the issue is the measurement calculation.")
    print("If they're correct but sizes seem wrong, it's the size chart.")
    print("=" * 70)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(debug_latest_measurement())
