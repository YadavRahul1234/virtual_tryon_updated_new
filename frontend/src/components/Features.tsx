import { Scan, Shield, Zap, TrendingDown, Brain, Users } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Scan,
      title: 'AI Pose Analysis',
      description: 'Advanced computer vision technology analyzes your body measurements from a simple photo or scan.',
      color: 'blue',
    },
    {
      icon: Brain,
      title: 'Smart Recommendations',
      description: 'Machine learning algorithms provide hyper-accurate size recommendations across all brands.',
      color: 'cyan',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get your perfect size in seconds. No manual measurements, no guesswork, just accuracy.',
      color: 'blue',
    },
    {
      icon: TrendingDown,
      title: 'Reduce Returns',
      description: 'Cut return rates by up to 85% with precise sizing that matches your exact measurements.',
      color: 'cyan',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is encrypted and secure. We never share your measurements with third parties.',
      color: 'blue',
    },
    {
      icon: Users,
      title: 'Universal Compatibility',
      description: 'Works seamlessly with all major e-commerce platforms and thousands of fashion brands.',
      color: 'cyan',
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative">
      <div className="absolute -top-40 right-0 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4 animate-slide-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            Why Choose <span className="gradient-text">Pose2Fit?</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Cutting-edge technology meets fashion to deliver the most accurate sizing solution in the industry
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl transition-all duration-300 hover:shadow-xl border border-transparent animate-slide-up stagger-${index + 1}`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                feature.color === 'blue'
                  ? 'from-blue-500 to-blue-600'
                  : 'from-cyan-500 to-cyan-600'
              } flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
