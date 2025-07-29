import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { schemesAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Award, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  Star,
  Eye,
  Download,
  Plus,
  Shield,
  TrendingUp,
  Target,
  Zap,
  X as XIcon
} from 'lucide-react';
import './Schemes.css';

const Schemes = () => {
  const { isAuthenticated, user } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  // Add state for live schemes and loading
  const [liveSchemes, setLiveSchemes] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');
  const debounceTimeout = useRef(null);

  const categories = [
    'All',
    'Income Support',
    'Crop Insurance',
    'Equipment Subsidy',
    'Education',
    'Infrastructure',
    'Technology'
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchSchemes();
      fetchApplications();
    }
  }, [isAuthenticated]);

  // Clear liveSchemes when searchTerm is empty
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setLiveSchemes([]);
    }
  }, [searchTerm]);

  // Debounced fetch function
  const fetchLiveSchemes = (term) => {
    setLiveLoading(true);
    setLiveError('');
    fetch(`/api/v1/schemes/live?q=${encodeURIComponent(term)}`)
      .then(res => res.json())
      .then(data => {
        setLiveSchemes(data.schemes || []);
        setLiveLoading(false);
      })
      .catch(err => {
        setLiveError('Failed to fetch live government schemes.');
        setLiveLoading(false);
      });
  };

  // Handler for Enter key in search input
  const handleSearchInputKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim().length > 2) {
      fetchLiveSchemes(searchTerm);
    }
  };

  // Handler for Enter key in category select
  const handleCategoryKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim().length > 2) {
      fetchLiveSchemes(searchTerm);
    }
  };

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const response = await schemesAPI.getAllSchemes();
      setSchemes(response.data.schemes || []);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      toast.error('Failed to fetch schemes. Please try again.');
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await schemesAPI.getUserApplications();
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    }
  };

  const handleSearch = () => {
    // Filter schemes based on search term and category
    const filtered = schemes.filter(scheme => {
      const matchesSearch = scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    return filtered;
  };

  const handleApply = async (schemeId) => {
    if (!isAuthenticated) {
      toast.error('Please login to apply for schemes');
      return;
    }

    try {
      await schemesAPI.applyForScheme(schemeId, {
        userId: user._id,
        appliedDate: new Date().toISOString()
      });
      toast.success('Application submitted successfully!');
      fetchApplications(); // Refresh applications
      setShowApplyModal(false);
    } catch (error) {
      console.error('Error applying for scheme:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="scheme-status-icon scheme-status-icon-success" />;
      case 'Rejected': return <XCircle className="scheme-status-icon scheme-status-icon-error" />;
      case 'Under Review': return <Clock className="scheme-status-icon scheme-status-icon-warning" />;
      case 'Pending': return <AlertCircle className="scheme-status-icon scheme-status-icon-info" />;
      default: return <Clock className="scheme-status-icon scheme-status-icon-info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'scheme-status-success';
      case 'Rejected': return 'scheme-status-error';
      case 'Under Review': return 'scheme-status-warning';
      case 'Pending': return 'scheme-status-info';
      default: return 'scheme-status-info';
    }
  };

  const filteredSchemes = handleSearch();

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="schemes-auth-required">
            <div className="schemes-auth-icon">
              <Shield className="schemes-auth-icon-svg" />
            </div>
            <h1 className="schemes-auth-title">Authentication Required</h1>
            <p className="schemes-auth-description">
              Please log in to access government schemes and submit applications.
            </p>
            <button className="btn btn-primary btn-lg">
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        {/* Hero Section */}
        <div className="schemes-hero">
          <div className="schemes-hero-content">
            <div className="schemes-hero-info">
              <h1 className="schemes-hero-title">
                Government <span className="schemes-hero-highlight">Schemes</span>
              </h1>
              <p className="schemes-hero-description">
                Discover and apply for government schemes designed to support farmers. 
                Get financial assistance, equipment subsidies, and more.
              </p>
            </div>
            <div className="schemes-hero-stats">
              <div className="schemes-stat">
                <div className="schemes-stat-number">{filteredSchemes.length + liveSchemes.length}</div>
                <div className="schemes-stat-label">Available Schemes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="schemes-search-section">
          <div className="schemes-search-bar enhanced-search-bar">
            <div className="search-row">
              <div className="search-input-wrapper" style={{flex: '1 1 0%'}}>
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchInputKeyDown}
                  className="schemes-search-input"
                  style={{width: '100%'}}
                />
                {searchTerm && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                    type="button"
                  >
                    <XIcon size={18} />
                  </button>
                )}
              </div>
              <button className="btn btn-primary search-btn" style={{width: '10vw', minWidth: '80px'}} onClick={() => {
                if (searchTerm.trim().length > 2) {
                  const prefix = 'Give me all government schemes for ';
                  const suffix = ' including a proper working website link';
                  const query = prefix + searchTerm.trim() + suffix;
                  fetchLiveSchemes(query);
                }
              }}>
                <Search className="schemes-search-btn-icon" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="schemes-section">
          <div className="schemes-section-header">
            <h2 className="schemes-section-title">
              <Award className="schemes-section-icon" />
              Available Schemes
            </h2>
            <div className="schemes-section-count">
              {filteredSchemes.length + (liveSchemes.length > 0 ? liveSchemes.length : 0)} schemes found
            </div>
          </div>

          {loading || liveLoading ? (
            <div className="schemes-loading">
              <div className="schemes-loading-spinner"></div>
              <p>Loading schemes...</p>
            </div>
          ) : (filteredSchemes.length === 0 && liveSchemes.length === 0) ? (
            <div className="schemes-empty">
              <Award className="schemes-empty-icon" />
              <h3>No schemes found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="schemes-grid">
              {[...filteredSchemes, ...liveSchemes].map((scheme, idx) => (
                <div key={(scheme.link ? scheme.link : 'scheme') + '-' + idx} className="scheme-card">
                  <div className="scheme-header">
                    <div className="scheme-icon">
                      <Award className="scheme-icon-svg" />
                    </div>
                    {scheme.category && <div className="scheme-badge">{scheme.category}</div>}
                  </div>
                  <div className="scheme-content">
                    <h3 className="scheme-title">{scheme.title}</h3>
                    <p className="scheme-description">
                      {scheme.description ? scheme.description.substring(0, 120) : scheme.desc ? scheme.desc.substring(0, 120) : ''}...
                    </p>
                    <div className="scheme-details">
                      {scheme.benefit && (
                        <div className="scheme-detail">
                          <DollarSign className="scheme-detail-icon" />
                          <span>{scheme.benefit}</span>
                        </div>
                      )}
                      {scheme.eligibility && (
                        <div className="scheme-detail">
                          <Users className="scheme-detail-icon" />
                          <span>{scheme.eligibility}</span>
                        </div>
                      )}
                      {scheme.startDate && (
                        <div className="scheme-detail">
                          <Calendar className="scheme-detail-icon" />
                          <span>Start Date: {new Date(scheme.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {scheme.endDate && (
                        <div className="scheme-detail">
                          <Calendar className="scheme-detail-icon" />
                          <span>End Date: {scheme.endDate === "Ongoing" ? "Ongoing" : new Date(scheme.endDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {scheme.deadline && (
                        <div className="scheme-detail">
                          <Calendar className="scheme-detail-icon" />
                          <span>Deadline: {new Date(scheme.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="scheme-footer">
                    {scheme.link && (
                      <a className="btn btn-secondary" href={scheme.link} target="_blank" rel="noopener noreferrer">
                        Apply / View Details <ArrowRight size={16} style={{ marginLeft: 4 }} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Government Schemes Section */}
        {/* Removed separate liveSchemes section; now integrated above */}

        {/* Applications Section */}
        {/* Removed 'Your Applications' section as requested */}
      </div>
    </div>
  );
};

export default Schemes; 