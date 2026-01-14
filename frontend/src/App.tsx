import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { TryOn } from './components/TryOn';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Categories } from './components/Categories';
import { Footer } from './components/Footer';
import { Play } from 'lucide-react';

import { BookDemoModal } from './components/BookDemoModal';
import { WatchDemoModal } from './components/WatchDemoModal';
import { VirtualTryOnStudio } from './components/VirtualTryOnStudio';
import { PolicyPage, PolicyType } from './components/PolicyPage';

function App() {
  const [showTryOn, setShowTryOn] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isWatchDemoModalOpen, setIsWatchDemoModalOpen] = useState(false);
  const [view, setView] = useState<'main' | 'studio'>('main');
  const [policyView, setPolicyView] = useState<PolicyType | null>(null);
  const [userFrontImage, setUserFrontImage] = useState<string | null>(null);

  const handleHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setPolicyView(null);
    if (view !== 'main') {
      setView('main');
    }
    // Always scroll to top when home is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setPolicyView(null);
    
    const scrollToElement = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (view !== 'main') {
      setView('main');
      // Use a slightly longer timeout or requestAnimationFrame to ensure the component is rendered
      setTimeout(scrollToElement, 150);
    } else {
      scrollToElement();
    }
  };

  const handleShowPolicy = (type: PolicyType) => {
    setPolicyView(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (policyView) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation 
          onBookDemo={() => setIsDemoModalOpen(true)} 
          onHome={handleHome}
          onNavigate={(id, e) => handleNavigate(id, e)}
        />
        <div className="pt-20">
          <PolicyPage 
            type={policyView} 
            onBack={() => setPolicyView(null)} 
          />
        </div>
        <Footer 
          onShowPolicy={handleShowPolicy} 
          onHome={handleHome}
          onNavigate={(id, e) => handleNavigate(id, e)}
        />
        <BookDemoModal 
          isOpen={isDemoModalOpen} 
          onClose={() => setIsDemoModalOpen(false)} 
        />
        <WatchDemoModal 
          isOpen={isWatchDemoModalOpen} 
          onClose={() => setIsWatchDemoModalOpen(false)} 
        />
      </div>
    );
  }

  if (view === 'studio' && userFrontImage) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation 
          onBookDemo={() => setIsDemoModalOpen(true)} 
          onHome={handleHome}
          onNavigate={(id, e) => handleNavigate(id, e)}
        />
        <div className="pt-20">
          <VirtualTryOnStudio 
            userImage={userFrontImage} 
            onBack={() => setView('main')} 
          />
        </div>
        <Footer 
          onShowPolicy={handleShowPolicy} 
          onHome={handleHome}
          onNavigate={(id, e) => handleNavigate(id, e)}
        />
        <BookDemoModal 
          isOpen={isDemoModalOpen} 
          onClose={() => setIsDemoModalOpen(false)} 
        />
        <WatchDemoModal 
          isOpen={isWatchDemoModalOpen} 
          onClose={() => setIsWatchDemoModalOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation 
        onBookDemo={() => setIsDemoModalOpen(true)} 
        onHome={handleHome}
        onNavigate={(id, e) => handleNavigate(id, e)}
      />
      <Hero 
        onStartTryOn={() => setShowTryOn(true)} 
        onWatchDemo={() => setIsWatchDemoModalOpen(true)}
      />
      <div id="try-on" className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showTryOn ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <TryOn onGenerateAvatar={(img) => {
                setUserFrontImage(img);
                setView('studio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            </div>
          ) : (
            <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-4xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-8 animate-pulse">
                <Play className="w-10 h-10 text-violet-600 fill-violet-600" />
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                Ready to find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600">Perfect Fit?</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
                Join thousands of users who have transformed their shopping experience using our AI-powered body measurement tool.
              </p>
              <button
                onClick={() => setShowTryOn(true)}
                className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-200 bg-violet-600 font-pj rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-600 hover:bg-violet-700 shadow-xl active:scale-95"
              >
                Start Body Analysis
                <svg className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <Features />
      <HowItWorks onStartTryOn={() => setShowTryOn(true)} />
      <Categories 
        onBookDemo={() => setIsDemoModalOpen(true)} 
        onStartTryOn={() => setShowTryOn(true)}
      />
      <Footer 
        onShowPolicy={handleShowPolicy} 
        onHome={handleHome}
        onNavigate={(id, e) => handleNavigate(id, e)}
      />
      <BookDemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
      <WatchDemoModal 
        isOpen={isWatchDemoModalOpen} 
        onClose={() => setIsWatchDemoModalOpen(false)} 
      />
    </div>
  );
}

export default App;
