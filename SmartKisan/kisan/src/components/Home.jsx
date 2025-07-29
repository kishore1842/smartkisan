import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VoiceAssistant from './VoiceAssistant';
import { Leaf, ArrowRight, Sparkles, TrendingUp, Mic, Shield, Zap, Heart, Sun, Moon, Twitter, Github, MessageCircle } from 'lucide-react';

// Placeholder SVG illustration for hero
const HeroSVG = () => (
  <svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-8 animate-fade-in-up">
    <ellipse cx="160" cy="150" rx="120" ry="20" fill="#E0F2FE" />
    <rect x="60" y="80" width="200" height="60" rx="20" fill="#A7F3D0" />
    <rect x="100" y="60" width="120" height="40" rx="15" fill="#FDE68A" />
    <circle cx="160" cy="80" r="18" fill="#FCA5A5" />
    <rect x="140" y="100" width="40" height="30" rx="10" fill="#93C5FD" />
  </svg>
);

const features = [];

const benefits = [];

const Home = ({ openLoginModal, openRegisterModal }) => {
  const { isAuthenticated } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  // Toggle dark mode (UI only)
  const toggleDark = () => setDarkMode((d) => !d);

  return (
    <div className={`min-h-screen relative overflow-hidden font-sans ${darkMode ? 'dark bg-neutral-900 text-white' : 'bg-gradient-to-br from-sage-50 to-white text-neutral-900'}`}>
      {/* Glassy Sticky Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/70 dark:bg-neutral-900/80 backdrop-blur-lg shadow-md flex items-center justify-between px-6 py-3 mb-2">
        <div className="flex items-center gap-3">
          <Leaf className="w-8 h-8 text-primary-500" />
          <span className="text-2xl font-bold tracking-tight font-display gradient-text drop-shadow">Project Kisan</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleDark} className="p-2 rounded-full hover:bg-primary-100 dark:hover:bg-neutral-800 transition-colors">
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Hero Section with Animated SVG Background */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center w-full">
        {/* Animated SVG waves background */}
        <div className="absolute inset-0 -z-10 pointer-events-none select-none w-full overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-64 md:h-96 max-w-screen-2xl mx-auto">
            <path fill="#A7F3D0" fillOpacity="0.3" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
            <path fill="#93C5FD" fillOpacity="0.2" d="M0,224L60,197.3C120,171,240,117,360,117.3C480,117,600,171,720,186.7C840,203,960,181,1080,154.7C1200,128,1320,96,1380,80L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
          </svg>
        </div>
        <div className="w-full max-w-4xl mx-auto px-4">
          <HeroSVG />
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 gradient-text drop-shadow-lg font-display animate-slide-up">Project Kisan</h1>
          <p className="text-2xl md:text-3xl mb-10 max-w-3xl mx-auto font-accent animate-fade-in">
            Your AI-powered digital companion for smart farming. Experience the future of agriculture with instant crop disease diagnosis, real-time market intelligence, and expert guidance in your preferred language.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10 animate-fade-in-up">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn btn-primary text-xl px-10 py-5 rounded-full shadow-xl hover:scale-105 transition-transform animate-glow"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-7 w-7" />
              </Link>
            ) : (
              <>
                <button
                  onClick={openRegisterModal}
                  className="btn btn-primary text-xl px-10 py-5 rounded-full shadow-xl hover:scale-105 transition-transform animate-glow"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-7 w-7" />
                </button>
                <button
                  onClick={openLoginModal}
                  className="btn btn-outline text-xl px-10 py-5 rounded-full shadow hover:scale-105 transition-transform"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Animated Details for Unauthenticated Users */}
      {!isAuthenticated && (
        <>
          {/* About Section */}
          <section className="py-10 md:py-20 w-full">
            <div className="max-w-3xl mx-auto px-4 text-center animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 gradient-text drop-shadow font-display">Empowering Farmers with AI</h2>
              <p className="text-xl text-neutral-700 dark:text-neutral-200 mb-2">Project Kisan is an all-in-one platform designed to revolutionize Indian agriculture. We bring the power of Google AI to your farm, making advanced technology accessible, simple, and effective for every farmer.</p>
            </div>
          </section>

          {/* SVG Wave Divider */}
          <div className="w-full overflow-hidden -mb-2">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-10 max-w-screen-2xl mx-auto">
              <path fill="#A7F3D0" fillOpacity="0.2" d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,37.3C840,32,960,32,1080,37.3C1200,43,1320,53,1380,56L1440,60L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
            </svg>
          </div>

          {/* Features Grid (2x2) */}
          <section className="py-10 md:py-20 w-full">
            <div className="max-w-6xl mx-auto w-full px-4">
              <h3 className="text-3xl md:text-4xl font-bold text-center mb-14 animate-fade-in-up gradient-text drop-shadow font-display">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {features.slice(0, 4).map((f, i) => (
                  <div key={f.title + i} className="card group p-10 bg-white/70 dark:bg-neutral-800/70 rounded-3xl shadow-2xl hover:shadow-3xl border border-transparent hover:border-primary-200 transition-all duration-300 animate-fade-in-up backdrop-blur-lg flex flex-col items-center text-center" style={{animationDelay: `${i * 120}ms`}}>
                    {f.icon && <div className="flex-shrink-0 mb-6 w-20 h-20 flex items-center justify-center">{f.icon}</div>}
                    <h4 className="text-2xl font-semibold mb-3 gradient-text drop-shadow font-display">{f.title}</h4>
                    <p className="text-neutral-700 dark:text-neutral-200 text-lg">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SVG Wave Divider */}
          <div className="w-full overflow-hidden -mb-2">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-10 max-w-screen-2xl mx-auto">
              <path fill="#93C5FD" fillOpacity="0.2" d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,37.3C840,32,960,32,1080,37.3C1200,43,1320,53,1380,56L1440,60L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
            </svg>
          </div>

          {/* Benefits Grid (zig-zag) */}
          <section className="py-10 md:py-20 w-full">
            <div className="max-w-6xl mx-auto w-full px-4">
              <h3 className="text-3xl md:text-4xl font-bold text-center mb-14 animate-fade-in-up gradient-text drop-shadow font-display">Why Choose Project Kisan?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {benefits.map((b, i) => (
                  <div key={b.title} className={`card group p-10 bg-white/70 dark:bg-neutral-800/70 rounded-3xl shadow-2xl hover:shadow-3xl border border-transparent hover:border-primary-200 transition-all duration-300 animate-fade-in-up backdrop-blur-lg flex flex-col md:flex-row items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`} style={{animationDelay: `${i * 120}ms`}}>
                    <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8 md:ml-0 md:w-32 md:h-32 flex items-center justify-center">
                      {b.icon}
                    </div>
                    <div>
                      <h4 className="text-2xl font-semibold mb-3 gradient-text drop-shadow font-display">{b.title}</h4>
                      <p className="text-neutral-700 dark:text-neutral-200 text-lg">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-16 w-full">
            <div className="max-w-2xl mx-auto w-full px-4 text-center animate-fade-in-up">
              <h3 className="text-3xl md:text-4xl font-bold mb-8 gradient-text drop-shadow font-display">Ready to transform your farming?</h3>
              <button
                onClick={openRegisterModal}
                className="btn btn-primary text-xl px-12 py-5 rounded-full shadow-2xl hover:scale-105 transition-transform animate-glow"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-7 w-7" />
              </button>
            </div>
          </section>
        </>
      )}

      {/* Modern Footer */}
      <footer className="w-full py-8 px-4 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 w-full px-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary-500" />
            <span className="font-bold text-lg font-display">Project Kisan</span>
            <span className="text-neutral-400 ml-2">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 items-center">
            <a href="#" className="hover:text-primary-500 transition-colors">About</a>
            <a href="#" className="hover:text-primary-500 transition-colors">Features</a>
            <a href="#" className="hover:text-primary-500 transition-colors">Contact</a>
            <a href="#" className="hover:text-primary-500 transition-colors"><Twitter className="w-5 h-5 inline" /></a>
            <a href="#" className="hover:text-primary-500 transition-colors"><Github className="w-5 h-5 inline" /></a>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      {!showVoiceAssistant && (
        <button
          className="fixed bottom-8 right-8 z-50 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-colors"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
          onClick={() => setShowVoiceAssistant(true)}
          aria-label="Open Chat Assistant"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}
      {/* Voice Assistant Chat Widget */}
      {showVoiceAssistant && (
        <div className="fixed bottom-8 right-8 z-50 pointer-events-auto" style={{ width: 350, maxWidth: '95vw' }}>
          <div className="relative">
            <button
              className="absolute top-2 right-2 z-10 bg-white rounded-full shadow p-1 hover:bg-neutral-100 transition-colors"
              onClick={() => setShowVoiceAssistant(false)}
              aria-label="Close Chat Assistant"
            >
              <span style={{fontSize: '1.5rem', lineHeight: 1}}>&times;</span>
            </button>
            <VoiceAssistant />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 