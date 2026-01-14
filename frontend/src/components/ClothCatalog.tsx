import React, { useState, useMemo } from 'react';
import { Search, Check, ShoppingBag, Shirt, Plus } from 'lucide-react';

export interface ClothItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  image: string;
}

const CLOTH_DATA: ClothItem[] = [
  {
    id: '15',
    title: 'Casual Autumn Combo',
    brand: 'Metro vibe',
    category: 'Casual',
    image: '/mustard-jacket-outfit.jpg',
  },
  {
    id: '14',
    title: 'Classic Black Formal Suit',
    brand: 'Aristocrat',
    category: 'Formal',
    image: '/black-formal-suit.png',
  },
  {
    id: '13',
    title: 'Urban Comfort Brown Set',
    brand: 'Metro vibe',
    category: 'Casual',
    image: '/brown-ribbed-set.png',
  },
  {
    id: '12',
    title: 'Classic Checkered Casual',
    brand: 'Executive',
    category: 'Casual',
    image: '/blue-check-outfit.png',
  },
  {
    id: '11',
    title: 'Smart Casual Maroon Combo',
    brand: 'Executive',
    category: 'Casual',
    image: '/burgundy-outfit.jpg',
  },
  {
    id: '1',
    title: 'Executive Navy Suit',
    brand: 'Aristocrat',
    category: 'Formal',
    image: 'https://images.unsplash.com/photo-1507679799987-c7377ec48696?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '2',
    title: 'Floral Spring Dress',
    brand: 'Bloom',
    category: 'Summer',
    image: 'https://images.unsplash.com/photo-1539008835279-43467f5303a9?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '3',
    title: 'Urban Streetwear Combo',
    brand: 'Metro vibe',
    category: 'Streetwear',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '4',
    title: 'Premium Gym Set',
    brand: 'Active Pro',
    category: 'Sportswear',
    image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '5',
    title: 'Linen Summer Set',
    brand: 'Coastal',
    category: 'Summer',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '6',
    title: 'Casual Weekend Look',
    brand: 'Daily Wear',
    category: 'Casual',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '7',
    title: 'Modern Tuxedo',
    brand: 'Black Tie',
    category: 'Formal',
    image: 'https://images.unsplash.com/photo-1593032465106-47eb04433695?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '8',
    title: 'Vintage Denim Look',
    brand: 'Indigo Heritage',
    category: 'Streetwear',
    image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '9',
    title: 'Boho Chic Outfit',
    brand: 'Free Spirit',
    category: 'Style',
    image: 'https://images.unsplash.com/photo-1520975954732-45dd21d83192?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '10',
    title: 'Work From Home Classic',
    brand: 'Relaxed',
    category: 'Casual',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800',
  }
];

const CATEGORIES = ['All', 'Formal', 'Casual', 'Streetwear', 'Sportswear', 'Summer', 'Style'];

interface ClothCatalogProps {
  onToggleSelect: (item: ClothItem) => void;
  selectedItems: ClothItem[];
}

export const ClothCatalog: React.FC<ClothCatalogProps> = ({ onToggleSelect, selectedItems }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = useMemo(() => {
    return CLOTH_DATA.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-8 h-full flex flex-col">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-2xl font-black flex items-center gap-2 dark:text-white">
            <ShoppingBag className="w-6 h-6 text-violet-600" />
            Outfit Gallery
          </h3>
          
          <div className="relative group max-w-xs w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search combos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 ring-2 ring-violet-200 dark:ring-violet-900/50' 
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 overflow-y-auto flex-1 pr-2 custom-scrollbar min-h-[400px]">
        {filteredItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => onToggleSelect(item)}
            className={`group cursor-pointer relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
              selectedItems.some(i => i.id === item.id) 
                ? 'border-violet-600 shadow-xl shadow-violet-500/10 scale-[1.02]' 
                : 'border-transparent bg-gray-50 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800 hover:border-violet-200 dark:hover:border-violet-800'
            }`}
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400';
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {selectedItems.some(i => i.id === item.id) && (
                <div className="absolute top-3 right-3 p-1.5 bg-violet-600 rounded-full shadow-lg text-white animate-in zoom-in duration-300">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[10px] uppercase tracking-widest font-black opacity-80 mb-0.5">{item.brand}</p>
                <p className="font-bold text-sm truncate">{item.title}</p>
              </div>
            </div>
            
            <div className="p-4 flex items-center justify-between">
               <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 capitalize">
                 {item.category}
               </span>
                <button className={`p-2 rounded-xl transition-all ${
                  selectedItems.some(i => i.id === item.id)
                    ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/40'
                    : 'bg-white dark:bg-gray-800 text-gray-400 group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-lg'
                }`}>
                  <Plus className="w-4 h-4" />
                </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-50">
            <Shirt className="w-12 h-12 mb-4" />
            <p className="text-gray-500 font-medium">No items found matching your filter</p>
          </div>
        )}
      </div>
    </div>
  );
};
