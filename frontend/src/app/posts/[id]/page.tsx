'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  const iconClass = direction === 'up' ? "w-6 h-6 transform rotate-180" : "w-6 h-6";
  const buttonClass = `p-2 rounded-md transition-colors duration-200 ${isActive ? (direction === 'up' ? 'text-purple-600 bg-purple-100' : 'text-blue-600 bg-blue-100') : 'text-gray-400 hover:bg-gray-100'}`;
  return (
    <button className={buttonClass} onClick={onClick}>
      <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
    </button>
  );
}

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userVote, setUserVote] = useState<'up' | 'down' | undefined>(undefined);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || Cookies.get('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3001/api/posts/${id}`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      setPost(data);
      if (data.userVote !== undefined) {
        setUserVote(data.userVote ? 'up' : 'down');
      }
    } catch (err) {
      setError(err.message);
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
      const response = await fetch(`http://localhost:3001/api/posts/${id}/vote`, {
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
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }

  if (!post) {
    return <div className="text-center py-20">Post not found.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-lg font-semibold text-gray-700 hover:text-purple-600">
              &larr; Back to Failures
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-soft rounded-xl border border-gray-200">
          <div className="p-8">
            <div className="flex">
              {/* Vote Section */}
              <div className="flex flex-col items-center mr-6">
                <VoteButton direction="up" onClick={() => handleVote('up')} isActive={userVote === 'up'} />
                <span className="text-2xl font-bold text-gray-800 py-3">{post.netVotes}</span>
                <VoteButton direction="down" onClick={() => handleVote('down')} isActive={userVote === 'down'} />
              </div>

              {/* Content Section */}
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-2">
                  <span>Posted by u/{post.author.username} on {formatDate(post.createdAt)}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>

                {post.category === 'GENERAL' ? (
                  <div className="prose max-w-none">
                    <p>{post.contents}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-500 mb-2">What failed?</h2>
                      <p className="text-gray-700 leading-relaxed">{post.whatFailed}</p>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-500 mb-2">What did you learn?</h2>
                      <p className="text-gray-700 leading-relaxed">{post.lessonLearned}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 px-8 py-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{post.comments.length} Comments</h2>
              <button
                onClick={() => setShowCommentsModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Write a comment
              </button>
            </div>
            <div className="space-y-6">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                    {comment.author.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline space-x-2">
                      <span className="font-semibold text-gray-800">u/{comment.author.username}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
              {post.comments.length === 0 && (
                <p className="text-gray-500">Be the first to comment!</p>
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
