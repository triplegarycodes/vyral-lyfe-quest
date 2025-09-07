import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  StarIcon,
  XMarkIcon,
  PhotoIcon,
  MusicalNoteIcon,
  PencilSquareIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const BVyral = () => {
  const { user } = useAuth();
  const { emitPostLiked, emitPostCommented } = useSocket();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [hoveredPost, setHoveredPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'art',
    tags: [],
    visibility: 'public'
  });

  const categories = [
    { value: 'all', label: 'All Posts', icon: '🎨', color: 'cyber-cyan' },
    { value: 'art', label: 'Art', icon: '🎨', color: 'cyber-purple' },
    { value: 'music', label: 'Music', icon: '🎵', color: 'electric-blue' },
    { value: 'writing', label: 'Writing', icon: '✍️', color: 'glitch-green' },
    { value: 'coding', label: 'Coding', icon: '💻', color: 'neon-pink' },
    { value: 'other', label: 'Other', icon: '✨', color: 'cyber-cyan' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { category: filter } : {};
      const response = await axios.get('/posts/feed', { params });
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId, currentlyLiked) => {
    try {
      await axios.post(`/posts/${postId}/like`);
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              user_liked: !currentlyLiked,
              likes_count: currentlyLiked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ));

      if (!currentlyLiked) {
        const post = posts.find(p => p.id === postId);
        emitPostLiked({ postId, authorId: post.user_id });
        toast.success('❤️ Liked!', { duration: 1000 });
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!newPost.content.trim()) {
      toast.error('Content is required');
      return;
    }

    try {
      const response = await axios.post('/posts', {
        ...newPost,
        tags: newPost.tags.filter(tag => tag.trim())
      });
      
      setPosts([response.data.post, ...posts]);
      setShowCreateModal(false);
      setNewPost({
        title: '',
        content: '',
        category: 'art',
        tags: [],
        visibility: 'public'
      });
      
      toast.success('🎉 Post created! Going viral!');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.icon || '✨';
  };

  const getCategoryColor = (category) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.color || 'cyber-cyan';
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading creative feed" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cyber p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-4">
            <span className="text-gradient">B-Vyral</span> 🎨
          </h1>
          <p className="text-gray-300 font-cyber mb-6">
            Creative hub where teens share art, music, and projects
          </p>
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, tags, creators..."
                className="cyber-input pl-10 w-full"
              />
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="cyber-button flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Post
            </button>
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap gap-2 mb-8 justify-center"
        >
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setFilter(category.value)}
              className={`px-4 py-2 rounded-xl font-cyber transition-all duration-300 flex items-center space-x-2 ${
                filter === category.value
                  ? `bg-${category.color} text-dark-bg shadow-lg`
                  : 'bg-dark-surface text-white hover:bg-opacity-80'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Posts Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              <div className={`cyber-card hover-glow cursor-pointer transition-all duration-300 ${
                hoveredPost === post.id ? 'scale-105' : ''
              }`}>
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-full flex items-center justify-center">
                      <span className="text-white font-gaming text-sm">
                        {post.display_name?.[0] || post.username[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-cyber font-medium">
                        {post.display_name || post.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        Level {post.level} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-lg text-xs font-gaming ${
                    `bg-${getCategoryColor(post.category)} bg-opacity-20 text-${getCategoryColor(post.category)}`
                  }`}>
                    {getCategoryIcon(post.category)} {post.category}
                  </div>
                </div>

                {/* Post Content */}
                {post.title && (
                  <h3 className="text-lg font-gaming font-bold text-white mb-2">
                    {post.title}
                  </h3>
                )}
                
                <div className="mb-4">
                  <p className="text-gray-300 line-clamp-3">
                    {post.content}
                  </p>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-dark-surface text-cyber-cyan px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Post Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(post.id, post.user_liked)}
                      className={`flex items-center space-x-1 transition-all duration-300 ${
                        post.user_liked 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      {post.user_liked ? (
                        <HeartIconSolid className="w-5 h-5" />
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )}
                      <span className="text-sm font-cyber">{post.likes_count}</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="flex items-center space-x-1 text-gray-400 hover:text-cyber-cyan transition-colors"
                    >
                      <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                      <span className="text-sm font-cyber">{post.comments_count}</span>
                    </button>
                    
                    <div className="flex items-center space-x-1 text-gray-400">
                      <EyeIcon className="w-5 h-5" />
                      <span className="text-sm font-cyber">{Math.floor(Math.random() * 100) + 10}</span>
                    </div>
                  </div>
                  
                  {post.is_featured && (
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <StarIcon className="w-4 h-4" />
                      <span className="text-xs font-cyber">Featured</span>
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                <AnimatePresence>
                  {hoveredPost === post.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-2xl flex items-end justify-center p-4"
                    >
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLike(post.id, post.user_liked)}
                          className="p-3 bg-red-500 bg-opacity-80 rounded-full text-white hover:bg-opacity-100 transition-all duration-300 hover:scale-110"
                        >
                          <HeartIcon className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="p-3 bg-cyber-cyan bg-opacity-80 rounded-full text-white hover:bg-opacity-100 transition-all duration-300 hover:scale-110"
                        >
                          <ChatBubbleOvalLeftIcon className="w-6 h-6" />
                        </button>
                        <button className="p-3 bg-cyber-purple bg-opacity-80 rounded-full text-white hover:bg-opacity-100 transition-all duration-300 hover:scale-110">
                          <ShareIcon className="w-6 h-6" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-gaming text-white mb-2">No posts found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery ? 'Try a different search term' : 'Be the first to share your creativity!'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="cyber-button"
            >
              Create Your First Post
            </button>
          </motion.div>
        )}

        {/* Create Post Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-glass-card rounded-2xl p-6 w-full max-w-2xl border border-white border-opacity-10"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-gaming font-bold text-white">
                    Share Your Creation 🎨
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreatePost} className="space-y-6">
                  <div>
                    <label className="block text-sm font-cyber text-white mb-2">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      className="cyber-input w-full"
                      placeholder="Give your creation a catchy title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-cyber text-white mb-2">
                      Content *
                    </label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      className="cyber-input w-full h-32 resize-none"
                      placeholder="Share your creative process, inspiration, or story..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-cyber text-white mb-2">
                        Category
                      </label>
                      <select
                        value={newPost.category}
                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        className="cyber-input w-full"
                      >
                        {categories.slice(1).map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-cyber text-white mb-2">
                        Visibility
                      </label>
                      <select
                        value={newPost.visibility}
                        onChange={(e) => setNewPost({ ...newPost, visibility: e.target.value })}
                        className="cyber-input w-full"
                      >
                        <option value="public">🌍 Public</option>
                        <option value="friends">👥 Friends</option>
                        <option value="private">🔒 Private</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-cyber text-white mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      onChange={(e) => setNewPost({ 
                        ...newPost, 
                        tags: e.target.value.split(',').map(tag => tag.trim()) 
                      })}
                      className="cyber-input w-full"
                      placeholder="art, digital, portrait, cyberpunk..."
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-600 text-white rounded-xl hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 cyber-button"
                    >
                      🚀 Go Viral!
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BVyral;