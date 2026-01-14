import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Download, Sparkles, Wand2, AlertCircle } from 'lucide-react';
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
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [baseAvatar, setBaseAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedClothes, setSelectedClothes] = useState<ClothItem[]>([]);

  const N8N_AVATAR_WEBHOOK = 'https://n8n.intelligens.app/webhook/avatar_url';
  const N8N_CLOTH_WEBHOOK = 'https://n8n.intelligens.app/webhook/cloth_json_data';

  const extractImageUrl = (data: any): string | null => {
    if (Array.isArray(data) && data.length > 0) {
      data = data[0].json || data[0];
    }
    if (typeof data === 'string' && data.trim().startsWith('{')) {
      try {
        data = JSON.parse(data);
      } catch (e) {}
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

      const response = await axios.post(N8N_AVATAR_WEBHOOK, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        const imageUrl = extractImageUrl(response.data);
        if (imageUrl) {
          setResultImage(imageUrl);
          setBaseAvatar(imageUrl);
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
      if (baseAvatar) {
        try {
          const avatarResponse = await fetch(baseAvatar);
          const avatarBlob = await avatarResponse.blob();
          formData.append('image', avatarBlob, 'avatar.png');
        } catch (e) {
          console.error('Failed to fetch avatar image as blob:', e);
          throw new Error('Could not process original avatar image for try-on.');
        }
      }

      // Add avatar URL and selection info as text fields
      // Add avatar URL and selection info as text fields
      formData.append('avatar_url', resultImage || '');
      
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
          setResultImage(imageUrl);
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

      <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
        {/* Left: Original Photo */}
        <div className="space-y-6">
          <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
             <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-2 border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden aspect-[3/4]">
               <img src={userImage} className="w-full h-full object-cover rounded-2xl" alt="Your Photo" />
               <div className="absolute top-4 left-4 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 Input Photo
               </div>
             </div>
          </div>
        </div>

        {/* Right: n8n Output */}
        <div className="space-y-6">
          <div className="relative group flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-gray-50/50 dark:bg-gray-800/30 w-full aspect-[3/4] animate-pulse">
                <div className="flex flex-col items-center gap-4 animate-in zoom-in-95">
                  <div className="relative">
                    <RefreshCw className="w-16 h-16 text-violet-600 animate-spin" />
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium italic">Processing your magic look...</p>
                </div>
              </div>
            ) : resultImage ? (
              <div className="w-full p-2 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden aspect-[3/4] animate-in slide-in-from-right-10 duration-700 relative">
                <img src={resultImage} className="w-full h-full object-cover rounded-2xl" alt="AI Generated Result" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <a 
                    href={resultImage} 
                    download="generated-look.png"
                    className="p-3 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-lg transition-transform hover:scale-110"
                    title="Download Result"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
                <div className="absolute top-4 left-4 px-4 py-2 bg-violet-600 rounded-full text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                   <Wand2 className="w-3 h-3" />
                   AI Output
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-gray-50/50 dark:bg-gray-800/30 w-full aspect-[3/4]">
                <Wand2 className="w-16 h-16 text-gray-300 mb-4" />
                <h4 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-2">Ready to see the result?</h4>
                <p className="text-sm text-gray-400 max-w-xs">Click the button below to start the virtual try-on simulation powered by n8n.</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-3xl font-black text-xl shadow-2xl shadow-violet-500/40 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin w-6 h-6" /> : <Wand2 className="w-6 h-6" />}
            {loading ? 'Processing...' : 'Start Try-On Magic'}
          </button>

          {resultImage && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-violet-100 dark:border-violet-900/30 shadow-xl shadow-violet-500/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-violet-600" />
                    Selected Clothes
                    <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-600 px-2 py-0.5 rounded-full text-xs">
                      {selectedClothes.length}
                    </span>
                  </h4>
                  {selectedClothes.length > 0 && (
                    <button 
                      onClick={() => setSelectedClothes([])}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {selectedClothes.length > 0 ? (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {selectedClothes.map(item => (
                      <div key={item.id} className="relative group">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-16 h-20 object-cover rounded-xl border-2 border-violet-100 dark:border-violet-900/30" 
                        />
                        <button 
                          onClick={() => handleToggleCloth(item)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="absolute inset-x-0 bottom-0 bg-black/40 text-[8px] text-white p-1 text-center rounded-b-xl truncate">
                          {item.title}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-gray-400 italic">
                    Select clothes from the catalog below
                  </div>
                )}

                <button
                  onClick={handleClothTryOn}
                  disabled={tryOnLoading || selectedClothes.length === 0}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20"
                >
                  {tryOnLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Sparkle className="w-5 h-5 text-yellow-300" />}
                  {tryOnLoading ? 'Processing Try-On...' : 'Confirm Cloth Try-On'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-800/20 flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Width Catalog below */}
      <div className="w-full">
        <ClothCatalog 
          onToggleSelect={handleToggleCloth} 
          selectedItems={selectedClothes} 
        />
      </div>
    </div>
  );
};
