import React from 'react';
import { ArrowLeft, Shield, FileText, Cookie } from 'lucide-react';

export type PolicyType = 'privacy' | 'terms' | 'cookies';

interface PolicyPageProps {
  type: PolicyType;
  onBack: () => void;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ type, onBack }) => {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: <Shield className="w-12 h-12 text-violet-600" />,
      text: (
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-bold mb-3 dark:text-white">1. Information We Collect</h3>
            <p className="text-gray-600 dark:text-gray-400">At Pose2Fit, we collect personal information such as your name, email address, and body measurements or photos you upload for virtual try-on. We use this data solely to provide and improve our services.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold mb-3 dark:text-white">2. How We Use Your Data</h3>
            <p className="text-gray-600 dark:text-gray-400">Your photos are processed to generate virtual avatars and try-on results. We do not sell your personal data to third parties. We may use anonymized, aggregated data for system optimization and machine learning training.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold mb-3 dark:text-white">3. Data Security</h3>
            <p className="text-gray-600 dark:text-gray-400">We implement industry-standard security measures to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>
        </div>
      )
    },
    terms: {
      title: 'Terms of Service',
      icon: <FileText className="w-12 h-12 text-violet-600" />,
      text: (
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-bold mb-3 dark:text-white">1. Acceptance of Terms</h3>
            <p className="text-gray-600 dark:text-gray-400">By using Pose2Fit, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our application.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold mb-3 dark:text-white">2. Use of Service</h3>
            <p className="text-gray-600 dark:text-gray-400">You are responsible for the content you upload. You must have the rights to any photos you provide for virtual try-on. Misuse of the service for harassment or illegal activities is strictly prohibited.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold mb-3 dark:text-white">3. Intellectual Property</h3>
            <p className="text-gray-600 dark:text-gray-400">The software, AI models, and designs of Pose2Fit are the property of IdealITTechno and are protected by intellectual property laws.</p>
          </section>
        </div>
      )
    },
    cookies: {
      title: 'Cookie Policy',
      icon: <Cookie className="w-12 h-12 text-violet-600" />,
      text: (
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-bold mb-3 dark:text-white">1. What are Cookies?</h3>
            <p className="text-gray-600 dark:text-gray-400">Cookies are small text files stored on your device to help websites run effectively. We use them to remember your preferences and analyze traffic.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold mb-3 dark:text-white">2. How We Use Cookies</h3>
            <p className="text-gray-600 dark:text-gray-400">We use essential cookies for authentication and session management. We also use analytical cookies (like Google Analytics) to understand how users interact with our site.</p>
          </section>
          <section>
            <h3 className="text-xl font-bold mb-3 dark:text-white">3. Managing Cookies</h3>
            <p className="text-gray-600 dark:text-gray-400">You can control or delete cookies through your browser settings. Note that disabling cookies may affect the functionality of some parts of our website.</p>
          </section>
        </div>
      )
    }
  }[type];

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors mb-12 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 shadow-2xl">
        <div className="flex items-center gap-6 mb-10 pb-10 border-b border-gray-100 dark:border-gray-700">
          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl">
            {content.icon}
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{content.title}</h1>
            <p className="text-gray-500 dark:text-gray-400">Last updated: January 2026</p>
          </div>
        </div>

        <div className="prose prose-violet max-w-none">
          {content.text}
        </div>
        
        <div className="mt-16 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            If you have any questions about this {content.title}, please contact us at <a href="mailto:idealittechno@gmail.com" className="text-violet-600 font-bold hover:underline">idealittechno@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};
