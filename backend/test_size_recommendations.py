"""Test category-specific size recommendations."""
import sys
sys.path.insert(0, '/home/ideal206/Documents/virtual_tryon_updated/backend')

from app.services.size_recommender import SizeRecommender
from app.models.garment_specs import GarmentCategory

def test_shirt_recommendations():
    """Test shirt size recommendations with various body types."""
    recommender = SizeRecommender()
    
    test_cases = [
        {
            'name': 'Average build (should get M)',
            'measurements': {'height': 170, 'shoulder_width': 45, 'chest': 95, 'waist': 80},
            'expected_top_size': 'M'
        },
        {
            'name': 'Slim build (should get S)',
            'measurements': {'height': 170, 'shoulder_width': 44, 'chest': 91, 'waist': 78},
            'expected_top_size': 'S'
        },
        {
            'name': 'Athletic build (should get L)',
            'measurements': {'height': 180, 'shoulder_width': 49, 'chest': 102, 'waist': 85},
            'expected_top_size': 'L'
        }
    ]
    
    print("=" * 70)
    print("SHIRT SIZE RECOMMENDATION TESTS")
    print("=" * 70)
    
    all_passed = True
    
    for test in test_cases:
        print(f"\n{test['name']}")
        print(f"  Measurements: {test['measurements']}")
        
        recommendations = recommender.recommend_sizes(
            test['measurements'],
            GarmentCategory.MENS_SHIRT,
            top_n=3
        )
        
        top_size = recommendations[0].size
        print(f"  Expected: {test['expected_top_size']}")
        print(f"  Got: {top_size} (score: {recommendations[0].fit_score})")
        
        if top_size == test['expected_top_size']:
            print(f"  ✓ PASS")
        else:
            print(f"  ✗ FAIL")
            all_passed = False
    
    print("\n" + "=" * 70)
    if all_passed:
        print("ALL TESTS PASSED ✓")
    else:
        print("SOME TESTS FAILED ✗")
    print("=" * 70)
    
    return all_passed

if __name__ == "__main__":
    success = test_shirt_recommendations()
    sys.exit(0 if success else 1)
