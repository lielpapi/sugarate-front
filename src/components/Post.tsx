import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon as HeartOutline, ChatBubbleOvalLeftIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon, MapPinIcon, BeakerIcon, CakeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const UserHeader = ({ username, timestamp, profileImage, userId, canEdit, onEdit, onDelete, location, navigationEnabled = true }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = user.id;
  console.log(profileImage);
  console.log(currentUserId);
  const handleProfileClick = () => {
    if (navigationEnabled && userId !== currentUserId) {
      navigate(`/user-posts/${userId}`);
    }
  };
  
  return (
    <div className="flex items-center mb-2">
      <div 
        className={`w-12 h-12 rounded-full bg-[#8B7355] text-white flex items-center justify-center mr-2 
          ${(navigationEnabled && userId !== currentUserId) ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} text-base`}
        onClick={handleProfileClick}
      >
        {profileImage ? <img src={profileImage} alt={username} className="w-full h-full object-cover rounded-full" /> : username[0]}
      </div>
      <div className="flex-grow">
        <h3 className={`font-semibold text-base ${(navigationEnabled && userId !== currentUserId) ? 'cursor-pointer hover:text-[#8B7355] hover:underline' : ''}`}
            onClick={(navigationEnabled && userId !== currentUserId) ? handleProfileClick : undefined}>
          {username}
        </h3>
        <span className="text-sm text-gray-500">{timestamp}</span>
      </div>
      {location && (
        <div className="flex items-center gap-1.5 text-sm mr-2">
          <MapPinIcon className="w-4 h-4 text-[#8B7355]" />
          <span className="text-gray-600">{location}</span>
        </div>
      )}
      {canEdit && (
        <div className="flex gap-1">
          <button onClick={onEdit}><PencilIcon className="w-4 h-4 text-gray-600" /></button>
          <button onClick={onDelete}><TrashIcon className="w-4 h-4 text-red-600" /></button>
        </div>
      )}
    </div>
  );
};

const HealthMetrics = ({ metrics }) => {
  if (!metrics || Object.keys(metrics).filter(key => metrics[key] !== undefined && key !== 'location').length === 0) return null;

  return (
    <div className="mb-3 bg-[#8B7355]/5 rounded-lg p-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {metrics.insulinUnits !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <BeakerIcon className="w-4 h-4 text-[#8B7355] flex-shrink-0" />
            <span className="text-gray-700 font-medium whitespace-nowrap">{metrics.insulinUnits} units insulin</span>
          </div>
        )}
        {metrics.mealCarbs !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <CakeIcon className="w-4 h-4 text-[#8B7355] flex-shrink-0" />
            <span className="text-gray-700 font-medium whitespace-nowrap">{metrics.mealCarbs}g carbs</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Post: React.FC<PostProps> = ({ 
  id, userId, username, timestamp, content, likes, comments, image, profileImage, 
  healthMetrics, onLike, onComment, onUpdate, onDelete, isLiked, canEdit = false,
  navigationEnabled = true
}) => {
  const [state, setState] = useState({
    isLiked,
    likesCount: likes,
    showCommentInput: false,
    showComments: false,
    commentText: '',
    isEditing: false,
    editedContent: content,
    editedMetrics: healthMetrics || {}
  });

  const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }));

  const handleLikeClick = () => {
    updateState({ isLiked: !state.isLiked, likesCount: state.likesCount + (state.isLiked ? -1 : 1) });
    onLike();
  };

  const handleSaveEdit = () => {
    if (state.editedContent.trim() && onUpdate && id) {
      onUpdate(id, state.editedContent, state.editedMetrics);
      updateState({ isEditing: false });
    }
  };

  return (
    <div className="bg-white rounded-xl p-3 mb-3 shadow-sm max-w-lg mx-auto w-full">
      <UserHeader 
        username={username}
        timestamp={timestamp}
        profileImage={profileImage}
        userId={userId}
        canEdit={canEdit}
        onEdit={() => updateState({ isEditing: true })}
        onDelete={() => onDelete?.(id!)}
        location={healthMetrics?.location}
        navigationEnabled={navigationEnabled}
      />

      {state.isEditing ? (
        <div className="mb-2 space-y-2">
          <textarea
            value={state.editedContent}
            onChange={e => updateState({ editedContent: e.target.value })}
            className="w-full p-2 bg-[#8B7355]/5 border border-[#8B7355]/20 rounded-lg focus:ring-1 focus:ring-[#8B7355] focus:border-transparent text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Location"
              value={state.editedMetrics?.location || ''}
              onChange={e => updateState({ 
                editedMetrics: { ...state.editedMetrics, location: e.target.value }
              })}
              className="flex-1 min-w-[200px] p-1.5 bg-[#8B7355]/5 border border-[#8B7355]/20 rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="Insulin Units"
              value={state.editedMetrics?.insulinUnits || ''}
              onChange={e => updateState({ 
                editedMetrics: { ...state.editedMetrics, insulinUnits: Number(e.target.value) }
              })}
              className="flex-1 min-w-[150px] p-1.5 bg-[#8B7355]/5 border border-[#8B7355]/20 rounded-lg text-sm"
              min="0"
              step="0.5"
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              value={state.editedMetrics?.mealCarbs || ''}
              onChange={e => updateState({ 
                editedMetrics: { ...state.editedMetrics, mealCarbs: Number(e.target.value) }
              })}
              className="flex-1 min-w-[150px] p-1.5 bg-[#8B7355]/5 border border-[#8B7355]/20 rounded-lg text-sm"
              min="0"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveEdit} className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-sm">
              <CheckIcon className="w-3 h-3" /> Save
            </button>
            <button 
              onClick={() => updateState({ 
                isEditing: false, 
                editedContent: content,
                editedMetrics: healthMetrics || {}
              })}
              className="flex items-center gap-1 bg-gray-300 text-black px-2 py-1 rounded text-sm"
            >
              <XMarkIcon className="w-3 h-3" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-2 text-sm whitespace-pre-wrap">{content}</p>
          <HealthMetrics metrics={healthMetrics} />
          {image && (
            <div className="mb-2 flex justify-center">
              <img 
                src={image} 
                alt="Post content" 
                className="max-w-full h-auto max-h-96 object-contain rounded-lg" 
              />
            </div>
          )}
        </>
      )}

      <div className="flex items-center gap-4">
        <button onClick={handleLikeClick} className="flex items-center gap-1">
          {state.isLiked ? <HeartSolid className="w-5 h-5 text-red-500" /> : <HeartOutline className="w-5 h-5" />}
          <span className="text-xs">{state.likesCount}</span>
        </button>

        <button onClick={() => updateState({ showCommentInput: !state.showCommentInput })} className="flex items-center gap-1">
          <ChatBubbleOvalLeftIcon className="w-5 h-5" />
          <span className="text-xs">{comments.length}</span>
        </button>
      </div>

      {state.showCommentInput && (
        <div className="mt-2 border-t pt-2">
          <input
            value={state.commentText}
            onChange={e => updateState({ commentText: e.target.value })}
            placeholder="Write a comment..."
            className="border p-1.5 w-full rounded-lg text-sm"
          />
          <button
            onClick={() => {
              if (state.commentText.trim()) {
                onComment(state.commentText);
                updateState({ commentText: '', showCommentInput: false });
              }
            }}
            className="mt-1 bg-[#8B7355] text-white px-3 py-1 rounded-lg text-sm"
          >
            Submit
          </button>
        </div>
      )}

      {comments.length > 0 && (
        <div className="mt-2 border-t pt-2">
          <button
            onClick={() => updateState({ showComments: !state.showComments })}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
          >
            {state.showComments ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            <span className="text-xs font-medium">
              {state.showComments ? 'Hide Comments' : `Show Comments (${comments.length})`}
            </span>
          </button>
          
          {state.showComments && (
            <div className="mt-2 space-y-1">
              {comments.map(comment => (
                <div key={comment._id} className="bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="font-medium text-xs">{comment.userId.username}</span>
                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;