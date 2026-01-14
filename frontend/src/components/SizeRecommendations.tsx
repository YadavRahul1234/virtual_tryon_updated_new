import React, { useState, useEffect } from 'react';
import { recommendationsApi, SizeRecommendationResponse, GarmentCategoryInfo } from '../services/api';
import { Shirt, Tag, ChevronRight, Activity, Info, Loader2, Sparkles, User } from 'lucide-react';

interface SizeRecommendationsProps {
  gender: 'male' | 'female';
  measurements: {
    shoulder_width: number;
    chest: number;
    waist: number;
    hip: number;
    height: number;
    inseam: number;
    units: string;
  };
  onGenerateAvatar: () => void;
}

export const SizeRecommendations: React.FC<SizeRecommendationsProps> = ({ measurements, gender, onGenerateAvatar }) => {
  const [categories, setCategories] = useState<GarmentCategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [recommendation, setRecommendation] = useState<SizeRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [gender]);

  // Auto-refresh recommendations when measurements change
  useEffect(() => {
    if (selectedCategory) {
      fetchRecommendation(selectedCategory);
    }
  }, [measurements]);

  const fetchCategories = async () => {
    try {
      const data: GarmentCategoryInfo[] = await recommendationsApi.getCategories();

      // Filter categories based on gender
      const filtered = data.filter(cat => {
        if (gender === 'male') {
          return cat.key.startsWith('MENS_');
        } else {
          return cat.key.startsWith('WOMENS_') || cat.key === 'DRESS';
        }
      });

      setCategories(filtered);
      if (filtered.length > 0) {
        setSelectedCategory(filtered[0].key);
        fetchRecommendation(filtered[0].key);
      }
    } catch (err) {
      setError('Failed to load garment categories');
    }
  };

  const fetchRecommendation = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await recommendationsApi.getRecommendation({
        measurements: measurements,
        garment_category: category,
      } as any); // Type cast due to minor interface mismatch if any
      setRecommendation(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchRecommendation(category);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-500" />
            Size Recommendation
          </h3>
          <p className="text-gray-500 dark:text-gray-400">Based on your unique body profile</p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat.key
                  ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">Analyzing fit data...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
          <Info className="w-5 h-5" />
          <p>{error}</p>
        </div>
      ) : recommendation && recommendation.success ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Recommendation Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -m-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

              <div className="relative">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 inline-block mb-6">
                  <Shirt className="w-8 h-8" />
                </div>
                <p className="text-white/80 font-medium mb-1">Recommended Size</p>
                <h4 className="text-6xl font-black mb-6">{recommendation.recommendations[0]?.size}</h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm bg-white/10 rounded-xl p-3">
                    <span>Fit Confidence</span>
                    <span className="font-bold">{(recommendation.recommendations[0]?.fit_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-white/10 rounded-xl p-3">
                    <span>Fit Status</span>
                    <span className="font-bold px-2 py-0.5 bg-white/20 rounded-lg">{recommendation.recommendations[0]?.fit_category}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fit Analysis Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-violet-500" />
                Measurement Analysis
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendation.recommendations[0]?.fit_analysis.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-tight mb-1">{item.measurement.replace('_', ' ')}</p>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{item.analysis}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl border border-violet-100 dark:border-violet-800/30">
                <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-2 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  BRAND TIP
                </p>
                <p className="text-sm text-violet-900 dark:text-violet-200">
                  If you prefer a closer fit, consider sizing down to <b>S</b>.
                </p>
              </div>
              <div className="flex-1 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h6 className="font-bold text-gray-900 dark:text-white">Ready for Virtual Try-On?</h6>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Generate a 2D avatar to see how clothes look on you.</p>
                </div>
                <button
                  onClick={onGenerateAvatar}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105"
                >
                  <User className="w-5 h-5" />
                  Generate 2D Avatar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          No recommendations found for this category.
        </div>
      )}
    </div>
  );
};
