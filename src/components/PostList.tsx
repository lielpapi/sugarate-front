// PostList.tsx
import React from 'react';
import { Post as PostType } from '../services/postService';
import Post from './Post';

interface PostListProps {
  posts: PostType[];
  currentUserId?: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onUpdate?: (postId: string, content: string, healthMetrics?: PostType['healthMetrics']) => void;
  onDelete?: (postId: string) => void;
  showEditControls?: boolean;
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
}

const PostList: React.FC<PostListProps> = ({
  posts,
  currentUserId,
  onLike,
  onComment,
  onUpdate,
  onDelete,
  showEditControls = false,
  isLoading = false,
  error = '',
  emptyMessage = 'No posts to display.'
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#8B7355] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-lg mx-auto bg-white p-4 text-center text-gray-500 text-sm border rounded-lg">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
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
          onLike={() => onLike(post._id)}
          onComment={(content: string) => onComment(post._id, content)}
          onUpdate={showEditControls ? onUpdate : undefined}
          onDelete={showEditControls ? onDelete : undefined}
          isLiked={post.likes.includes(currentUserId || '')}
          profileImage={post.userId.profileImage}
          canEdit={showEditControls}
        />
      ))}
    </div>
  );
};

export default PostList;