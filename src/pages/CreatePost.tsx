import { useState } from 'react';
import { PhotoIcon, XMarkIcon, MapPinIcon, BeakerIcon, CakeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import { compressImage } from '../utils/utils';

interface HealthMetrics {
  location?: string;
  insulinUnits?: number;
  mealCarbs?: number;
}

const CreatePost = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<HealthMetrics>({});

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should not exceed 10MB');
        return;
      }

      if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        setError('Only JPEG, PNG and GIF images are allowed');
        return;
      }

      try {
        setLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64 = reader.result as string;
            const compressedImage = await compressImage(base64);
            setImagePreview(compressedImage);
            setError('');
          } catch (err) {
            setError('Error compressing image');
          } finally {
            setLoading(false);
          }
        };
        reader.onerror = () => {
          setError('Error reading file');
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError('Error processing image');
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await postService.createPost(content, imagePreview || undefined, metrics);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
      setLoading(false);
    }
  };

  const handleMetricsChange = (field: keyof HealthMetrics, value: string) => {
    setMetrics(prev => ({
      ...prev,
      [field]: value === '' ? undefined : field === 'location' ? value : Number(value)
    }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#F5F5DC] to-[#E8DCC4] py-12">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,#8B7355_1px,transparent_0)] bg-[length:40px_40px]" />
      <div className="max-w-2xl mx-auto px-4 relative">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-[#8B7355]/10">
          <h2 className="text-2xl font-semibold mb-6 text-[#8B7355]">Create Post</h2>

          {error && (
            <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-3 rounded-xl flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError('')}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#8B7355] font-medium mb-2">Your Post</label>
              <textarea
                className="w-full p-4 bg-[#8B7355]/5 border border-[#8B7355]/20 rounded-xl resize-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent disabled:bg-gray-100 placeholder-[#8B7355]/50"
                rows={4}
                placeholder="Share your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#8B7355] font-medium mb-2">Location</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                  <input
                    type="text"
                    placeholder="Add location"
                    value={metrics.location || ''}
                    onChange={(e) => handleMetricsChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#8B7355]/5 border border-[#8B7355]/20 rounded-xl focus:ring-2 focus:ring-[#8B7355] focus:border-transparent placeholder-[#8B7355]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8B7355] font-medium mb-2">Insulin Units</label>
                <div className="relative">
                  <BeakerIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                  <input
                    type="number"
                    placeholder="Units"
                    value={metrics.insulinUnits || ''}
                    onChange={(e) => handleMetricsChange('insulinUnits', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#8B7355]/5 border border-[#8B7355]/20 rounded-xl focus:ring-2 focus:ring-[#8B7355] focus:border-transparent placeholder-[#8B7355]/50"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8B7355] font-medium mb-2">Carbohydrates</label>
                <div className="relative">
                  <CakeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                  <input
                    type="number"
                    placeholder="Grams"
                    value={metrics.mealCarbs || ''}
                    onChange={(e) => handleMetricsChange('mealCarbs', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#8B7355]/5 border border-[#8B7355]/20 rounded-xl focus:ring-2 focus:ring-[#8B7355] focus:border-transparent placeholder-[#8B7355]/50"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {imagePreview ? (
              <div className="relative bg-[#8B7355]/5 p-2 rounded-xl border border-[#8B7355]/20">
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute right-4 top-4 bg-black/50 hover:bg-black/70 p-1.5 rounded-full text-white z-10 disabled:opacity-50 transition-all duration-200"
                  disabled={loading}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full rounded-lg max-h-[300px] object-cover"
                />
              </div>
            ) : (
              <label className="block">
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B7355]/5 text-[#8B7355] hover:bg-[#8B7355]/10 cursor-pointer disabled:opacity-50 transition-all duration-200 border border-[#8B7355]/20">
                  <PhotoIcon className="h-5 w-5" />
                  <span>Add Image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                </div>
              </label>
            )}

            <div className="flex gap-4 justify-end border-t border-[#8B7355]/10 pt-6">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="px-4 py-2 text-[#8B7355] hover:bg-[#8B7355]/5 rounded-xl transition-all duration-200 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="px-6 py-2 bg-gradient-to-r from-[#8B7355] to-[#A68A64] hover:shadow-lg text-white rounded-xl disabled:opacity-50 min-w-[100px] flex items-center justify-center transition-all duration-200"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;