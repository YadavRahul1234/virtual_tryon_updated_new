import { Camera, Cpu, ShoppingBag } from 'lucide-react';

interface HowItWorksProps {
  onStartTryOn: () => void;
}

export function HowItWorks({ onStartTryOn }: HowItWorksProps) {
  const handleStart = () => {
    onStartTryOn();
    const tryOnSection = document.getElementById('try-on');
    if (tryOnSection) {
      tryOnSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const steps = [
    {
      icon: Camera,
      title: 'Capture Your Pose',
      description: 'Take a quick photo or use our guided pose scanner. Our AI analyzes your body measurements instantly.',
      step: '01',
    },
    {
      icon: Cpu,
      title: 'AI Processing',
      description: 'Advanced algorithms compare your measurements with our extensive database of brand sizing.',
      step: '02',
    },
    {
      icon: ShoppingBag,
      title: 'Shop with Confidence',
      description: 'Get personalized size recommendations for every item. No more returns or sizing mistakes.',
      step: '03',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4 animate-slide-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            How <span className="gradient-text">Pose2Fit</span> Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Three simple steps to finding your perfect fit every time
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 animate-shimmer"></div>

          {steps.map((step, index) => (
            <div key={index} className={`relative animate-slide-up stagger-${index + 1}`}>
              <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:scale-105">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-125 transition-transform duration-300">
                    {step.step}
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <step.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center animate-slide-up stagger-4">
          <button 
            onClick={handleStart}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold text-lg transition-all hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105"
          >
            Try It Now - It's Free
          </button>
        </div>
      </div>
    </section>
  );
}
