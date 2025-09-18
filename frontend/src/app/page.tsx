'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthModal from '../components/AuthModal';
import Cookies from 'js-cookie';

interface Post {
  id: string;
  title: string;
  category: string;
  whatFailed?: string;
  lessonLearned?: string;
  contents?: string;
  author: {
    username: string;
    nickname: string;
  };
  createdAt: string;
  _count: {
    comments: number;
    votes: number;
  };
}

interface User {
  id: string;
  username: string;
  nickname: string;
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'GENERAL';
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const categories = [
    { key: 'GENERAL', name: 'General', description: 'General failures and setbacks' },
    { key: 'COLLEGE', name: 'College', description: 'Academic challenges and student life' },
    { key: 'ENTREPRENEURS', name: 'Startups', description: 'Business ventures and entrepreneurship' },
    { key: 'PROFESSIONALS', name: 'Career', description: 'Workplace and professional setbacks' },
    { key: 'LIFE', name: 'Life', description: 'Personal growth and life experiences' },
  ];

  useEffect(() => {
    // Check if user is logged in from localStorage first, then cookies
    let token = localStorage.getItem('token');
    let userData = localStorage.getItem('user');

    if (!token) {
      token = Cookies.get('token');
      userData = Cookies.get('user');

      // If found in cookies, also set in localStorage
      if (token && userData) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', userData);
      }
    }

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [currentCategory]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const url = `/api/posts?category=${currentCategory}`;
      const response = await fetch(`http://localhost:3001${url}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categoryKey: string) => {
    router.push(`/?category=${categoryKey}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    router.refresh();
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
  };

  const openSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const openSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return postDate.toLocaleDateString();
  };

  const currentCategoryInfo = categories.find(cat => cat.key === currentCategory) || categories[0];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#645DD7'}}>
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="font-bold text-xl text-gray-900">LosersSpace</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/create-post"
                    className="text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                    style={{backgroundColor: '#645DD7'}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5951C7'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#645DD7'}
                  >
                    Share Failure
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">u/{user.username}</span>
                    <button 
                      onClick={handleLogout}
                      className="text-sm text-gray-700 hover:text-gray-900"
                    >
                      logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={openSignIn}
                    className="text-sm text-gray-800 hover:text-gray-900 px-3 py-1.5"
                  >
                    Log In
                  </button>
                  <button
                    onClick={openSignUp}
                    className="text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                    style={{backgroundColor: '#645DD7'}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5951C7'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#645DD7'}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-300 min-h-screen">
          <div className="p-4">
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryChange(category.key)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    currentCategory === category.key
                      ? 'bg-gray-100 border-r-2 font-medium text-gray-900'
                      : 'hover:bg-gray-50 text-gray-800'
                  }`}
                  style={currentCategory === category.key ? {borderRightColor: '#645DD7'} : {}}
                >
                  <div className="font-medium text-gray-900">f/{category.name.toLowerCase()}</div>
                  <div className="text-xs text-gray-700 mt-0.5">{category.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          {/* Category Header */}
          <div className="bg-white border-b border-gray-300 p-4">
            <h1 className="text-2xl font-bold text-gray-900">f/{currentCategoryInfo.name.toLowerCase()}</h1>
            <p className="text-gray-800 text-sm mt-1">{currentCategoryInfo.description}</p>
            <div className="flex items-center mt-3 space-x-4 text-sm text-gray-700">
              <span>Sort by: Hot</span>
              <span>•</span>
              <span>{posts.length} failures</span>
            </div>
          </div>

          {/* Posts */}
          <div className="bg-white">
            {isLoading ? (
              <div className="space-y-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border-b border-gray-200 p-4 animate-pulse">
                    <div className="flex space-x-3">
                      <div className="w-10 h-16 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="text-gray-700 text-lg mb-2">No failures in f/{currentCategoryInfo.name.toLowerCase()} yet</div>
                <p className="text-gray-600 mb-6">Be the first to share a failure in this category!</p>
                {user ? (
                  <Link
                    href="/create-post"
                    className="inline-block text-white px-6 py-2 rounded-full transition-colors"
                    style={{backgroundColor: '#645DD7'}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5951C7'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#645DD7'}
                  >
                    Share Your Failure
                  </Link>
                ) : (
                  <button
                    onClick={openSignUp}
                    className="inline-block text-white px-6 py-2 rounded-full transition-colors"
                    style={{backgroundColor: '#645DD7'}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5951C7'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#645DD7'}
                  >
                    Join Community
                  </button>
                )}
              </div>
            ) : (
              <div>
                {posts.map((post, index) => (
                  <article key={post.id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index === 0 ? '' : ''}`}>
                    <div className="flex p-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center mr-3 w-10">
                        <button className="text-gray-400 p-1" onMouseEnter={(e) => e.target.style.color = '#645DD7'} onMouseLeave={(e) => e.target.style.color = ''} style={{transition: 'color 0.2s'}}>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <span className="text-sm font-medium text-gray-800 py-1">{post._count.votes || 0}</span>
                        <button className="text-gray-400 hover:text-blue-500 p-1">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      {/* Post Content */}
                      <div className="flex-1 min-w-0">
                        {/* Post Meta */}
                        <div className="flex items-center text-xs text-gray-700 mb-2">
                          <span>f/{currentCategoryInfo.name.toLowerCase()}</span>
                          <span className="mx-1">•</span>
                          <span>Posted by u/{post.author.username}</span>
                          <span className="mx-1">•</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>

                        {/* Post Title */}
                        <h2 className="text-lg font-medium text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                          {post.title}
                        </h2>

                        {/* Post Content Preview */}
                        <div className="text-sm text-gray-800 mb-3">
                          {post.category === 'GENERAL' ? (
                            <p className="line-clamp-3">{post.contents?.slice(0, 200)}...</p>
                          ) : (
                            <div className="space-y-2">
                              {post.whatFailed && (
                                <p className="line-clamp-2">
                                  <span className="font-medium" style={{color: '#645DD7'}}>Failed:</span> {post.whatFailed.slice(0, 100)}...
                                </p>
                              )}
                              {post.lessonLearned && (
                                <p className="line-clamp-2">
                                  <span className="font-medium text-gray-900">Learned:</span> {post.lessonLearned.slice(0, 100)}...
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Post Actions */}
                        <div className="flex items-center space-x-4 text-xs text-gray-700">
                          <button className="flex items-center space-x-1 hover:bg-gray-100 px-2 py-1 rounded">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                            <span>{post._count.comments} comments</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:bg-gray-100 px-2 py-1 rounded">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                            <span>Share</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:bg-gray-100 px-2 py-1 rounded">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                            </svg>
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Community Info */}
        <div className="w-80 p-4">
          <div className="bg-white rounded-lg border border-gray-300 p-4">
            <h3 className="font-medium text-gray-900 mb-3">About f/{currentCategoryInfo.name.toLowerCase()}</h3>
            <p className="text-sm text-gray-800 mb-4">{currentCategoryInfo.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Members</span>
                <span className="font-medium text-gray-900">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Online</span>
                <span className="font-medium text-gray-900">56</span>
              </div>
            </div>
            {user && (
              <Link 
                href="/create-post"
                className="w-full text-white text-center py-2 rounded-full mt-4 block transition-colors"
                style={{backgroundColor: '#645DD7'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#5951C7'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#645DD7'}
              >
                Create Post
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}