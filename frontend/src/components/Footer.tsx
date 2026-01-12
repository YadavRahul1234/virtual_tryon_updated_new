import { Activity, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center space-x-2 group">
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
              <li><a href="#features" className="hover:text-blue-400 hover:translate-x-1 transition-all">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-blue-400 hover:translate-x-1 transition-all">How It Works</a></li>
              <li><a href="#categories" className="hover:text-blue-400 hover:translate-x-1 transition-all">Categories</a></li>
              <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all">Pricing</a></li>
            </ul>
          </div>

          <div className="animate-fade-in stagger-3">
            <h4 className="text-white font-semibold mb-4 group hover:text-blue-400 transition-colors">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all">Careers</a></li>
              <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all">Blog</a></li>
              <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all">Partners</a></li>
            </ul>
          </div>

          <div className="animate-fade-in stagger-4">
            <h4 className="text-white font-semibold mb-4 group hover:text-blue-400 transition-colors">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 group/item hover:translate-x-1 transition-transform">
                <Mail className="w-4 h-4 text-blue-400 group-hover/item:scale-125 transition-transform" />
                <span>hello@pose2fit.com</span>
              </li>
              <li className="flex items-center space-x-2 group/item hover:translate-x-1 transition-transform">
                <Phone className="w-4 h-4 text-blue-400 group-hover/item:scale-125 transition-transform" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2 group/item hover:translate-x-1 transition-transform">
                <MapPin className="w-4 h-4 text-blue-400 group-hover/item:scale-125 transition-transform" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            &copy; 2024 Pose2Fit. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-blue-400 transition-colors hover:underline">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400 transition-colors hover:underline">Terms of Service</a>
            <a href="#" className="hover:text-blue-400 transition-colors hover:underline">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
