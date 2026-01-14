import { Activity, Mail, MapPin, Phone } from 'lucide-react';

interface FooterProps {
  onShowPolicy: (type: 'privacy' | 'terms' | 'cookies') => void;
  onHome: (e?: React.MouseEvent) => void;
  onNavigate: (id: string, e?: React.MouseEvent) => void;
}

export function Footer({ onShowPolicy, onHome, onNavigate }: FooterProps) {
  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    onNavigate(id, e);
  };

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center space-x-2 group cursor-pointer" onClick={onHome}>
              <Activity className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">Pose2Fit</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Revolutionary AI-powered sizing technology that ensures the perfect fit every time.
            </p>
          </div>

          <div className="animate-fade-in stagger-2">
            <h4 className="text-white font-semibold mb-4 group hover:text-blue-400 transition-colors">Product</h4>
            <ul className="space-y-2">
              <li><button onClick={(e) => handleLinkClick(e, 'features')} className="hover:text-blue-400 hover:translate-x-1 transition-all text-left">Features</button></li>
              <li><button onClick={(e) => handleLinkClick(e, 'how-it-works')} className="hover:text-blue-400 hover:translate-x-1 transition-all text-left">How It Works</button></li>
              <li><button onClick={(e) => handleLinkClick(e, 'try-on')} className="hover:text-blue-400 hover:translate-x-1 transition-all text-left">Try On</button></li>
              <li><button onClick={() => alert('Pricing coming soon!')} className="hover:text-blue-400 hover:translate-x-1 transition-all text-left">Pricing</button></li>
            </ul>
          </div>

          <div className="animate-fade-in stagger-3">
            <h4 className="text-white font-semibold mb-4 group hover:text-blue-400 transition-colors">Legal</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onShowPolicy('privacy')} className="hover:text-blue-400 hover:translate-x-1 transition-all text-left">Privacy Policy</button></li>
              <li><button onClick={() => onShowPolicy('terms')} className="hover:text-blue-400 hover:translate-x-1 transition-all text-left">Terms of Service</button></li>
              <li><button onClick={() => onShowPolicy('cookies')} className="hover:text-blue-400 hover:translate-x-1 transition-all text-left">Cookie Policy</button></li>
            </ul>
          </div>

          <div className="animate-fade-in stagger-4">
            <h4 className="text-white font-semibold mb-4 group hover:text-blue-400 transition-colors">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 group/item hover:translate-x-1 transition-transform cursor-pointer" onClick={() => window.location.href = 'mailto:idealittechno@gmail.com'}>
                <Mail className="w-4 h-4 text-blue-400 group-hover/item:scale-125 transition-transform" />
                <span>idealittechno@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2 group/item hover:translate-x-1 transition-transform cursor-pointer" onClick={() => window.location.href = 'tel:+91123456789'}>
                <Phone className="w-4 h-4 text-blue-400 group-hover/item:scale-125 transition-transform" />
                <span>+91 123456789</span>
              </li>
              <li className="flex items-center space-x-2 group/item hover:translate-x-1 transition-transform">
                <MapPin className="w-4 h-4 text-blue-400 group-hover/item:scale-125 transition-transform" />
                <span>Indore, MP</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            &copy; 2026 IdealITTechno. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <button onClick={() => onShowPolicy('privacy')} className="hover:text-blue-400 transition-colors hover:underline">Privacy Policy</button>
            <button onClick={() => onShowPolicy('terms')} className="hover:text-blue-400 transition-colors hover:underline">Terms of Service</button>
            <button onClick={() => onShowPolicy('cookies')} className="hover:text-blue-400 transition-colors hover:underline">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
