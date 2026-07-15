import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Download, Sparkles, Wand2, AlertCircle, User, Shirt, Video } from 'lucide-react';
import axios from 'axios';
import { ClothCatalog, ClothItem } from './ClothCatalog';
import { Trash2, ShoppingCart, Sparkle } from 'lucide-react';

interface VirtualTryOnStudioProps {
  userImage: string;
  onBack: () => void;
}

export const VirtualTryOnStudio: React.FC<VirtualTryOnStudioProps> = ({ userImage, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [tryOnLoading, setTryOnLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedClothes, setSelectedClothes] = useState<ClothItem[]>([]);

  const [userId] = useState(() => 'user_' + Math.random().toString(36).substring(2, 11));

  const N8N_AVATAR_WEBHOOK = import.meta.env.VITE_N8N_AVATAR_WEBHOOK;
  const N8N_CLOTH_WEBHOOK = import.meta.env.VITE_N8N_CLOTH_WEBHOOK;
  const N8N_VIDEO_WEBHOOK = import.meta.env.VITE_N8N_VIDEO_WEBHOOK || 'https://n8n.intelligens.app/webhook/try-on-video';

  const extractImageUrl = (data: any): string | null => {
    if (Array.isArray(data) && data.length > 0) {
      data = data[0].json || data[0];
    }
    if (typeof data === 'string' && data.trim().startsWith('{')) {
      try {
        data = JSON.parse(data);
      } catch (e) { }
    }

    let result = null;
    if (typeof data === 'string') {
      result = data;
    } else if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      const urlKey = keys.find(k =>
        ['avatar_url', 'output_image', 'image_url', 'url', 'output', 'result'].includes(k.toLowerCase()) ||
        k.toLowerCase().includes('url') ||
        k.toLowerCase().includes('avatar')
      );
      if (urlKey) {
        result = (data as any)[urlKey];
      } else {
        result = Object.values(data).find(v => typeof v === 'string' && (v.startsWith('http') || v.startsWith('data:')));
      }
    }

    if (result && typeof result === 'string' && (result.startsWith('http') || result.startsWith('data:'))) {
      return result.trim().replace(/^["']|["']$/g, '');
    }
    return null;
  };

  const handleSimulate = async () => {
    if (!N8N_AVATAR_WEBHOOK) {
      setError('n8n Webhook URL is not configured.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const base64Response = await fetch(userImage);
      const blob = await base64Response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'image.png');
      formData.append('outfit', selectedClothes.length > 0 ? selectedClothes[0].title : 'Casual Suit');
      formData.append('user_id', userId);

      const response = await axios.post(N8N_AVATAR_WEBHOOK, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        const imageUrl = extractImageUrl(response.data);
        if (imageUrl) {
          setAvatarImage(imageUrl);
        } else {
          setError(`Webhook response did not contain a valid image link.`);
        }
      } else {
        setError('Webhook response was empty.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process virtual try-on.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCloth = (item: ClothItem) => {
    setSelectedClothes(prev => {
      const isSelected = prev.find(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleClothTryOn = async () => {
    if (selectedClothes.length === 0) {
      setError('Please select at least one item of clothing.');
      return;
    }

    setTryOnLoading(true);
    setError(null);
    try {
      const formData = new FormData();

      // Send the ORIGINAL 2D avatar as the binary 'image'
      if (avatarImage) {
        try {
          const avatarResponse = await fetch(avatarImage);
          const avatarBlob = await avatarResponse.blob();
          formData.append('image', avatarBlob, 'avatar.png');
        } catch (e) {
          console.error('Failed to fetch avatar image as blob:', e);
          throw new Error('Could not process original avatar image for try-on.');
        }
      }

      // Add full body original user image
      if (userImage) {
        try {
          const fullBodyResponse = await fetch(userImage);
          const fullBodyBlob = await fullBodyResponse.blob();
          formData.append('full_body_image', fullBodyBlob, 'full_body.png');
        } catch (e) {
          console.error('Failed to fetch full body image as blob:', e);
        }
      }

      // Add avatar URL and selection info as text fields
      formData.append('avatar_url', avatarImage || '');
      formData.append('user_id', userId);

      // Send the first selected cloth image as binary 'cloth_image'
      if (selectedClothes.length > 0) {
        try {
          const clothResponse = await fetch(selectedClothes[0].image);
          const clothBlob = await clothResponse.blob();
          formData.append('cloth_image', clothBlob, 'cloth.png');
        } catch (e) {
          console.error('Failed to fetch cloth image as blob:', e);
        }
      }

      formData.append('selected_clothes', JSON.stringify(selectedClothes));
      formData.append('timestamp', new Date().toISOString());

      const response = await axios.post(N8N_CLOTH_WEBHOOK, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        const imageUrl = extractImageUrl(response.data);
        if (imageUrl) {
          setTryOnImage(imageUrl);
          alert('Cloth Try-On updated successfully!');
        } else {
          console.log('Cloth Try-On response:', response.data);
          alert('Cloth Try-On request sent, but no image URL was returned.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send cloth try-on request.');
    } finally {
      setTryOnLoading(false);
    }
  };

  const pollVideoStatus = async () => {
    let attempts = 0;
    const maxAttempts = 30; // Wait up to 5 minutes
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/tryon/result/${userId}`);
        if (response.data?.success && response.data?.data) {
          const dbData = response.data.data;
          const url = dbData.video_url || dbData.videoUrl || dbData.video || dbData.result_video;
          if (url) {
            setVideoUrl(url);
            setVideoLoading(false);
            clearInterval(interval);
          }
        }
      } catch (e) {
        // ignore errors during polling like 404
      }

      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setVideoLoading(false);
        setError("Video generation timed out. Please check back later.");
      }
    }, 10000); // 10 seconds interval
  };

  const handleGenerateVideo = async () => {
    if (!tryOnImage) {
      setError('No try-on avatar available to generate video.');
      return;
    }
    setVideoLoading(true);
    setError(null);
    setVideoUrl(null);
    try {
      const payload = {
        user_id: userId,
        tryon_avatar_url: tryOnImage
      };

      const response = await axios.post(N8N_VIDEO_WEBHOOK, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data) {
        pollVideoStatus(); // start polling instead of stopping loader
      } else {
        setVideoLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 500) {
        setError('Error 500: N8N workflow failed to process the request. Check N8N logs.');
      } else {
        setError(err.message || 'Failed to generate video request.');
      }
      setVideoLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Analysis
      </button>

      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Virtual Try-On <span className="text-violet-600">Studio</span></h2>
        <p className="text-gray-600 dark:text-gray-400">Experience the future of fashion with AI-powered clothing simulation.</p>
      </div>

      <div className="flex flex-row overflow-x-auto items-start justify-start max-w-full space-x-8 pb-8 mb-12 min-h-[400px]">
        {/* Step 1: Original Photo */}
        <div className="flex-shrink-0 w-72 flex flex-col items-center gap-4">
          <div className="w-full text-center">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">Step 1: Original Image</h3>
          </div>
          <div className="w-full relative bg-white dark:bg-gray-800 rounded-3xl p-2 border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden aspect-[3/4]">
            <img src={userImage} className="w-full h-full object-cover rounded-2xl" alt="Your Photo" />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex-shrink-0 w-72 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-800/20 flex flex-col items-center text-center gap-3 animate-in fade-in">
            <AlertCircle className="w-8 h-8 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Step 2: 2D Avatar */}
        <div className="flex-shrink-0 w-72 flex flex-col items-center gap-4 animate-in slide-in-from-left-4 duration-700">
          <div className="w-full text-center">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">Step 2: 2D Avatar</h3>
          </div>
          
          {avatarImage ? (
            <div className="w-full relative bg-white dark:bg-gray-800 rounded-3xl p-2 border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden aspect-[3/4]">
              <img src={avatarImage} className="w-full h-full object-cover rounded-2xl" alt="2D Avatar Result" />
            </div>
          ) : (
            <div className="w-full flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-4 border border-dashed border-gray-300 dark:border-gray-700 aspect-[3/4] text-gray-400">
              <User className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-sm">Avatar Placeholder</span>
            </div>
          )}

          {!avatarImage && (
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-3xl font-black text-lg shadow-2xl shadow-violet-500/40 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
              {loading ? 'Processing...' : 'Generate 2D Avatar'}
            </button>
          )}
        </div>

        {/* Step 3: Try-On Image */}
        {avatarImage && (
          <div className="flex-shrink-0 w-72 flex flex-col items-center gap-4 animate-in slide-in-from-left-4 duration-700">
            <div className="w-full text-center">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">Step 3: Try-On Image</h3>
            </div>
            
            {tryOnImage ? (
              <div className="w-full relative bg-white dark:bg-gray-800 rounded-3xl p-2 border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden aspect-[3/4]">
                <img src={tryOnImage} className="w-full h-full object-cover rounded-2xl" alt="Try-On Result" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <a
                    href={tryOnImage}
                    download="tryon-look.png"
                    className="p-2 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-lg transition-transform hover:scale-110"
                    title="Download Result"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-4 border border-dashed border-gray-300 dark:border-gray-700 aspect-[3/4] text-gray-400">
                <Shirt className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-sm">Try-On Placeholder</span>
              </div>
            )}

            {!tryOnImage && (
              <>
                {/* Cloth Selection */}
                <div className="w-full bg-white dark:bg-gray-800 rounded-3xl p-4 border border-violet-100 dark:border-violet-900/30 shadow-xl shadow-violet-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                      <ShoppingCart className="w-4 h-4 text-violet-600" />
                      Selected
                    </h4>
                    {selectedClothes.length > 0 && (
                      <button
                        onClick={() => setSelectedClothes([])}
                        className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {selectedClothes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedClothes.map(item => (
                        <div key={item.id} className="relative group">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-16 object-cover rounded-xl border-2 border-violet-100 dark:border-violet-900/30"
                          />
                          <button
                            onClick={() => handleToggleCloth(item)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => document.getElementById('cloth-catalog')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full py-3 border-2 border-dashed border-violet-200 dark:border-violet-800/50 rounded-xl text-center text-xs text-violet-500 font-medium hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 transition-colors"
                    >
                      Browse Clothes Catalog
                    </button>
                  )}
                </div>

                <button
                  onClick={handleClothTryOn}
                  disabled={tryOnLoading || selectedClothes.length === 0}
                  className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-3xl font-black text-lg shadow-2xl shadow-violet-500/40 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {tryOnLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Sparkle className="w-5 h-5" />}
                  {tryOnLoading ? 'Processing...' : 'Try On'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 4: Generated Video Display */}
        {tryOnImage && (
          <div className="flex-shrink-0 w-72 flex flex-col items-center gap-4 animate-in slide-in-from-left-4">
            <div className="w-full text-center">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">Step 4: Try-On Video</h3>
            </div>
            
            {videoUrl ? (
              <div className="w-full rounded-3xl overflow-hidden border-4 border-pink-500 shadow-2xl relative bg-black">
                <video src={videoUrl} controls autoPlay loop className="w-full h-auto object-cover aspect-[3/4]" />
              </div>
            ) : (
              <div className="w-full flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-4 border border-dashed border-gray-300 dark:border-gray-700 aspect-[3/4] text-gray-400">
                <Video className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-sm">Video Placeholder</span>
              </div>
            )}

            {!videoUrl && (
              <button
                onClick={handleGenerateVideo}
                disabled={videoLoading || !tryOnImage}
                className="w-full py-5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-2xl shadow-pink-500/40"
              >
                {videoLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Sparkle className="w-5 h-5" />}
                {videoLoading ? 'Generating Video...' : 'Generate Try-On Video'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Full Width Catalog below */}
      <div className="w-full" id="cloth-catalog">
        <ClothCatalog
          onToggleSelect={handleToggleCloth}
          selectedItems={selectedClothes}
        />
      </div>
    </div>
  );
};
