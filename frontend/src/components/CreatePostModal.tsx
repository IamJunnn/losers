'use client';

import { useState, useEffect } from 'react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  initialCategory?: string;
}

interface PostFormData {
  title: string;
  category: string;
  whatFailed: string;
  lessonLearned: string;
  contents: string;
}

export default function CreatePostModal({ 
  isOpen, 
  onClose, 
  onPostCreated, 
  initialCategory = 'GENERAL' 
}: CreatePostModalProps) {
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    category: initialCategory,
    whatFailed: '',
    lessonLearned: '',
    contents: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { key: 'GENERAL', name: 'General', description: 'General failures and setbacks' },
    { key: 'COLLEGE', name: 'College', description: 'Academic challenges and student life' },
    { key: 'ENTREPRENEURS', name: 'Startups', description: 'Business ventures and entrepreneurship' },
    { key: 'PROFESSIONALS', name: 'Career', description: 'Workplace and professional setbacks' },
    { key: 'LIFE', name: 'Life', description: 'Personal growth and life experiences' },
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        category: initialCategory,
        whatFailed: '',
        lessonLearned: '',
        contents: ''
      });
      setError('');
    }
  }, [isOpen, initialCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return 'Title is required';
    }
    
    if (formData.category === 'GENERAL') {
      if (!formData.contents.trim()) {
        return 'Content is required for General posts';
      }
    } else {
      if (!formData.whatFailed.trim()) {
        return 'What failed is required';
      }
      if (!formData.lessonLearned.trim()) {
        return 'Lesson learned is required';
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onPostCreated();
        onClose();
      } else {
        setError(data.message || 'Failed to create post');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedCategory = categories.find(cat => cat.key === formData.category) || categories[0];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Share Your Failure</h2>
            <p className="text-sm text-gray-600 mt-1">
              Help others learn from your experience
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-[var(--font-primary)] mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9E3D] focus:border-transparent transition-all duration-200 hover:border-gray-400 text-[var(--font-secondary)] font-medium placeholder:text-[var(--font-placeholder)]"
            >
              {categories.map((category) => (
                <option key={category.key} value={category.key}>
                  f/{category.name.toLowerCase()} - {category.description}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[var(--font-primary)] mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={150}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9E3D] focus:border-transparent transition-all duration-200 hover:border-gray-400 text-[var(--font-secondary)] font-medium placeholder:text-[var(--font-placeholder)]"
              placeholder="Give your failure a descriptive title..."
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.title.length} / 150
            </div>
          </div>

          {/* Conditional Fields Based on Category */}
          {formData.category === 'GENERAL' ? (
            <div>
              <label htmlFor="contents" className="block text-sm font-medium text-[var(--font-primary)] mb-2">
                Tell us about your failure
              </label>
              <textarea
                id="contents"
                name="contents"
                value={formData.contents}
                onChange={handleInputChange}
                required
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9E3D] focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none text-[var(--font-secondary)] font-medium placeholder:text-[var(--font-placeholder)]"
                placeholder="Share your experience, what went wrong, and what you learned..."
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* What Failed */}
              <div>
                <label htmlFor="whatFailed" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-[#FF9E3D] font-semibold">What failed?</span>
                </label>
                <textarea
                  id="whatFailed"
                  name="whatFailed"
                  value={formData.whatFailed}
                  onChange={handleInputChange}
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9E3D] focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none text-[var(--font-secondary)] font-medium placeholder:text-[var(--font-placeholder)]"
                  placeholder="Describe what went wrong, what didn't work, or what you attempted..."
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.whatFailed.length} / 500
                </div>
              </div>

              {/* Lesson Learned */}
              <div>
                <label htmlFor="lessonLearned" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-[#44BBA4] font-semibold">What did you learn?</span>
                </label>
                <textarea
                  id="lessonLearned"
                  name="lessonLearned"
                  value={formData.lessonLearned}
                  onChange={handleInputChange}
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9E3D] focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none text-[var(--font-secondary)] font-medium placeholder:text-[var(--font-placeholder)]"
                  placeholder="What insights, lessons, or advice would you share with others?"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.lessonLearned.length} / 500
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-[#EF233C] px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-[#FF9E3D] hover:bg-[#FF8C1A] text-black rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sharing...
                </>
              ) : (
                'Share Failure'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}