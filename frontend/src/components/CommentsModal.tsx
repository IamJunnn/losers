'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface Comment {
  id: string;
  content: string;
  author: {
    username: string;
    nickname: string;
  };
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  author: {
    username: string;
    nickname: string;
  };
  
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onCommentAdded?: () => void;
}

export default function CommentsModal({ isOpen, onClose, post, onCommentAdded }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{ username: string; nickname: string } | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user') || Cookies.get('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, post.id]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token') || Cookies.get('token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');

        // Notify parent component that a comment was added
        if (onCommentAdded) {
          onCommentAdded();
        }
      } else {
        alert('Failed to post comment. Please try again.');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return commentDate.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300 pointer-events-auto border border-gray-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {post.title} • by u/{post.author.username}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No comments yet</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-[#FF9E3D] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                      {comment.author.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">u/{comment.author.username}</span>
                      <span className="text-gray-500 text-sm">•</span>
                      <span className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        {user ? (
          <div className="p-6 border-t border-gray-200">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-[#FF9E3D] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="What are your thoughts?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#FF9E3D] focus:border-transparent transition-all duration-200 text-gray-900 font-medium"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/500 characters
                    </span>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmitting}
                      className="bg-[#FF9E3D] hover:bg-[#FF8C1A] disabled:bg-gray-300 disabled:cursor-not-allowed text-black px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                    >
                      {isSubmitting ? 'Posting...' : 'Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 border-t border-gray-200 text-center">
            <p className="text-gray-500 mb-4">You need to be logged in to comment</p>
            <button
              onClick={onClose}
              className="text-[#FF9E3D] hover:text-[#FF8C1A] font-medium text-sm transition-colors duration-200"
            >
              Close and log in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}