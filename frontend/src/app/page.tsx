'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthModal from '../components/AuthModal';
import CreatePostModal from '../components/CreatePostModal';
import CommentsModal from '../components/CommentsModal';
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

// Vote Button Component
function VoteButton({ direction, onClick, isActive }: { 
  direction: 'up' | 'down', 
  onClick: () => void,
  isActive?: boolean 
}) {
  const iconClass = direction === 'up' 
    ? "w-5 h-5 transform rotate-180" 
    : "w-5 h-5";
    
  const buttonClass = `p-1.5 rounded-md transition-all duration-200 hover:scale-110 ${
    isActive 
      ? direction === 'up' 
        ? 'text-[#FF9E3D] bg-orange-50'
        : 'text-blue-500 bg-blue-50'
      : 'text-gray-400 hover:text-[#FF9E3D] hover:bg-gray-50'
  }`;

  return (
    <button className={buttonClass} onClick={onClick}>
      <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  );
}

// Action Button Component
function ActionButton({ icon, text, onClick, count }: {
  icon: React.ReactNode,
  text: string,
  onClick?: () => void,
  count?: number
}) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200"
    >
      {icon}
      <span>{count !== undefined ? `${count} ${text}` : text}</span>
    </button>
  );
}

// Category Button Component
function CategoryButton({ category, isActive, onClick }: {
  category: { key: string, name: string, description: string },
  isActive: boolean,
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all duration-200 group ${
        isActive
          ? 'bg-gradient-to-r from-[#FF9E3D]/10 to-[#FF9E3D]/5 border-r-3 border-[#FF9E3D] font-medium shadow-sm'
          : 'hover:bg-gray-50 text-gray-700'
      }`}
    >
      <div className={`font-medium ${isActive ? 'text-[#FF9E3D]' : 'text-gray-900 group-hover:text-[#FF9E3D]'} transition-colors duration-200`}>
        l/{category.name.toLowerCase()}
      </div>
      <div className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-600 transition-colors duration-200">
        {category.description}
      </div>
    </button>
  );
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'GENERAL';

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [votedPosts, setVotedPosts] = useState<Record<string, 'up' | 'down'>>({});
  const [theme, setTheme] = useState('light');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const categories = [
    { key: 'GENERAL', name: 'General', description: 'General failures and setbacks' },
    { key: 'COLLEGE', name: 'College', description: 'Academic challenges and student life' },
    { key: 'ENTREPRENEURS', name: 'Startups', description: 'Business ventures and entrepreneurship' },
    { key: 'PROFESSIONALS', name: 'Career', description: 'Workplace and professional setbacks' },
    { key: 'LIFE', name: 'Life', description: 'Personal growth and life experiences' },
  ];

  useEffect(() => {
    // Check if user is logged in
    let token = localStorage.getItem('token');
    let userData = localStorage.getItem('user');

    if (!token) {
      token = Cookies.get('token') || null;
      userData = Cookies.get('user') || null;

      if (token && userData) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', userData);
      }
    }

    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [currentCategory]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const url = `/api/posts?category=${currentCategory}`;
      const token = localStorage.getItem('token') || Cookies.get('token');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);

        // Set initial vote state from server data
        const initialVotes: Record<string, 'up' | 'down'> = {};
        data.forEach((post: { id: string; userVote?: boolean }) => {
          if (post.userVote !== undefined) {
            initialVotes[post.id] = post.userVote ? 'up' : 'down';
          }
        });
        setVotedPosts(initialVotes);
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
    fetchPosts(); // Refresh posts to get user's vote status
  };

  const handlePostCreated = () => {
    fetchPosts(); // Refresh the posts list
  };

  const handleCreatePost = () => {
    if (!user) {
      setAuthMode('signup');
      setShowAuthModal(true);
    } else {
      setShowCreatePostModal(true);
    }
  };

  const handleVote = async (postId: string, direction: 'up' | 'down') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('token') || Cookies.get('token');
      const isUpvote = direction === 'up';

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ isUpvote }),
      });

      if (response.ok) {
        const voteData = await response.json();

        // Update the post's vote count in the posts state
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, _count: { ...post._count, votes: voteData.netVotes } }
            : post
        ));

        // Update local vote tracking
        setVotedPosts(prev => ({
          ...prev,
          [postId]: voteData.userVote
        }));
      } else {
        const errorData = await response.text();
        console.error('Failed to vote on post. Status:', response.status, 'Error:', errorData);
      }
    } catch (error) {
      console.error('Error voting on post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || Cookies.get('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        // Remove the post from the local state
        setPosts(prev => prev.filter(post => post.id !== postId));
      } else {
        alert('Failed to delete post. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleOpenComments = (post: Post) => {
    setSelectedPost(post);
    setShowCommentsModal(true);
  };

  const handleCommentAdded = () => {
    if (selectedPost) {
      // Update the comment count for the selected post
      setPosts(prev => prev.map(post =>
        post.id === selectedPost.id
          ? { ...post, _count: { ...post._count, comments: post._count.comments + 1 } }
          : post
      ));

      // Update the selectedPost as well
      setSelectedPost(prev => prev ? {
        ...prev,
        _count: { ...prev._count, comments: prev._count.comments + 1 }
      } : null);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
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

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border-b border-gray-200 p-6 animate-pulse">
          <div className="flex space-x-4">
            <div className="w-10 space-y-2">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="w-6 h-4 bg-gray-200 rounded mx-auto"></div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-5 bg-gray-200 rounded w-4/5"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="flex space-x-4">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Mobile Layout */}
            <div className="flex items-center justify-between w-full sm:hidden">
              {/* Left: Hamburger Menu */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Center: Logo */}
              <Link href="/" className="flex items-center">
                <img
                  src="/logo_main.png"
                  alt="LosersSpace Logo"
                  className="h-8 w-auto"
                />
              </Link>

              {/* Right: Create Post Button (+ icon) */}
              <button
                onClick={handleCreatePost}
                className="p-2 rounded-full bg-[#FF9E3D] hover:bg-[#FF8C1A] text-black transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 group">
                <img
                  src="/2.png"
                  alt="LosersSpace Logo"
                  className="h-12 w-auto transition-opacity duration-200 group-hover:opacity-80"
                />
              </Link>
            </div>

            <div className="hidden sm:flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-200 ${
                  theme === 'dark'
                    ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 hover:text-yellow-300 border border-yellow-400/20'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                )}
              </button>
              {user ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCreatePost}
                    className="bg-[#FF9E3D] hover:bg-[#FF8C1A] text-black px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Share Failure
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 font-medium">u/{user.username}</span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-all duration-200"
                    >
                      logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                    className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-all duration-200"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                    className="bg-[#FF9E3D] hover:bg-[#FF8C1A] text-black px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}></div>
          <div className="fixed top-0 left-0 w-80 h-full bg-white shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <img
                  src="/logo_main.png"
                  alt="LosersSpace Logo"
                  className="h-8 w-auto"
                />
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Categories in Mobile Menu */}
              <div className="space-y-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => {
                      handleCategoryChange(category.key);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
                      currentCategory === category.key
                        ? 'bg-gradient-to-r from-[#FF9E3D]/10 to-[#FF9E3D]/5 border-r-3 border-[#FF9E3D] font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`font-medium ${currentCategory === category.key ? 'text-[#FF9E3D]' : 'text-gray-900'}`}>
                      l/{category.name.toLowerCase()}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {category.description}
                    </div>
                  </button>
                ))}
              </div>

              {/* User Actions in Mobile Menu */}
              {user ? (
                <div className="border-t pt-4 space-y-3">
                  <div className="text-sm text-gray-700 font-medium">u/{user.username}</div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {theme === 'light' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                      </svg>
                    )}
                    <span>Toggle theme</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="border-t pt-4 space-y-3">
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setShowAuthModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full bg-[#FF9E3D] hover:bg-[#FF8C1A] text-black text-center py-2 rounded-md text-sm font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden sm:block w-80 bg-white border-r border-gray-200 min-h-screen shadow-sm">
          <div className="p-4">
            <div className="space-y-2">
              {categories.map((category) => (
                <CategoryButton
                  key={category.key}
                  category={category}
                  isActive={currentCategory === category.key}
                  onClick={() => handleCategoryChange(category.key)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          {/* Category Header - Hidden on mobile */}
          <div className="hidden sm:block bg-white border-b border-gray-200 p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">l/{currentCategoryInfo.name.toLowerCase()}</h1>
            <p className="text-gray-600 text-sm mt-1">{currentCategoryInfo.description}</p>
            <div className="flex items-center mt-4 space-x-4 text-sm text-gray-500">
              <span>{posts.length} failures</span>
            </div>
          </div>

          {/* Posts */}
          <div className="bg-white shadow-sm">
            {isLoading ? (
              <LoadingSkeleton />
            ) : posts.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-gray-700 text-lg mb-2 font-medium">No failures in l/{currentCategoryInfo.name.toLowerCase()} yet</div>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Be the first to share a failure in this category and help others learn from your experience!</p>
                {user ? (
                  <button
                    onClick={handleCreatePost}
                    className="inline-block bg-[#FF9E3D] hover:bg-[#FF8C1A] text-black px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Share Your Failure
                  </button>
                ) : (
                  <button
                    onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                    className="inline-block bg-[#FF9E3D] hover:bg-[#FF8C1A] text-black px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Join Community
                  </button>
                )}
              </div>
            ) : (
              <div>
                {posts.map((post, index) => (
                  <article key={post.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-all duration-200">
                    <div className="flex p-6">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center mr-4 w-12">
                        <VoteButton 
                          direction="up" 
                          onClick={() => handleVote(post.id, 'up')}
                          isActive={votedPosts[post.id] === 'up'}
                        />
                        <span className="text-sm font-semibold text-gray-700 py-2 min-w-[2rem] text-center">
                          {post._count.votes || 0}
                        </span>
                        <VoteButton 
                          direction="down" 
                          onClick={() => handleVote(post.id, 'down')}
                          isActive={votedPosts[post.id] === 'down'}
                        />
                      </div>

                      {/* Post Content */}
                      <div className="flex-1 min-w-0">
                        {/* Post Meta */}
                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <span className="font-medium text-[#FF9E3D]">l/{currentCategoryInfo.name.toLowerCase()}</span>
                          <span className="mx-2">•</span>
                          <span>Posted by </span>
                          <span className="font-medium text-gray-700 ml-1">u/{post.author.username}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>

                        <Link href={`/posts/${post.id}?category=${currentCategory}`} className="block cursor-pointer">
                          {/* Post Title */}
                          <h2 className="text-lg font-semibold text-gray-900 mb-4 hover:text-[#FF9E3D] transition-colors duration-200 line-clamp-2">
                            {post.title}
                          </h2>

                          {/* Post Content Preview */}
                          <div className="text-sm text-gray-700 mb-4 leading-relaxed">
                            {post.category === 'GENERAL' ? (
                              <p className="line-clamp-3">{post.contents?.slice(0, 200)}...</p>
                            ) : (
                              <div className="space-y-3">
                                {post.whatFailed && (
                                  <p className="line-clamp-2">
                                    <span className="font-semibold text-[#FF9E3D]">Failed:</span> 
                                    <span className="ml-1">{post.whatFailed.slice(0, 100)}...</span>
                                  </p>
                                )}
                                {post.lessonLearned && (
                                  <p className="line-clamp-2">
                                    <span className="font-semibold text-[#44BBA4]">Learned:</span> 
                                    <span className="ml-1">{post.lessonLearned.slice(0, 100)}...</span>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Post Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <ActionButton
                              icon={
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                              }
                              text="comments"
                              count={post._count.comments}
                              onClick={() => handleOpenComments(post)}
                            />
                          </div>

                          {/* Delete button - only visible to post author */}
                          {user && user.username === post.author.username && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs text-[#EF233C] hover:bg-red-50 hover:text-[#D91E36] transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">About l/{currentCategoryInfo.name.toLowerCase()}</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">{currentCategoryInfo.description}</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                What should I place here? Tell me your thoughts to{' '}
                <a
                  href="mailto:lovejsson@gmail.com"
                  className="text-[#FF9E3D] hover:text-[#FF8C1A] font-medium underline transition-colors duration-200"
                >
                  lovejsson@gmail.com
                </a>
              </p>
            </div>
            {user && (
              <button
                onClick={handleCreatePost}
                className="w-full bg-[#FF9E3D] hover:bg-[#FF8C1A] text-black text-center py-3 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Create Post
              </button>
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

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onPostCreated={handlePostCreated}
        initialCategory={currentCategory}
      />

      {/* Comments Modal */}
      {selectedPost && (
        <CommentsModal
          isOpen={showCommentsModal}
          onClose={() => {
            setShowCommentsModal(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}