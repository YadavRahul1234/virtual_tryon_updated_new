import { Shirt, ShoppingBag, Baby, Footprints, Watch, Sparkles } from 'lucide-react';

interface CategoriesProps {
  onBookDemo: () => void;
  onStartTryOn: () => void;
}

export function Categories({ onBookDemo, onStartTryOn }: CategoriesProps) {
  const handleStart = () => {
    onStartTryOn();
    const tryOnSection = document.getElementById('try-on');
    if (tryOnSection) {
      tryOnSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const categories = [
    {
      icon: Shirt,
      title: 'Clothing',
      description: 'Tops, pants, dresses & more',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Footprints,
      title: 'Footwear',
      description: 'Shoes, boots & sneakers',
      gradient: 'from-cyan-500 to-cyan-600',
    },
    {
      icon: ShoppingBag,
      title: 'Bags',
      description: 'Handbags, backpacks & luggage',
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      icon: Baby,
      title: 'Kids',
      description: 'Children\'s clothing & shoes',
      gradient: 'from-cyan-600 to-blue-600',
    },
    {
      icon: Watch,
      title: 'Accessories',
      description: 'Watches, belts & jewelry',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sparkles,
      title: 'Premium',
      description: 'Luxury & designer items',
      gradient: 'from-cyan-500 to-blue-500',
    },
  ];

  return (
    <section id="categories" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative">
      <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 transform -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4 animate-slide-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            Perfect Fit Across All <span className="gradient-text">Categories</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From everyday essentials to luxury items, Pose2Fit works seamlessly with every fashion category
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800 hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up stagger-${(index % 6) + 1}`}
            >
              <div className="p-8 space-y-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {category.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {category.description}
                </p>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-12 text-center text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>

          <div className="relative z-10 space-y-6 animate-slide-up">
            <h3 className="text-3xl lg:text-4xl font-bold">
              Ready to Transform Your Shopping Experience?
            </h3>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join millions of satisfied customers who never worry about sizing again
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button 
                onClick={handleStart}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-xl"
              >
                Start Free Trial
              </button>
              <button 
                onClick={onBookDemo}
                className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold text-lg hover:bg-blue-800 transition-all border-2 border-white/30 hover:scale-105 hover:shadow-xl"
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
