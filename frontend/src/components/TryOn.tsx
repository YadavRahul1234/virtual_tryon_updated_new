import React, { useState } from 'react';
import { measurementApi, MeasurementResponse } from '../services/api';
import { Upload, Ruler, RefreshCw, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { SizeRecommendations } from './SizeRecommendations';

interface TryOnProps {
  onGenerateAvatar: (image: string) => void;
}

export const TryOn: React.FC<TryOnProps> = ({ onGenerateAvatar }) => {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [height, setHeight] = useState<string>('170');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MeasurementResponse | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'side') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'front') setFrontImage(event.target?.result as string);
        else setSideImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateMeasurements = async () => {
    if (!frontImage) {
      setError('Front image is required');
      return;
    }

    if (!height || Number(height) <= 0) {
      setError('Please enter a valid height');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await measurementApi.calculate({
        front_image: frontImage,
        side_image: sideImage,
        calibration_height: Number(height),
        units: units,
        gender: gender,
      });

      if (data.success) {
        setResults(data);
      } else {
        setError(data.message || 'Failed to calculate measurements');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during calculation');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Virtual Try-On & Body Analysis</h2>
        <p className="text-gray-600 dark:text-gray-400">Upload your photos to get started with AI-powered measurements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Front View (Required)</label>
          <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center">
            {frontImage ? (
              <img src={frontImage} className="w-full h-full object-cover" alt="Front Preview" />
            ) : (
              <div className="text-center p-6">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload front view</p>
              </div>
            )}
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'front')} />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Side View (Optional)</label>
          <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center">
            {sideImage ? (
              <img src={sideImage} className="w-full h-full object-cover" alt="Side Preview" />
            ) : (
              <div className="text-center p-6">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload side view</p>
              </div>
            )}
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'side')} />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-6 mb-12">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Gender</label>
            <select 
              value={gender} 
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Height</label>
            <div className="flex">
              <input 
                type="number" 
                value={height} 
                onChange={(e) => {
                  const val = e.target.value;
                  // Remove leading zeros
                  setHeight(val === '' ? '' : String(Number(val)));
                }}
                className="w-full px-4 py-2 rounded-l-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0"
              />
              <select 
                value={units} 
                onChange={(e) => setUnits(e.target.value as any)}
                className="px-2 py-2 rounded-r-lg border-l-0 border dark:bg-gray-600 dark:border-gray-600 dark:text-white"
              >
                <option value="metric">cm</option>
                <option value="imperial">in</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={calculateMeasurements}
          disabled={loading || !frontImage}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all"
        >
          {loading ? <RefreshCw className="animate-spin" /> : <Ruler />}
          <span>{loading ? 'Processing...' : 'Calculate Measurements'}</span>
        </button>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center space-x-2 border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {results && (
        <div className="max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 space-y-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center dark:text-white">Body Measurements</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(results.measurements).map(([key, value]) => {
                if (key === 'units') return null;
                return (
                  <div key={key} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-900 transition-colors group">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider group-hover:text-violet-500 transition-colors">{key.replace('_', ' ')}</p>
                    <p className="text-2xl font-bold text-violet-600">{Number(value).toFixed(1)} <span className="text-sm text-gray-400">{results.measurements.units}</span></p>
                  </div>
                );
              })}
            </div>
          </div>

          {!showRecommendations ? (
            <div className="flex justify-center">
              <button
                onClick={() => setShowRecommendations(true)}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 to-indigo-600 font-pj rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-600 hover:shadow-xl hover:shadow-violet-500/20 transform hover:-translate-y-1 active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>Get Size Recommendation</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          ) : (
            <SizeRecommendations 
              measurements={results.measurements as any} 
              gender={gender} 
              onGenerateAvatar={() => onGenerateAvatar(frontImage || '')}
            />
          )}
        </div>
      )}
    </div>
  );
};
