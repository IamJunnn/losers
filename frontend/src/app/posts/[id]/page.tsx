'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import CommentsModal from '../../../components/CommentsModal';

// Re-using interfaces and components from the main page would be ideal
// For this example, they are redefined for clarity.

interface Author {
  username: string;
  nickname: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
}

interface Post {
  id: string;
  title: string;
  category: string;
  whatFailed?: string;
  lessonLearned?: string;
  contents?: string;
  author: Author;
  createdAt: string;
  netVotes: number;
  userVote?: boolean;
  comments: Comment[];
  
}

// Simplified VoteButton for demonstration
function VoteButton({ direction, onClick, isActive }: { direction: 'up' | 'down', onClick: () => void, isActive?: boolean }) {
  const iconClass = direction === 'up' ? "w-5 h-5 sm:w-6 sm:h-6 transform rotate-180" : "w-5 h-5 sm:w-6 sm:h-6";
  const buttonClass = `p-3 sm:p-2 rounded-md transition-colors duration-200 touch-manipulation ${isActive ? (direction === 'up' ? 'text-[#FF9E3D] bg-orange-100' : 'text-blue-600 bg-blue-100') : 'text-gray-400 hover:bg-gray-100 active:bg-gray-200'}`;
  return (
    <button className={buttonClass} onClick={onClick}>
      <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
    </button>
  );
}

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const category = searchParams.get('category') || 'GENERAL';

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userVote, setUserVote] = useState<'up' | 'down' | undefined>(undefined);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || Cookies.get('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      setPost(data);
      if (data.userVote !== undefined) {
        setUserVote(data.userVote ? 'up' : 'down');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchPost();
  }, [id]);

  const handleVote = async (direction: 'up' | 'down') => {
    const token = localStorage.getItem('token') || Cookies.get('token');
    if (!token) {
      // Handle not logged in user
      router.push('/?auth=signin');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isUpvote: direction === 'up' }),
      });

      if (response.ok) {
        const voteData = await response.json();
        setPost(prevPost => prevPost ? { ...prevPost, netVotes: voteData.netVotes } : null);
        setUserVote(voteData.userVote === null ? undefined : (voteData.userVote ? 'up' : 'down'));
      }
    } catch (error) {
      console.error('Failed to vote', error);
    }
  };

  const handleCommentAdded = () => {
    fetchPost(); // Re-fetch the post to get the latest comments
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading post...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-[#EF233C]">Error: {error}</div>;
  }

  if (!post) {
    return <div className="text-center py-20">Post not found.</div>;
  }

  const categories = [
    { key: 'GENERAL', name: 'General', description: 'General failures and setbacks' },
    { key: 'COLLEGE', name: 'College', description: 'Academic challenges and student life' },
    { key: 'ENTREPRENEURS', name: 'Startups', description: 'Business ventures and entrepreneurship' },
    { key: 'PROFESSIONALS', name: 'Career', description: 'Workplace and professional setbacks' },
    { key: 'LIFE', name: 'Life', description: 'Personal growth and life experiences' },
  ];

  const handleCategoryChange = (categoryKey: string) => {
    router.push(`/?category=${categoryKey}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-16">
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

              {/* Right: Back Button */}
              <Link href={`/?category=${category}`} className="p-2 rounded-md text-gray-700 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
            </div>

            {/* Desktop Layout */}
            <Link href={`/?category=${category}`} className="hidden sm:block text-sm sm:text-lg font-semibold text-gray-700 hover:text-[#FF9E3D] transition-colors">
              &larr; Back to l/{category.toLowerCase()}
            </Link>
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
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      handleCategoryChange(cat.key);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
                      category === cat.key
                        ? 'bg-gradient-to-r from-[#FF9E3D]/10 to-[#FF9E3D]/5 border-r-3 border-[#FF9E3D] font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`font-medium ${category === cat.key ? 'text-[#FF9E3D]' : 'text-gray-900'}`}>
                      l/{cat.name.toLowerCase()}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {cat.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-soft rounded-xl border border-gray-200">
          <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row">
              {/* Vote Section - Mobile: horizontal at top, Desktop: vertical on left */}
              <div className="flex sm:flex-col items-center justify-center sm:justify-start mb-4 sm:mb-0 sm:mr-6 order-2 sm:order-1">
                <VoteButton direction="up" onClick={() => handleVote('up')} isActive={userVote === 'up'} />
                <span className="text-xl sm:text-2xl font-bold text-gray-800 px-4 sm:px-0 sm:py-3">{post.netVotes}</span>
                <VoteButton direction="down" onClick={() => handleVote('down')} isActive={userVote === 'down'} />
              </div>

              {/* Content Section */}
              <div className="flex-1 order-1 sm:order-2">
                <div className="text-xs sm:text-sm text-gray-500 mb-2">
                  <span>Posted by u/{post.author.username} on {formatDate(post.createdAt)}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">{post.title}</h1>

                {post.category === 'GENERAL' ? (
                  <div className="prose max-w-none">
                    <p className="text-sm sm:text-base leading-relaxed">{post.contents}</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-[#FF9E3D] mb-2">What failed?</h2>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{post.whatFailed}</p>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-[#44BBA4] mb-2">What did you learn?</h2>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{post.lessonLearned}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{post.comments.length} Comments</h2>
              <button
                onClick={() => setShowCommentsModal(true)}
                className="bg-[#FF9E3D] hover:bg-[#FF8C1A] text-black px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-colors w-full sm:w-auto"
              >
                Write a comment
              </button>
            </div>
            <div className="space-y-4 sm:space-y-6">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-sm sm:text-base">
                    {comment.author.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span className="font-semibold text-gray-800 text-sm sm:text-base">u/{comment.author.username}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 mt-1 text-sm sm:text-base leading-relaxed break-words">{comment.content}</p>
                  </div>
                </div>
              ))}
              {post.comments.length === 0 && (
                <p className="text-gray-500 text-sm sm:text-base">Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {post && (
        <CommentsModal
          isOpen={showCommentsModal}
          onClose={() => setShowCommentsModal(false)}
          post={post}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}
