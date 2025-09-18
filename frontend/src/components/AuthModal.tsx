'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onAuthSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin', onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [formData, setFormData] = useState({
    nickname: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.nickname,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Set token and user data with 2-week expiration
        const expires = new Date();
        expires.setTime(expires.getTime() + (14 * 24 * 60 * 60 * 1000)); // 2 weeks

        Cookies.set('token', data.token, { expires: 14 });
        Cookies.set('user', JSON.stringify(data.user), { expires: 14 });

        // Also set in localStorage for immediate access
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        onAuthSuccess(data.user);
        onClose();

        // Reset form
        setFormData({
          nickname: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setFormData({
      nickname: '',
      password: '',
      confirmPassword: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                Nickname
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your nickname"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
              style={{backgroundColor: '#645DD7'}}
              onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#5951C7')}
              onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#645DD7')}
            >
              {isLoading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={switchMode}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}