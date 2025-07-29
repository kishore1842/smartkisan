import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Github,
  Heart
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [],
    company: [],
    support: [],
    resources: []
  };

  const socialLinks = [];

  return (
    <footer className="footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <Leaf className="footer-logo-icon" />
              <span className="footer-logo-text">Kisan</span>
            </Link>
            <p className="footer-description">
              Empowering Indian farmers with AI-powered tools for smarter, 
              more profitable agriculture. Join thousands of farmers who trust 
              Kisan for their farming needs.
            </p>
            
            {/* Contact Info */}
            <div className="footer-contact">
              <div className="footer-contact-item">
                <Mail className="footer-contact-icon" />
                <span>support@kisan.ai</span>
              </div>
              <div className="footer-contact-item">
                <Phone className="footer-contact-icon" />
                <span>+91 1800-KISAN</span>
              </div>
              <div className="footer-contact-item">
                <MapPin className="footer-contact-icon" />
                <span>Bangalore, Karnataka, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="footer-social">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-link"
                    aria-label={social.name}
                  >
                    <Icon className="footer-social-icon" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          <div className="footer-links">
            <div className="footer-links-section">
              <h3 className="footer-links-title">Product</h3>
              <ul className="footer-links-list">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-section">
              <h3 className="footer-links-title">Company</h3>
              <ul className="footer-links-list">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-section">
              <h3 className="footer-links-title">Support</h3>
              <ul className="footer-links-list">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-section">
              <h3 className="footer-links-title">Resources</h3>
              <ul className="footer-links-list">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <div className="footer-newsletter-content">
            <h3 className="footer-newsletter-title">Stay Updated</h3>
            <p className="footer-newsletter-description">
              Get the latest farming tips, market updates, and AI insights delivered to your inbox.
            </p>
          </div>
          <div className="footer-newsletter-form">
            <div className="footer-newsletter-input-group">
              <input
                type="email"
                placeholder="Enter your email"
                className="footer-newsletter-input"
                aria-label="Email address for newsletter"
              />
              <button className="btn btn-primary footer-newsletter-button">
                Subscribe
              </button>
            </div>
            <p className="footer-newsletter-note">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} Kisan. All rights reserved. Made with{' '}
              <Heart className="footer-heart" /> for Indian farmers.
            </p>
            <div className="footer-bottom-links">
              <Link to="/privacy" className="footer-bottom-link">
                Privacy Policy
              </Link>
              <Link to="/terms" className="footer-bottom-link">
                Terms of Service
              </Link>
              <Link to="/cookies" className="footer-bottom-link">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 