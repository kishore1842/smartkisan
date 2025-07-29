import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { X, Mail, KeyRound, Sparkles } from 'lucide-react';

const VerifyOTPModal = ({ onClose, defaultEmail }) => {
  const { verifyOTP } = useAuth();
  const [formData, setFormData] = useState({
    email: defaultEmail || '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultEmail) {
      setFormData((prev) => ({ ...prev, email: defaultEmail }));
    }
  }, [defaultEmail]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.otp.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const result = await verifyOTP(formData.email.trim(), formData.otp.trim());
      if (result.success) {
        onClose();
        setFormData({ email: '', otp: '' });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="verifyOTPModal" className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm">
      <div className="card glass max-w-md w-full p-0 animate-scale-in relative">
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-sage-400 rounded-full flex items-center justify-center animate-pulse">
            <KeyRound className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2 font-heading">Verify OTP</h3>
              <p className="text-neutral-600 font-accent">Enter the OTP sent to your email</p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">OTP Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  className="form-input pl-10"
                  placeholder="Enter OTP code"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-lg py-3 hover-lift"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner w-5 h-5 mr-2"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Verify OTP
                </div>
              )}
            </button>
          </form>
        </div>
        {/* Decorative Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-sage-400 to-earth-400"></div>
      </div>
    </div>
  );
};

export default VerifyOTPModal; 