import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { documentAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Search, 
  Filter, 
  Plus,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Calendar,
  Hash,
  File,
  Image,
  FileImage,
  FileVideo,
  FileAudio,
  Archive
} from 'lucide-react';
import './Documents.css';

const Documents = () => {
  const { isAuthenticated, user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    documentType: '',
    documentNumber: '',
    description: ''
  });

  const documentTypes = [
    'All',
    'Identity Documents',
    'Land Records',
    'Bank Documents',
    'Crop Certificates',
    'Insurance Papers',
    'Other'
  ];

  const fileTypes = [
    'Identity Documents',
    'Land Records', 
    'Bank Documents',
    'Crop Certificates',
    'Insurance Papers',
    'Other'
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments();
    }
  }, [isAuthenticated]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentAPI.getUserDocuments();
      // Sort by createdAt descending
      const sortedDocs = (response.data.documents || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDocuments(sortedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents. Please try again.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size should be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.documentType) {
      toast.error('Please select a file and document type');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', uploadForm.documentType);
      formData.append('documentNumber', uploadForm.documentNumber);
      formData.append('description', uploadForm.description);

      await documentAPI.uploadDocument(formData);
      toast.success('Document uploaded successfully!');
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({
        documentType: '',
        documentNumber: '',
        description: ''
      });
      fetchDocuments(); // Refresh documents
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleView = (doc) => {
    window.open(doc.documentImage.path, '_blank');
  };

  const handleDownload = (doc) => {
    const link = document.createElement('a');
    link.href = doc.documentImage.path;
    link.target = '_blank';
    link.download = doc.documentImage.path.split('/').pop().split('?')[0];
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentAPI.deleteDocument(documentId);
      toast.success('Document deleted successfully!');
      fetchDocuments(); // Refresh documents
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Verified': return <CheckCircle className="document-status-icon document-status-icon-success" />;
      case 'Rejected': return <XCircle className="document-status-icon document-status-icon-error" />;
      case 'Under Review': return <Clock className="document-status-icon document-status-icon-warning" />;
      case 'Pending': return <AlertCircle className="document-status-icon document-status-icon-info" />;
      default: return <Clock className="document-status-icon document-status-icon-info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified': return 'document-status-success';
      case 'Rejected': return 'document-status-error';
      case 'Under Review': return 'document-status-warning';
      case 'Pending': return 'document-status-info';
      default: return 'document-status-info';
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return <FileText className="document-file-icon" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <Image className="document-file-icon" />;
      case 'mp4':
      case 'avi':
      case 'mov': return <FileVideo className="document-file-icon" />;
      case 'mp3':
      case 'wav': return <FileAudio className="document-file-icon" />;
      case 'zip':
      case 'rar': return <Archive className="document-file-icon" />;
      default: return <File className="document-file-icon" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="documents-auth-required">
            <div className="documents-auth-icon">
              <Shield className="documents-auth-icon-svg" />
            </div>
            <h1 className="documents-auth-title">Authentication Required</h1>
            <p className="documents-auth-description">
              Please log in to access your documents and upload new ones.
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
        <div className="documents-hero">
          <div className="documents-hero-content">
            <div className="documents-hero-info">
              <h1 className="documents-hero-title">
                Document <span className="documents-hero-highlight">Management</span>
              </h1>
              <p className="documents-hero-description">
                Upload, organize, and manage all your important farming documents in one secure place.
              </p>
            </div>
            <div className="documents-hero-stats">
              <div className="documents-stat">
                <div className="documents-stat-number">{documents.length}</div>
                <div className="documents-stat-label">Total Documents</div>
              </div>
              <div className="documents-stat">
                <div className="documents-stat-number">
                  {documents.filter(d => d.status === 'Verified').length}
                </div>
                <div className="documents-stat-label">Verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="documents-section">
          <div className="documents-section-header">
            <h2 className="documents-section-title">
              <FileText className="documents-section-icon" />
              Your Documents
            </h2>
            <div className="documents-section-count">
              {documents.length} documents found
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowUploadModal(true)}
              style={{ marginLeft: 'auto' }}
            >
              <Plus className="documents-upload-icon" />
              Upload Document
            </button>
          </div>

          {loading ? (
            <div className="documents-loading">
              <div className="documents-loading-spinner"></div>
              <p>Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="documents-empty">
              <FileText className="documents-empty-icon" />
              <h3>No documents found</h3>
              <p>Upload your first document to get started.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                <Plus className="documents-upload-icon" />
                Upload Document
              </button>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.map((doc) => (
                <div key={doc._id} className="document-card">
                  <div className="document-header">
                    <div className="document-icon">
                      {getFileIcon(doc.documentImage.path)}
                    </div>
                    <div className="document-badge">
                      {doc.documentType}
                    </div>
                  </div>
                  <div className="document-content">
                    <h3 className="document-title">{doc.documentType}</h3>
                    <p className="document-description">
                      {doc.description || 'No description provided'}
                    </p>
                    <div className="document-details">
                      <div className="document-detail">
                        <Hash className="document-detail-icon" />
                        <span>{doc.documentNumber || 'No number'}</span>
                      </div>
                      <div className="document-detail">
                        <Calendar className="document-detail-icon" />
                        <span>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="document-detail">
                        <File className="document-detail-icon" />
                        <span>{doc.documentImage.path.split('/').pop().split('?')[0]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="document-footer">
                    <div className={`document-status ${getStatusColor(doc.status)}`}> 
                      {getStatusIcon(doc.status)}
                      <span className="document-status-text">{doc.status}</span>
                    </div>
                    <div className="document-actions">
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleView(doc)}
                        title="View Document"
                      >
                        <Eye className="document-action-icon" />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDownload(doc)}
                        title="Download Document"
                      >
                        <Download className="document-action-icon" />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(doc._id)}
                        title="Delete Document"
                      >
                        <Trash2 className="document-action-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="documents-modal-overlay">
            <div className="documents-modal">
              <div className="documents-modal-header">
                <h3 className="documents-modal-title">Upload Document</h3>
                <button 
                  className="documents-modal-close"
                  onClick={() => setShowUploadModal(false)}
                >
                  <XCircle />
                </button>
              </div>
              <div className="documents-modal-content">
                <div className="documents-upload-area">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="documents-file-input"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                  />
                  {selectedFile ? (
                    <div className="documents-file-selected">
                      <FileText className="documents-file-icon" />
                      <span>{selectedFile.name}</span>
                    </div>
                  ) : (
                    <div className="documents-upload-placeholder">
                      <Upload className="documents-upload-placeholder-icon" />
                      <p>Click to select a file or drag and drop</p>
                      <p className="documents-upload-hint">Supports PDF, Images, Documents (Max 10MB)</p>
                    </div>
                  )}
                </div>
                <div className="documents-form">
                  <div className="documents-form-group">
                    <label className="documents-form-label">Document Type</label>
                    <select
                      value={uploadForm.documentType}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, documentType: e.target.value }))}
                      className="documents-form-select"
                    >
                      <option value="">Select document type</option>
                      {fileTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="documents-form-group">
                    <label className="documents-form-label">Document Number (Optional)</label>
                    <input
                      type="text"
                      value={uploadForm.documentNumber}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, documentNumber: e.target.value }))}
                      className="documents-form-input"
                      placeholder="e.g., Aadhar number, land record number"
                    />
                  </div>
                  <div className="documents-form-group">
                    <label className="documents-form-label">Description (Optional)</label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      className="documents-form-textarea"
                      placeholder="Brief description of the document"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              <div className="documents-modal-footer">
                <button 
                  className="btn btn-ghost"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile || !uploadForm.documentType}
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents; 