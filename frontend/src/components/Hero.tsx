import { ArrowRight, User } from 'lucide-react';

interface HeroProps {
  onStartTryOn: () => void;
}

export function Hero({ onStartTryOn }: HeroProps) {
  const handleStart = () => {
    onStartTryOn();
    const tryOnSection = document.getElementById('try-on');
    if (tryOnSection) {
      tryOnSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
              Find Your<br />
              <span className="gradient-text inline-block">Perfect Fit</span>
              ,<br />
              Every Time
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed animate-fade-in stagger-2">
              Revolutionary AI technology that analyzes your body pose and measurements to recommend the perfect size across all fashion categories. Say goodbye to returns and sizing frustration.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in stagger-3">
              <button 
                onClick={handleStart}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold text-lg transition-all hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center space-x-2 group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-lg font-semibold text-lg transition-all hover:shadow-lg">
                Watch Demo
              </button>
            </div>

            <div className="flex items-center space-x-8 pt-4 flex-wrap gap-4">
              <div className="animate-fade-in stagger-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">99.2%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</div>
              </div>
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
              <div className="animate-fade-in stagger-5">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">85%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Fewer Returns</div>
              </div>
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
              <div className="animate-fade-in stagger-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">2M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Users</div>
              </div>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-3xl opacity-30 animate-pulse-glow"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center relative overflow-hidden">
                {/* Radar Rings */}
                <div className="absolute w-32 h-32 rounded-full border-2 border-blue-500/30 animate-radar"></div>
                <div className="absolute w-32 h-32 rounded-full border-2 border-cyan-500/20 animate-radar [animation-delay:1s]"></div>
                
                {/* Scanning Line */}
                <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] z-20 animate-scan"></div>
                
                <div className="text-center space-y-4 relative z-10">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center animate-scale-in relative group/icon shadow-xl">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Scanning Your Pose...</p>
                  <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
