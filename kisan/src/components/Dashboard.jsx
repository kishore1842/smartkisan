import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { schemesAPI, documentAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  User, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  TrendingUp,
  Award,
  Calendar,
  Hash,
  ArrowRight,
  Plus,
  Upload,
  Eye,
  Download,
  Star,
  Target,
  Shield,
  Zap,
  Crop,
  DollarSign,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [allSchemes, setAllSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  // Refresh data function
  const refreshDashboardData = () => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data individually to handle partial failures
      let applicationsRes, documentsRes, schemesRes;
      
      try {
        applicationsRes = await schemesAPI.getUserApplications();
        setApplications(applicationsRes.data.applications || []);
      } catch (error) {
        console.error('Failed to load applications:', error);
        setApplications([]);
      }
      
      try {
        documentsRes = await documentAPI.getUserDocuments();
        setDocuments(documentsRes.data.documents || []);
      } catch (error) {
        console.error('Failed to load documents:', error);
        setDocuments([]);
      }
      
      try {
        schemesRes = await schemesAPI.getAllSchemes();
        const schemes = schemesRes.data.schemes || [];
        setAllSchemes(schemes);
        // Show first 3 schemes as recommended
        setRecommendedSchemes(schemes.slice(0, 3));
      } catch (error) {
        console.error('Failed to load schemes:', error);
        setAllSchemes([]);
        setRecommendedSchemes([]);
      }
      
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="dashboard-status-icon dashboard-status-icon-success" />;
      case 'Rejected': return <XCircle className="dashboard-status-icon dashboard-status-icon-error" />;
      case 'Under Review': return <Clock className="dashboard-status-icon dashboard-status-icon-warning" />;
      case 'Pending': return <AlertCircle className="dashboard-status-icon dashboard-status-icon-info" />;
      default: return <Clock className="dashboard-status-icon dashboard-status-icon-info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'dashboard-status-success';
      case 'Rejected': return 'dashboard-status-error';
      case 'Under Review': return 'dashboard-status-warning';
      case 'Pending': return 'dashboard-status-info';
      default: return 'dashboard-status-info';
    }
  };

  // Navigation handlers
  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleViewApplication = (applicationId) => {
    navigate(`/schemes/application/${applicationId}`);
  };

  const handleViewScheme = (schemeId) => {
    navigate(`/schemes/${schemeId}`);
  };

  const handleViewAllSchemes = () => {
    navigate('/schemes');
  };

  const handleUploadDocuments = () => {
    navigate('/documents');
  };

  const handleViewAllApplications = () => {
    navigate('/schemes');
  };
const alert=()=>{
  window.alert("This is a prototype this feature will be implemented in feature...")
}
  const handleViewDocument = (documentId) => {
    navigate(`/documents/${documentId}`);
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const response = await documentAPI.downloadDocument(documentId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Document downloaded successfully!');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document. Please try again.');
    }
  };

  // Calculate additional statistics
  const getApplicationStats = () => {
    const total = applications.length;
    const approved = applications.filter(app => app.status === 'Approved').length;
    const pending = applications.filter(app => app.status === 'Pending' || app.status === 'Under Review').length;
    const rejected = applications.filter(app => app.status === 'Rejected').length;
    
    return { total, approved, pending, rejected };
  };

  const getDocumentStats = () => {
    const total = documents.length;
    const verified = documents.filter(doc => doc.status === 'Verified').length;
    const pending = documents.filter(doc => doc.status === 'Pending' || doc.status === 'Under Review').length;
    const rejected = documents.filter(doc => doc.status === 'Rejected').length;
    
    return { total, verified, pending, rejected };
  };

  const applicationStats = getApplicationStats();
  const documentStats = getDocumentStats();

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="dashboard-auth-required">
            <div className="dashboard-auth-icon">
              <Shield className="dashboard-auth-icon-svg" />
            </div>
            <h1 className="dashboard-auth-title">Authentication Required</h1>
            <p className="dashboard-auth-description">
              Please log in to access your personalized dashboard and manage your farming applications.
            </p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/')}
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p className="dashboard-loading-text">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        {/* Welcome Hero Section */}
        <div className="dashboard-hero">
          <div className="dashboard-hero-content">
            <div className="dashboard-hero-avatar">
              <User className="dashboard-hero-avatar-icon" />
            </div>
            <div className="dashboard-hero-info">
              <h1 className="dashboard-hero-title">
                Welcome back, <span className="dashboard-hero-name">{user?.name || 'Farmer'}</span>! 👋
              </h1>
              <p className="dashboard-hero-subtitle">
                Here's your farming dashboard with all your applications, documents, and available schemes.
              </p>
            </div>
            <button 
              className="dashboard-refresh-btn"
              onClick={refreshDashboardData}
              disabled={loading}
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`dashboard-refresh-icon ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="dashboard-hero-stats">
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon">
                <FileText className="dashboard-stat-icon-svg" />
              </div>
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-number">{applications.length}</div>
                <div className="dashboard-stat-label">Applications</div>
              </div>
            </div>
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon">
                <Upload className="dashboard-stat-icon-svg" />
              </div>
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-number">{documents.length}</div>
                <div className="dashboard-stat-label">Documents</div>
              </div>
            </div>
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon">
                <Award className="dashboard-stat-icon-svg" />
              </div>
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-number">{allSchemes.length}</div>
                <div className="dashboard-stat-label">Available Schemes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-quick-actions">
          <h2 className="dashboard-section-title">Quick Actions</h2>
          <div className="dashboard-actions-grid">
            <button 
              className="dashboard-action-card"
              onClick={() => handleNavigate('/schemes')}
            >
              <div className="dashboard-action-icon">
                <Plus className="dashboard-action-icon-svg" />
              </div>
              <div className="dashboard-action-content">
                <h3 className="dashboard-action-title">New Application</h3>
                <p className="dashboard-action-description">Apply for government schemes</p>
              </div>
              <ArrowRight className="dashboard-action-arrow" />
            </button>
            <button 
              className="dashboard-action-card"
              onClick={() => handleNavigate('/documents')}
            >
              <div className="dashboard-action-icon">
                <Upload className="dashboard-action-icon-svg" />
              </div>
              <div className="dashboard-action-content">
                <h3 className="dashboard-action-title">Upload Documents</h3>
                <p className="dashboard-action-description">Add important documents</p>
              </div>
              <ArrowRight className="dashboard-action-arrow" />
            </button>
            <button 
              className="dashboard-action-card"
              onClick={() => handleNavigate('/crop-disease')}
            >
              <div className="dashboard-action-icon">
                <Crop className="dashboard-action-icon-svg" />
              </div>
              <div className="dashboard-action-content">
                <h3 className="dashboard-action-title">Crop Diagnosis</h3>
                <p className="dashboard-action-description">Check crop health & diseases</p>
              </div>
              <ArrowRight className="dashboard-action-arrow" />
            </button>
            <button 
              className="dashboard-action-card"
              onClick={() => handleNavigate('/market-prices')}
            >
              <div className="dashboard-action-icon">
                <DollarSign className="dashboard-action-icon-svg" />
              </div>
              <div className="dashboard-action-content">
                <h3 className="dashboard-action-title">Market Prices</h3>
                <p className="dashboard-action-description">Check current crop prices</p>
              </div>
              <ArrowRight className="dashboard-action-arrow" />
            </button>
            <button 
              className="dashboard-action-card"
              onClick={() => handleNavigate('/voice-assistant')}
            >
              <div className="dashboard-action-icon">
                <Zap className="dashboard-action-icon-svg" />
              </div>
              <div className="dashboard-action-content">
                <h3 className="dashboard-action-title">AI Assistant</h3>
                <p className="dashboard-action-description">Get farming advice & help</p>
              </div>
              <ArrowRight className="dashboard-action-arrow" />
            </button>
            <button 
              className="dashboard-action-card"
              onClick={() => handleNavigate('/schemes')}
            >
              <div className="dashboard-action-icon">
                <BookOpen className="dashboard-action-icon-svg" />
              </div>
              <div className="dashboard-action-content">
                <h3 className="dashboard-action-title">Browse Schemes</h3>
                <p className="dashboard-action-description">Explore available schemes</p>
              </div>
              <ArrowRight className="dashboard-action-arrow" />
            </button>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-main-grid">
          {/* Applications Section */}
          <div className="dashboard-main-section">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">
                <FileText className="dashboard-section-icon" />
                Your Applications
              </h2>
              <button 
                className="btn btn-outline btn-sm"
                onClick={alert}
                // onClick={handleViewAllApplications}
              >
                View All
              </button>
            </div>
            
            {applications.length === 0 ? (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  <FileText className="dashboard-empty-icon-svg" />
                </div>
                <h3 className="dashboard-empty-title">No Applications Yet</h3>
                <p className="dashboard-empty-description">
                  Start by applying for government schemes to get financial support for your farming activities.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleNavigate('/schemes')}
                >
                  Browse Schemes
                </button>
              </div>
            ) : (
              <div className="dashboard-applications">
                {applications.map((app) => (
                  <div key={app._id} className="dashboard-application-card">
                    <div className="dashboard-application-header">
                      <div className="dashboard-application-info">
                        <h3 className="dashboard-application-title">
                          {app.scheme?.title || 'Scheme Application'}
                        </h3>
                        <div className="dashboard-application-meta">
                          <div className="dashboard-application-meta-item">
                            <Calendar className="dashboard-application-meta-icon" />
                            <span>Applied: {new Date(app.appliedDate || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <div className="dashboard-application-meta-item">
                            <Hash className="dashboard-application-meta-icon" />
                            <span>ID: {app.trackingNumber || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`dashboard-application-status ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        <span className="dashboard-application-status-text">{app.status || 'Pending'}</span>
                      </div>
                    </div>
                    <div className="dashboard-application-actions">
                      <button 
                        className="btn btn-ghost btn-sm"
                        // onClick={() => handleViewApplication(app._id)}
                        onClick={alert}
                      >
                        <Eye className="dashboard-action-icon-small" />
                        View Details
                      </button>
                      <button className="btn btn-ghost btn-sm"   onClick={alert}>
                        <Download className="dashboard-action-icon-small" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="dashboard-side-section">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">
                <FileText className="dashboard-section-icon" />
                Uploaded Documents
              </h2>
              <button 
                className="btn btn-outline btn-sm"
                onClick={handleUploadDocuments}
              >
                Upload New
              </button>
            </div>
            
            {documents.length === 0 ? (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  <FileText className="dashboard-empty-icon-svg" />
                </div>
                <h3 className="dashboard-empty-title">No Documents Uploaded</h3>
                <p className="dashboard-empty-description">
                  Upload important documents like land certificates, ID proofs, and bank details.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={handleUploadDocuments}
                >
                  Upload Documents
                </button>
              </div>
            ) : (
              <div className="dashboard-documents-table">
                <div className="dashboard-documents-header">
                  <div className="dashboard-document-col-header">Document Name</div>
                  <div className="dashboard-document-col-header">Type</div>
                  <div className="dashboard-document-col-header">Status</div>
                  <div className="dashboard-document-col-header">Actions</div>
                </div>
                <div className="dashboard-documents-list">
                  {documents.map((doc) => (
                    <div key={doc._id} className="dashboard-document-row">
                      <div className="dashboard-document-name">
                        <div className="dashboard-document-icon">
                          <FileText className="dashboard-document-icon-svg" />
                        </div>
                        <div className="dashboard-document-details">
                          <h4 className="dashboard-document-title">
                            {doc.originalName || doc.documentType || 'Document'}
                          </h4>
                          <p className="dashboard-document-number">
                            {doc.documentNumber || 'No ID'}
                          </p>
                        </div>
                      </div>
                      <div className="dashboard-document-type">
                        <span className="dashboard-document-type-badge">
                          {doc.documentType || 'General'}
                        </span>
                      </div>
                      <div className={`dashboard-document-status ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        <span className="dashboard-document-status-text">{doc.status || 'Pending'}</span>
                      </div>
                      <div className="dashboard-document-actions">
                        <button 
                          className="dashboard-action-btn"
                          onClick={() => handleViewDocument(doc._id)}
                          title="View Document"
                        >
                          <Eye className="dashboard-action-icon-small" />
                        </button>
                        <button 
                          className="dashboard-action-btn"
                          onClick={() => handleDownloadDocument(doc._id, doc.originalName)}
                          title="Download Document"
                        >
                          <Download className="dashboard-action-icon-small" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Schemes */}
        {/* <div className="dashboard-recommended">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">
              <Star className="dashboard-section-icon" />
              Recommended Schemes
            </h2>
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleViewAllSchemes}
            >
              View All Schemes
            </button>
          </div>
          
          <div className="dashboard-schemes-grid">
            {recommendedSchemes.length === 0 ? (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  <Star className="dashboard-empty-icon-svg" />
                </div>
                <h3 className="dashboard-empty-title">No Recommended Schemes</h3>
                <p className="dashboard-empty-description">
                  Check back later for personalized scheme recommendations based on your profile.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={handleViewAllSchemes}
                >
                  Browse All Schemes
                </button>
              </div>
            ) : (
              recommendedSchemes.map((scheme) => (
                <div key={scheme._id} className="dashboard-scheme-card">
                  <div className="dashboard-scheme-header">
                    <div className="dashboard-scheme-icon">
                      <Award className="dashboard-scheme-icon-svg" />
                    </div>
                    <div className="dashboard-scheme-badge">
                      {scheme.category || 'General'}
                    </div>
                  </div>
                  <div className="dashboard-scheme-content">
                    <h3 className="dashboard-scheme-title">
                      {scheme.title || 'Scheme Title'}
                    </h3>
                    <p className="dashboard-scheme-description">
                      {scheme.description ? 
                        (scheme.description.length > 120 ? 
                          `${scheme.description.substring(0, 120)}...` : 
                          scheme.description
                        ) : 
                        'No description available'
                      }
                    </p>
                  </div>
                  <div className="dashboard-scheme-footer">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleViewScheme(scheme._id)}
                    >
                      Learn More
                      <ArrowRight className="dashboard-scheme-arrow" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard; 