import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  Leaf, 
  TrendingUp, 
  Mic, 
  Shield,
  Sparkles,
  Play,
  Star
} from 'lucide-react';
import './HeroSection.css';

const HeroSection = ({ openLoginModal, openRegisterModal }) => {
  const { isAuthenticated } = useAuth();

  const features = [];

  const stats = [];

  return (
    <section className="hero">
      {/* Background Elements */}
      <div className="hero-background">
        <div className="hero-background-gradient"></div>
        <div className="hero-background-pattern"></div>
      </div>

      <div className="container">
        <div className="hero-content">
          {/* Main Hero Section */}
          <div className="hero-main">
            <div className="hero-badge">
              <Sparkles className="hero-badge-icon" />
              <span>AI-Powered Smart Farming</span>
            </div>

            <h1 className="hero-title">
              Transform Your Farming with
              <span className="hero-title-highlight"> AI Technology</span>
            </h1>

            <p className="hero-description">
              Experience the future of agriculture with instant crop disease diagnosis, 
              real-time market intelligence, and expert guidance in your preferred language. 
              Join thousands of farmers who trust Kisan for smarter, more profitable farming.
            </p>

            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-xl">
                  Go to Dashboard
                  <ArrowRight className="hero-action-icon" />
                </Link>
              ) : (
                <>
                  <button onClick={openRegisterModal} className="btn btn-primary btn-xl">
                    Start Free Trial
                    <ArrowRight className="hero-action-icon" />
                  </button>
                  <button onClick={openLoginModal} className="btn btn-outline btn-xl">
                    Sign In
                  </button>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="hero-trust">
              <div className="hero-trust-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="hero-trust-star" />
                ))}
                <span className="hero-trust-text">Trusted by 50,000+ farmers</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hero-visual">
            <div className="hero-visual-container">
              <div className="hero-visual-main">
                <div className="hero-visual-card hero-visual-card-primary">
                  <Leaf className="hero-visual-icon" />
                  <div className="hero-visual-content">
                    <h3>AI Diagnosis</h3>
                    <p>Instant crop disease detection</p>
                  </div>
                </div>
                
                <div className="hero-visual-card hero-visual-card-secondary">
                  <TrendingUp className="hero-visual-icon" />
                  <div className="hero-visual-content">
                    <h3>Market Prices</h3>
                    <p>Real-time price intelligence</p>
                  </div>
                </div>
                
                <div className="hero-visual-card hero-visual-card-tertiary">
                  <Mic className="hero-visual-icon" />
                  <div className="hero-visual-content">
                    <h3>Voice Assistant</h3>
                    <p>Natural language support</p>
                  </div>
                </div>
              </div>
              
              <div className="hero-visual-play">
                <button className="hero-play-button">
                  <Play className="hero-play-icon" />
                </button>
                <span>Watch Demo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="hero-stats">
          {stats.map((stat, index) => (
            <div key={index} className="hero-stat">
              <div className="hero-stat-number">{stat.number}</div>
              <div className="hero-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Preview */}
        <div className="hero-features">
          <h2 className="hero-features-title">Everything you need for smart farming</h2>
          <div className="hero-features-grid">
            {features.map((feature, index) => (
              <div key={index} className={`hero-feature hero-feature-${feature.color}`}>
                <div className="hero-feature-icon-wrapper">
                  {feature.icon}
                </div>
                <h3 className="hero-feature-title">{feature.title}</h3>
                <p className="hero-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 