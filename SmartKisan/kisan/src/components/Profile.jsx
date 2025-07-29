import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Upload,
  Download,
  Share2,
  Settings,
  Bell,
  Lock,
  Key,
  LogOut,
  Award,
  Star,
  TrendingUp,
  Activity,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Home,
  Users,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Sparkles,
  Heart,
  Gift,
  BookOpen,
  HelpCircle,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  QrCode,
  Smartphone,
  Globe,
  Clock,
  Tag,
  Filter,
  Search,
  RefreshCw,
  MoreHorizontal,
  Grid,
  List,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  Crown,
  Trophy,
  Medal,
  Badge,
  Flame,
  Rocket,
  Sunrise,
  Moon,
  Cloud,
  Wind
} from 'lucide-react';
import './Profile.css';

const Profile = ({ openLoginModal }) => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    farmSize: user?.farmSize || '',
    crops: user?.crops || [],
    experience: user?.experience || '',
    education: user?.education || '',
    familyMembers: user?.familyMembers || '',
    annualIncome: user?.annualIncome || '',
    bankAccount: user?.bankAccount || '',
    aadharNumber: user?.aadharNumber || '',
    panNumber: user?.panNumber || ''
  });

  // Debug logging
  console.log('Profile Component Debug:', {
    user,
    isAuthenticated,
    loading,
    hasUser: !!user
  });

  // For testing - create fallback user data if user is null but authenticated
  const displayUser = user || (isAuthenticated ? {
    firstName: 'User',
    lastName: '',
    email: 'user@example.com',
    phone: '',
    address: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    farmSize: '',
    crops: [],
    experience: '',
    education: '',
    familyMembers: '',
    annualIncome: '',
    bankAccount: '',
    aadharNumber: '',
    panNumber: '',
    profileImage: null,
    createdAt: new Date().toISOString()
  } : null);

  // Update form data when user changes
  useEffect(() => {
    if (displayUser) {
      setFormData({
        firstName: displayUser.firstName || '',
        lastName: displayUser.lastName || '',
        email: displayUser.email || '',
        phone: displayUser.phone || '',
        address: displayUser.address || '',
        village: displayUser.village || '',
        district: displayUser.district || '',
        state: displayUser.state || '',
        pincode: displayUser.pincode || '',
        farmSize: displayUser.farmSize || '',
        crops: displayUser.crops || [],
        experience: displayUser.experience || '',
        education: displayUser.education || '',
        familyMembers: displayUser.familyMembers || '',
        annualIncome: displayUser.annualIncome || '',
        bankAccount: displayUser.bankAccount || '',
        aadharNumber: displayUser.aadharNumber || '',
        panNumber: displayUser.panNumber || ''
      });
    }
  }, [displayUser]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="profile-tab-icon" /> },
    { id: 'personal', label: 'Personal Info', icon: <User className="profile-tab-icon" /> },
    { id: 'farming', label: 'Farming Details', icon: <Target className="profile-tab-icon" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="profile-tab-icon" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="profile-tab-icon" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="profile-tab-icon" /> }
  ];

  const stats = [];

  const recentActivity = [];

  const achievements = [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: displayUser?.firstName || '',
      lastName: displayUser?.lastName || '',
      email: displayUser?.email || '',
      phone: displayUser?.phone || '',
      address: displayUser?.address || '',
      village: displayUser?.village || '',
      district: displayUser?.district || '',
      state: displayUser?.state || '',
      pincode: displayUser?.pincode || '',
      farmSize: displayUser?.farmSize || '',
      crops: displayUser?.crops || [],
      experience: displayUser?.experience || '',
      education: displayUser?.education || '',
      familyMembers: displayUser?.familyMembers || '',
      annualIncome: displayUser?.annualIncome || '',
      bankAccount: displayUser?.bankAccount || '',
      aadharNumber: displayUser?.aadharNumber || '',
      panNumber: displayUser?.panNumber || ''
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowDeleteModal(false);
      logout();
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getActivityStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'profile-activity-completed';
      case 'pending': return 'profile-activity-pending';
      case 'failed': return 'profile-activity-failed';
      default: return 'profile-activity-default';
    }
  };

  const getActivityStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="profile-activity-status-icon" />;
      case 'pending': return <Clock className="profile-activity-status-icon" />;
      case 'failed': return <AlertTriangle className="profile-activity-status-icon" />;
      default: return <Info className="profile-activity-status-icon" />;
    }
  };

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="profile-loading">
            <div className="spinner"></div>
            <p className="profile-loading-text">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show auth required if not authenticated
  if (!isAuthenticated || !displayUser) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="profile-auth-required">
            <div className="profile-auth-icon">
              <Shield className="profile-auth-icon-svg" />
            </div>
            <h1 className="profile-auth-title">Authentication Required</h1>
            <p className="profile-auth-description">
              Please log in to view and manage your profile information.
            </p>
            <button onClick={openLoginModal} className="btn btn-primary btn-lg">
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1. Avatar: show initials if no image
  function getInitials(user) {
    if (!user) return '';
    const names = [user.firstName, user.lastName].filter(Boolean);
    return names.map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="page-container">
      {/* Background Elements */}
      <div className="profile-background">
        <div className="profile-background-gradient"></div>
        <div className="profile-background-pattern"></div>
        <div className="profile-floating-elements">
          <div className="profile-floating-element profile-floating-1">
            <Sparkles className="profile-floating-icon" />
          </div>
          <div className="profile-floating-element profile-floating-2">
            <Star className="profile-floating-icon" />
          </div>
          <div className="profile-floating-element profile-floating-3">
            <Award className="profile-floating-icon" />
          </div>
        </div>
      </div>

      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-header-badge">
            <Crown className="profile-header-badge-icon" />
            <span>Premium Farmer</span>
          </div>

          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {displayUser.profileImage ? (
                  <img
                    src={displayUser.profileImage}
                    alt="Profile"
                    className="profile-avatar-image"
                  />
                ) : (
                  <div className="profile-avatar-placeholder">{getInitials(displayUser)}</div>
                )}
                <div className="profile-avatar-glow"></div>
                <button className="profile-avatar-edit" title="Edit Photo">
                  <Camera className="profile-avatar-edit-icon" />
                </button>
              </div>
              <div className="profile-info">
                <h1 className="profile-name">
                  {displayUser.firstName} {displayUser.lastName}
                </h1>
                <p className="profile-email">{displayUser.email}</p>
                {displayUser.bio && <p className="profile-bio">{displayUser.bio}</p>}
                <div className="profile-meta">
                  <span className="profile-location">
                    <MapPin className="profile-meta-icon" />
                    {displayUser.village}, {displayUser.district}
                  </span>
                  <span className="profile-member-since">
                    <Calendar className="profile-meta-icon" />
                    Member since {new Date(displayUser.createdAt).getFullYear()}
                  </span>
                </div>
                <div className="profile-level">
                  <div className="profile-level-badge">
                    <Trophy className="profile-level-icon" />
                    <span>Level 5 Farmer</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="profile-header-divider"></div>
            <div className="profile-actions">
              {isEditing ? (
                <div className="profile-edit-actions">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn btn-primary"
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="profile-action-icon" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn btn-outline"
                  >
                    <X className="profile-action-icon" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                >
                  <Edit className="profile-action-icon" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="profile-stats">
          <div className="profile-stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className={`profile-stat-card profile-stat-${stat.color}`} style={{minHeight: '140px'}}>
                <div className="profile-stat-glow"></div>
                <div className="profile-stat-icon-wrapper">
                  {stat.icon}
                </div>
                <div className="profile-stat-content">
                  <div className="profile-stat-value">{stat.value}</div>
                  <div className="profile-stat-label">{stat.label}</div>
                  <div className={`profile-stat-change profile-stat-${stat.trend}`}
                    style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                    {stat.trend === 'up' ? <ArrowRight style={{color:'#22c55e'}}/> : stat.trend === 'down' ? <ArrowLeft style={{color:'#ef4444'}}/> : null}
                    {stat.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          {/* Tabs */}
          <div className="profile-tabs" style={{overflowX: 'auto', whiteSpace: 'nowrap'}}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`profile-tab ${activeTab === tab.id ? 'profile-tab-active' : ''}`}
                style={{minWidth: 60}}
              >
                {tab.icon}
                <span className="profile-tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="profile-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="profile-overview">
                <div className="profile-overview-grid">
                  <div className="profile-overview-section">
                    <h2 className="profile-section-title">
                      <Activity className="profile-section-icon" />
                      Recent Activity
                    </h2>
                    <div className="profile-activity-list">
                      {recentActivity.slice(0,3).map((activity, index) => (
                        <div key={index} className={`profile-activity-item profile-activity-${activity.color}`}>
                          <div className="profile-activity-icon-wrapper">
                            {activity.icon}
                          </div>
                          <div className="profile-activity-content">
                            <h4 className="profile-activity-title">{activity.title}</h4>
                            <p className="profile-activity-description">{activity.description}</p>
                            <div className="profile-activity-meta">
                              <span className="profile-activity-time">{activity.time}</span>
                              <span className={`profile-activity-status ${getActivityStatusColor(activity.status)}`}>
                                {getActivityStatusIcon(activity.status)}
                                {activity.status}
                              </span>
                            </div>
                            {activity.status === 'completed' && (
                              <span className="profile-activity-progress-ring" title="Completed"></span>
                            )}
                          </div>
                        </div>
                      ))}
                      {recentActivity.length > 3 && (
                        <button className="btn btn-outline profile-activity-viewall">View All</button>
                      )}
                    </div>
                  </div>

                  <div className="profile-overview-section">
                    <h2 className="profile-section-title">
                      <Award className="profile-section-icon" />
                      Achievements
                    </h2>
                    <div className="profile-achievements-grid">
                      {achievements.map((achievement, index) => (
                        <div
                          key={index}
                          className={`profile-achievement-card profile-achievement-${achievement.color} ${achievement.unlocked ? 'profile-achievement-unlocked' : 'profile-achievement-locked'}`}
                        >
                          <div className="profile-achievement-glow"></div>
                          <div className="profile-achievement-icon-wrapper">
                            {achievement.icon}
                          </div>
                          <div className="profile-achievement-content">
                            <h4 className="profile-achievement-title">{achievement.title}</h4>
                            <p className="profile-achievement-description">{achievement.description}</p>
                          </div>
                          {achievement.unlocked && (
                            <div className="profile-achievement-badge">
                              <CheckCircle className="profile-achievement-badge-icon" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="profile-personal">
                <div className="profile-form-grid">
                  <div className="profile-form-section">
                    <h3 className="profile-form-section-title">Basic Information</h3>
                    <div className="profile-form-row">
                      <div className="profile-form-group">
                        <label className="profile-form-label">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="profile-form-input"
                        />
                      </div>
                      <div className="profile-form-group">
                        <label className="profile-form-label">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="profile-form-input"
                        />
                      </div>
                    </div>
                    <div className="profile-form-row">
                      <div className="profile-form-group">
                        <label className="profile-form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="profile-form-input"
                        />
                      </div>
                      <div className="profile-form-group">
                        <label className="profile-form-label">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="profile-form-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="profile-form-section">
                    <h3 className="profile-form-section-title">Address Information</h3>
                    <div className="profile-form-group">
                      <label className="profile-form-label">Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="profile-form-textarea"
                        rows="3"
                      />
                    </div>
                    <div className="profile-form-row">
                      <div className="profile-form-group">
                        <label className="profile-form-label">Village</label>
                        <input
                          type="text"
                          name="village"
                          value={formData.village}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="profile-form-input"
                        />
                      </div>
                      <div className="profile-form-group">
                        <label className="profile-form-label">District</label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="profile-form-input"
                        />
                      </div>
                    </div>
                    <div className="profile-form-row">
                      <div className="profile-form-group">
                        <label className="profile-form-label">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="profile-form-input"
                        />
                      </div>
                      <div className="profile-form-group">
                        <label className="profile-form-label">Pincode</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="profile-form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Farming Details Tab */}
            {activeTab === 'farming' && (
              <div className="profile-farming">
                <div className="profile-form-grid">
                  <div className="profile-form-section">
                    <h3 className="profile-form-section-title">Farming Information</h3>
                    <div className="profile-form-row">
                      <div className="profile-form-group">
                        <label className="profile-form-label">Farm Size (Acres)</label>
                        <input
                          type="number"
                          name="farmSize"
                          value={formData.farmSize}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="profile-form-input"
                        />
                      </div>
                      <div className="profile-form-group">
                        <label className="profile-form-label">Years of Experience</label>
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="profile-form-input"
                        />
                      </div>
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-form-label">Main Crops</label>
                      <input
                        type="text"
                        name="crops"
                        value={formData.crops.join(', ')}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          crops: e.target.value.split(',').map(crop => crop.trim())
                        }))}
                        disabled={!isEditing}
                        className="profile-form-input"
                        placeholder="e.g., Wheat, Rice, Cotton"
                      />
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-form-label">Education</label>
                      <select
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="profile-form-select"
                      >
                        <option value="">Select Education Level</option>
                        <option value="Primary">Primary</option>
                        <option value="Secondary">Secondary</option>
                        <option value="Higher Secondary">Higher Secondary</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Post Graduate">Post Graduate</option>
                      </select>
                    </div>
                  </div>

                  <div className="profile-form-section">
                    <h3 className="profile-form-section-title">Family & Financial</h3>
                    <div className="profile-form-row">
                      <div className="profile-form-group">
                        <label className="profile-form-label">Family Members</label>
                        <input
                          type="number"
                          name="familyMembers"
                          value={formData.familyMembers}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="profile-form-input"
                        />
                      </div>
                      <div className="profile-form-group">
                        <label className="profile-form-label">Annual Income (₹)</label>
                        <input
                          type="number"
                          name="annualIncome"
                          value={formData.annualIncome}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="profile-form-input"
                        />
                      </div>
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-form-label">Bank Account Number</label>
                      <input
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="profile-form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="profile-documents">
                <div className="profile-documents-grid">
                  <div className="profile-document-section">
                    <h3 className="profile-form-section-title">Identity Documents</h3>
                    <div className="profile-document-list">
                      <div className="profile-document-item">
                        <div className="profile-document-info">
                          <h4 className="profile-document-title">Aadhar Card</h4>
                          <p className="profile-document-number">{formData.aadharNumber || 'Not provided'}</p>
                        </div>
                        <div className="profile-document-actions">
                          <button className="btn btn-outline btn-sm">
                            <Upload className="profile-document-icon" />
                            Upload
                          </button>
                          <button className="btn btn-outline btn-sm">
                            <Download className="profile-document-icon" />
                            Download
                          </button>
                        </div>
                      </div>
                      <div className="profile-document-item">
                        <div className="profile-document-info">
                          <h4 className="profile-document-title">PAN Card</h4>
                          <p className="profile-document-number">{formData.panNumber || 'Not provided'}</p>
                        </div>
                        <div className="profile-document-actions">
                          <button className="btn btn-outline btn-sm">
                            <Upload className="profile-document-icon" />
                            Upload
                          </button>
                          <button className="btn btn-outline btn-sm">
                            <Download className="profile-document-icon" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="profile-document-section">
                    <h3 className="profile-form-section-title">Farming Documents</h3>
                    <div className="profile-document-list">
                      <div className="profile-document-item">
                        <div className="profile-document-info">
                          <h4 className="profile-document-title">Land Records</h4>
                          <p className="profile-document-number">Not uploaded</p>
                        </div>
                        <div className="profile-document-actions">
                          <button className="btn btn-outline btn-sm">
                            <Upload className="profile-document-icon" />
                            Upload
                          </button>
                        </div>
                      </div>
                      <div className="profile-document-item">
                        <div className="profile-document-info">
                          <h4 className="profile-document-title">Bank Passbook</h4>
                          <p className="profile-document-number">Not uploaded</p>
                        </div>
                        <div className="profile-document-actions">
                          <button className="btn btn-outline btn-sm">
                            <Upload className="profile-document-icon" />
                            Upload
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="profile-activity">
                <div className="profile-activity-filters">
                  <div className="profile-filter-group">
                    <label className="profile-filter-label">Filter by:</label>
                    <select className="profile-filter-select">
                      <option value="all">All Activities</option>
                      <option value="diagnosis">Disease Diagnosis</option>
                      <option value="consultation">AI Consultation</option>
                      <option value="market">Market Prices</option>
                      <option value="scheme">Scheme Applications</option>
                    </select>
                  </div>
                  <div className="profile-filter-group">
                    <label className="profile-filter-label">Sort by:</label>
                    <select className="profile-filter-select">
                      <option value="recent">Most Recent</option>
                      <option value="oldest">Oldest First</option>
                      <option value="type">Activity Type</option>
                    </select>
                  </div>
                </div>

                <div className="profile-activity-timeline">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="profile-timeline-item">
                      <div className="profile-timeline-marker">
                        {activity.icon}
                      </div>
                      <div className="profile-timeline-content">
                        <div className="profile-timeline-header">
                          <h4 className="profile-timeline-title">{activity.title}</h4>
                          <span className="profile-timeline-time">{activity.time}</span>
                        </div>
                        <p className="profile-timeline-description">{activity.description}</p>
                        <div className={`profile-timeline-status ${getActivityStatusColor(activity.status)}`}>
                          {getActivityStatusIcon(activity.status)}
                          {activity.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="profile-settings">
                <div className="profile-settings-grid">
                  <div className="profile-settings-section">
                    <h3 className="profile-form-section-title">Account Settings</h3>
                    <div className="profile-settings-list">
                      <div className="profile-setting-item">
                        <div className="profile-setting-info">
                          <h4 className="profile-setting-title">Change Password</h4>
                          <p className="profile-setting-description">Update your account password</p>
                        </div>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="btn btn-outline"
                        >
                          <Lock className="profile-setting-icon" />
                          Change
                        </button>
                      </div>
                      <div className="profile-setting-item">
                        <div className="profile-setting-info">
                          <h4 className="profile-setting-title">Notification Preferences</h4>
                          <p className="profile-setting-description">Manage your notification settings</p>
                        </div>
                        <button className="btn btn-outline">
                          <Bell className="profile-setting-icon" />
                          Configure
                        </button>
                      </div>
                      <div className="profile-setting-item">
                        <div className="profile-setting-info">
                          <h4 className="profile-setting-title">Privacy Settings</h4>
                          <p className="profile-setting-description">Control your privacy and data sharing</p>
                        </div>
                        <button className="btn btn-outline">
                          <Shield className="profile-setting-icon" />
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="profile-settings-section">
                    <h3 className="profile-form-section-title">Danger Zone</h3>
                    <div className="profile-settings-list">
                      <div className="profile-setting-item profile-setting-danger">
                        <div className="profile-setting-info">
                          <h4 className="profile-setting-title">Delete Account</h4>
                          <p className="profile-setting-description">Permanently delete your account and all data</p>
                        </div>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="btn btn-danger"
                        >
                          <Trash2 className="profile-setting-icon" />
                          Delete
                        </button>
                      </div>
                      <div className="profile-setting-item">
                        <div className="profile-setting-info">
                          <h4 className="profile-setting-title">Logout</h4>
                          <p className="profile-setting-description">Sign out from your account</p>
                        </div>
                        <button
                          onClick={logout}
                          className="btn btn-outline"
                        >
                          <LogOut className="profile-setting-icon" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="profile-modal-overlay">
            <div className="profile-modal">
              <div className="profile-modal-header">
                <h3 className="profile-modal-title">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="profile-modal-close"
                >
                  <X className="profile-modal-close-icon" />
                </button>
              </div>
              <div className="profile-modal-content">
                <div className="profile-form-group">
                  <label className="profile-form-label">Current Password</label>
                  <div className="profile-password-input">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      className="profile-form-input"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="profile-password-toggle"
                    >
                      {showPasswords.current ? <EyeOff className="profile-password-icon" /> : <Eye className="profile-password-icon" />}
                    </button>
                  </div>
                </div>
                <div className="profile-form-group">
                  <label className="profile-form-label">New Password</label>
                  <div className="profile-password-input">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      className="profile-form-input"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="profile-password-toggle"
                    >
                      {showPasswords.new ? <EyeOff className="profile-password-icon" /> : <Eye className="profile-password-icon" />}
                    </button>
                  </div>
                </div>
                <div className="profile-form-group">
                  <label className="profile-form-label">Confirm New Password</label>
                  <div className="profile-password-input">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      className="profile-form-input"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="profile-password-toggle"
                    >
                      {showPasswords.confirm ? <EyeOff className="profile-password-icon" /> : <Eye className="profile-password-icon" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="profile-modal-actions">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="profile-modal-overlay">
            <div className="profile-modal">
              <div className="profile-modal-header">
                <h3 className="profile-modal-title">Delete Account</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="profile-modal-close"
                >
                  <X className="profile-modal-close-icon" />
                </button>
              </div>
              <div className="profile-modal-content">
                <div className="profile-delete-warning">
                  <AlertTriangle className="profile-delete-warning-icon" />
                  <h4 className="profile-delete-warning-title">Are you sure?</h4>
                  <p className="profile-delete-warning-description">
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                  </p>
                </div>
              </div>
              <div className="profile-modal-actions">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="btn btn-danger"
                >
                  {isLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 