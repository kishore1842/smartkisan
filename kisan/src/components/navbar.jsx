import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  X, 
  Leaf, 
  Home, 
  Info, 
  Settings, 
  HelpCircle, 
  Phone, 
  User,
  LogOut,
  ChevronDown,
  TrendingUp,
  Award,
  MessageCircle,
  FileText
} from 'lucide-react';
import './navbar.css';

const Navbar = ({ openLoginModal, openRegisterModal }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: Settings, requiresAuth: true },
    { name: 'Crop Disease', path: '/crop-disease', icon: Leaf },
    { name: 'Market Prices', path: '/market-prices', icon: TrendingUp },
    { name: 'Schemes', path: '/schemes', icon: Award, requiresAuth: true },
    { name: 'Documents', path: '/documents', icon: FileText, requiresAuth: true },
    { name: 'Assistant', path: '/voice-assistant', icon: MessageCircle },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <Leaf className="navbar-logo-icon" />
          <span className="navbar-logo-text">Kisan</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          <ul className="navbar-nav">
            {navItems.map((item) => {
              if (item.requiresAuth && !isAuthenticated) return null;
              
              const Icon = item.icon;
              return (
                <li key={item.name} className="navbar-nav-item">
                  <Link
                    to={item.path}
                    className={`navbar-nav-link ${isActive(item.path) ? 'navbar-nav-link-active' : ''}`}
                  >
                    <Icon className="navbar-nav-icon" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="navbar-profile">
              <button
                className="navbar-profile-button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                aria-expanded={isProfileDropdownOpen}
                aria-haspopup="true"
              >
                <div className="navbar-profile-avatar">
                  <User className="navbar-profile-avatar-icon" />
                </div>
                <span className="navbar-profile-name">{user?.name || 'User'}</span>
                <ChevronDown className={`navbar-profile-chevron ${isProfileDropdownOpen ? 'rotate' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <div className="navbar-profile-dropdown">
                  <div className="navbar-profile-dropdown-header">
                    <div className="navbar-profile-dropdown-avatar">
                      <User className="navbar-profile-dropdown-avatar-icon" />
                    </div>
                    <div className="navbar-profile-dropdown-info">
                      <div className="navbar-profile-dropdown-name">{user?.name || 'User'}</div>
                      <div className="navbar-profile-dropdown-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="navbar-profile-dropdown-divider"></div>
                  <Link to="/profile" className="navbar-profile-dropdown-item">
                    <User className="navbar-profile-dropdown-icon" />
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="navbar-profile-dropdown-item">
                    <LogOut className="navbar-profile-dropdown-icon" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-auth-buttons">
              <button onClick={openLoginModal} className="btn btn-ghost">
                Sign In
              </button>
              <button onClick={openRegisterModal} className="btn btn-primary">
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="navbar-mobile-toggle-icon" /> : <Menu className="navbar-mobile-toggle-icon" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`navbar-mobile ${isMenuOpen ? 'navbar-mobile-open' : ''}`}>
        <div className="navbar-mobile-container">
          <ul className="navbar-mobile-nav">
            {navItems.map((item) => {
              if (item.requiresAuth && !isAuthenticated) return null;
              
              const Icon = item.icon;
              return (
                <li key={item.name} className="navbar-mobile-nav-item">
                  <Link
                    to={item.path}
                    className={`navbar-mobile-nav-link ${isActive(item.path) ? 'navbar-mobile-nav-link-active' : ''}`}
                  >
                    <Icon className="navbar-mobile-nav-icon" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile Auth Section */}
          <div className="navbar-mobile-auth">
            {isAuthenticated ? (
              <div className="navbar-mobile-profile">
                <div className="navbar-mobile-profile-info">
                  <div className="navbar-mobile-profile-avatar">
                    <User className="navbar-mobile-profile-avatar-icon" />
                  </div>
                  <div className="navbar-mobile-profile-details">
                    <div className="navbar-mobile-profile-name">{user?.name || 'User'}</div>
                    <div className="navbar-mobile-profile-email">{user?.email}</div>
                  </div>
                </div>
                <div className="navbar-mobile-profile-actions">
                  <Link to="/dashboard" className="btn btn-outline btn-sm">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="btn btn-outline btn-sm">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="navbar-mobile-auth-buttons">
                <button onClick={openLoginModal} className="btn btn-outline">
                  Sign In
                </button>
                <button onClick={openRegisterModal} className="btn btn-primary">
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div 
          className="navbar-backdrop"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
