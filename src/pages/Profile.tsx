import React, { useState, useEffect } from 'react';
import { MdEdit, MdEmail, MdPerson, MdImageNotSupported } from 'react-icons/md';
import { userService } from '../services/userService';
import postService, { Post as PostType } from '../services/postService';
import Post from '../components/Post';

interface UserData {
  username: string;
  email: string;
  profileImage: string;
  id: string;
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    username: '',
    email: '',
    profileImage: '',
    id: ''
  });

  const [{ error, isUpdating, imageError }, setStatus] = useState({
    error: '',
    isUpdating: false,
    imageError: false
  });

  const [posts, setPosts] = useState<PostType[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState('');

  useEffect(() => {
    const user = userService.getUserFromStorage();
    setUserData(user);
  }, []);

  useEffect(() => {
    if (userData.id) {
      fetchUserPosts();
    }
  }, [userData.id]);

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const userPosts = await postService.getUserPosts(userData.id);
      setPosts(userPosts);
      console.log(userPosts);
    } catch (error: any) {
      setPostsError(error.message || 'Failed to fetch posts.');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await postService.likePost(postId);
      fetchUserPosts();
    } catch (err: any) {
      setPostsError(err.message || 'Failed to like post');
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      await postService.addComment(postId, content);
      fetchUserPosts();
    } catch (err: any) {
      setPostsError(err.message || 'Failed to add comment');
    }
  };

  const handleUpdate = async (postId: string, newContent: string, healthMetrics?: PostType['healthMetrics']) => {
    try {
      await postService.updatePost(postId, newContent, healthMetrics);
      fetchUserPosts();
    } catch (err: any) {
      setPostsError(err.message || 'Failed to update post');
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await postService.deletePost(postId);
      fetchUserPosts();
    } catch (err: any) {
      setPostsError(err.message || 'Failed to delete post');
    }
  };

  const updateProfileImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setStatus(s => ({ ...s, error: 'Image size must be less than 5MB' }));
      return;
    }

    setStatus(s => ({ ...s, error: '', isUpdating: true }));
    
    try {
      const base64String = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const data = await userService.updateProfileImage(userData.id, base64String);
      const updatedUserData = { ...userData, profileImage: data.profileImage };
      
      setUserData(updatedUserData);
      userService.updateUserStorage(updatedUserData);
      setStatus(s => ({ ...s, imageError: false }));
    } catch (err) {
      setStatus(s => ({ 
        ...s, 
        error: err instanceof Error ? err.message : 'Failed to update profile image' 
      }));
    } finally {
      setStatus(s => ({ ...s, isUpdating: false }));
    }
  };

  if (!userData.username && !userData.email) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-[#F5F5DC] to-[#E8DCC4]">
        <div className="bg-white/90 p-6 rounded-xl shadow-lg text-center">
          <MdPerson className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No user data found. Please log in again.</p>
        </div>
      </div>
    );
  }

  const ProfileCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.ComponentType }) => (
    <div className="bg-white/80 p-4 rounded-xl shadow-sm border border-white/20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#8B7355]/10 rounded-lg">
          <Icon className="w-5 h-5 text-[#8B7355]" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="font-medium text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-[#F5F5DC] to-[#E8DCC4] p-6">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] bg-[length:40px_40px]" />
      
      <div className="w-full max-w-xl relative">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <div className="flex-shrink-0 w-1 h-full bg-red-500 rounded-full" />
              {error}
            </div>
          )}
          
          <div className="relative w-32 h-32 mx-auto mb-8">
            {imageError ? (
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                <MdImageNotSupported className="w-12 h-12 text-gray-400" />
              </div>
            ) : (
              <img
                src={userData.profileImage || '/api/placeholder/150/150'}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-[#8B7355]/20"
                onError={() => setStatus(s => ({ ...s, imageError: true }))}
              />
            )}
            <label
              htmlFor="image-upload"
              className={`absolute bottom-2 right-2 p-2.5 bg-white rounded-full shadow-lg cursor-pointer 
                hover:bg-gray-50 transition-all duration-200 border border-gray-100 group
                ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <MdEdit className="w-5 h-5 text-[#8B7355] group-hover:scale-110 transition-transform" />
              <input
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                onChange={e => e.target.files?.[0] && updateProfileImage(e.target.files[0])}
                disabled={isUpdating}
              />
            </label>
            {isUpdating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#8B7355] mb-1">{userData.username}</h2>
            <p className="text-gray-500 text-sm">Member since 2024</p>
          </div>

          <div className="space-y-4">
            <ProfileCard title="Username" value={userData.username} icon={MdPerson} />
            <ProfileCard title="Email" value={userData.email} icon={MdEmail} />
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#8B7355] mb-4 text-center">My Posts</h2>
          {postsLoading ? (
            <div className="text-center p-4 bg-white/90 rounded-xl">
              <div className="animate-spin w-8 h-8 border-4 border-[#8B7355] border-t-transparent rounded-full mx-auto" />
            </div>
          ) : postsError ? (
            <div className="text-center text-red-500 p-4 bg-white/90 rounded-xl">{postsError}</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-500 p-4 bg-white/90 rounded-xl">No posts to display.</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Post
                  key={post._id}
                  id={post._id}
                  userId={post.userId._id}
                  username={post.userId.username}
                  timestamp={new Date(post.createdAt).toLocaleString()}
                  content={post.content}
                  image={post.image}
                  healthMetrics={post.healthMetrics}
                  likes={post.likes.length}
                  comments={post.comments}
                  onLike={() => handleLike(post._id)}
                  onComment={(content: string) => handleComment(post._id, content)}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  isLiked={post.likes.includes(userData.id)}
                  profileImage={post.userId.profileImage}
                  canEdit={true}
                  navigationEnabled={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;