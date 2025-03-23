// src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import postService, { Post as PostType } from '../services/postService';
import authService from '../services/authService';
import PostList from '../components/PostList';

const Alert = ({
  severity,
  children,
  onClose,
}: {
  severity: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  const bgColor = severity === 'error' ? 'bg-red-100' : 'bg-blue-100';
  const textColor = severity === 'error' ? 'text-red-700' : 'text-blue-700';

  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-lg flex justify-between items-center mb-4`}>
      <span>{children}</span>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
    </div>
  );
};

const Home = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await postService.getAllPosts();
      setPosts(fetchedPosts);
      console.log(fetchedPosts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      await postService.likePost(postId);
      fetchPosts();
    } catch (err: any) {
      setError(err.message || 'Failed to like post');
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      await postService.addComment(postId, content);
      fetchPosts();
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-[#E8DCC4]">
      <div className="bg-white/40 backdrop-blur-sm min-h-screen">
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-2xl font-medium text-[#8B7355] text-center mb-8">
            Latest Posts
          </h1>

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <PostList
            posts={posts}
            currentUserId={currentUser?.id}
            onLike={handleLike}
            onComment={handleComment}
            isLoading={loading}
            error={error}
            emptyMessage="No posts yet. Be the first to share!"
            showEditControls={false}
          />

          {currentUser && (
            <button
              onClick={() => navigate('/create-post')}
              className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-[#8B7355] to-[#BCA17F] hover:opacity-90 text-white flex items-center justify-center shadow-lg transition-opacity"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;