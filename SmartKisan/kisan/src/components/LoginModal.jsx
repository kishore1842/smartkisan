import React, { useState } from "react";
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, Eye, EyeOff, Leaf, Sparkles } from 'lucide-react';

const LoginModal = ({ onClose, onSwitch }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        onClose();
        setFormData({ email: '', password: '' });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="loginModal" className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm">
      <div className="card glass max-w-md w-full p-0 animate-scale-in relative">
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-sage-400 rounded-full flex items-center justify-center animate-pulse">
            <Leaf className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2 font-heading">Welcome Back</h3>
              <p className="text-neutral-600 font-accent">Sign in to your Project Kisan account</p>
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
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Sign In
                </div>
              )}
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-600 font-accent">
              Don't have an account?{' '}
              <button
                onClick={onSwitch}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
        {/* Decorative Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-sage-400 to-earth-400"></div>
      </div>
    </div>
  );
};

export default LoginModal; 