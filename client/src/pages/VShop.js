import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCartIcon,
  StarIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const VShop = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const categories = [
    { value: 'all', label: 'All Items', icon: '🛒' },
    { value: 'avatar', label: 'Avatar', icon: '👤' },
    { value: 'theme', label: 'Themes', icon: '🎨' },
    { value: 'badge', label: 'Badges', icon: '🏆' },
    { value: 'power-up', label: 'Power-ups', icon: '⚡' }
  ];

  const rarityConfig = {
    common: {
      color: 'gray-400',
      bgColor: 'gray-500',
      glow: 'rgba(156, 163, 175, 0.3)',
      label: 'Common',
      animation: 'none'
    },
    rare: {
      color: 'blue-400',
      bgColor: 'blue-500',
      glow: 'rgba(59, 130, 246, 0.4)',
      label: 'Rare',
      animation: 'pulse'
    },
    epic: {
      color: 'purple-400',
      bgColor: 'purple-500',
      glow: 'rgba(139, 92, 246, 0.5)',
      label: 'Epic',
      animation: 'glow-pulse'
    },
    legendary: {
      color: 'yellow-400',
      bgColor: 'yellow-500',
      glow: 'rgba(251, 191, 36, 0.6)',
      label: 'Legendary',
      animation: 'float'
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const [itemsResponse, inventoryResponse] = await Promise.all([
        axios.get('/shop/items'),
        axios.get('/shop/inventory')
      ]);
      
      setItems(itemsResponse.data.items);
      setInventory(inventoryResponse.data.inventory);
    } catch (error) {
      toast.error('Failed to load shop');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item) => {
    if (user.coins < item.price) {
      toast.error('💸 Not enough coins!');
      return;
    }

    if (item.owned) {
      toast.error('You already own this item!');
      return;
    }

    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedItem) return;

    try {
      setPurchasing(true);
      await axios.post(`/shop/purchase/${selectedItem.id}`);
      
      // Update local state
      setItems(items.map(item => 
        item.id === selectedItem.id ? { ...item, owned: true } : item
      ));
      
      // Show success animation
      toast.success(`🎉 ${selectedItem.name} purchased!`, {
        duration: 4000,
        icon: '🛒'
      });
      
      setShowPurchaseModal(false);
      setSelectedItem(null);
      
      // Refresh user data to update coins
      window.location.reload(); // Simple refresh for demo
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const filteredItems = items.filter(item => 
    filter === 'all' || item.category === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading V-Shop" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cyber p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-4">
            <span className="text-gradient">V-Shop</span> 🛒
          </h1>
          <p className="text-gray-300 font-cyber mb-6">
            Virtual reward store with exclusive items and power-ups
          </p>
          
          {/* User Coins */}
          <div className="flex justify-center items-center space-x-2 mb-8">
            <span className="text-3xl">🪙</span>
            <span className="text-2xl font-gaming text-yellow-400">{user.coins}</span>
            <span className="text-gray-400 font-cyber">coins</span>
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
                  ? 'bg-cyber-cyan text-dark-bg shadow-lg'
                  : 'bg-dark-surface text-white hover:bg-opacity-80'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => {
            const rarity = rarityConfig[item.rarity] || rarityConfig.common;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative group ${rarity.animation === 'float' ? 'animate-float' : ''}`}
              >
                {/* Rarity Glow Background */}
                <div 
                  className="absolute inset-0 rounded-2xl blur-lg opacity-50"
                  style={{ 
                    background: `radial-gradient(circle, ${rarity.glow} 0%, transparent 70%)`,
                    animation: rarity.animation === 'glow-pulse' ? 'glow-pulse 2s ease-in-out infinite alternate' : 'none'
                  }}
                />
                
                <div className={`relative cyber-card hover-glow border-2 border-${rarity.color} border-opacity-50 ${
                  item.owned ? 'opacity-75' : ''
                }`}>
                  {/* Rarity Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-gaming font-bold ${
                    `bg-${rarity.bgColor} bg-opacity-20 text-${rarity.color}`
                  }`}>
                    {rarity.label}
                  </div>

                  {/* Owned Badge */}
                  {item.owned && (
                    <div className="absolute top-2 left-2 bg-green-500 bg-opacity-20 text-green-400 px-2 py-1 rounded-lg text-xs font-cyber flex items-center space-x-1">
                      <CheckCircleIcon className="w-3 h-3" />
                      <span>Owned</span>
                    </div>
                  )}

                  {/* Item Image Placeholder */}
                  <div className={`w-full h-32 rounded-xl mb-4 flex items-center justify-center text-4xl ${
                    `bg-${rarity.bgColor} bg-opacity-10`
                  }`}>
                    {item.category === 'avatar' ? '👤' :
                     item.category === 'theme' ? '🎨' :
                     item.category === 'badge' ? '🏆' :
                     item.category === 'power-up' ? '⚡' : '✨'}
                  </div>

                  {/* Item Info */}
                  <h3 className="text-lg font-gaming font-bold text-white mb-2 group-hover:text-cyber-cyan transition-colors">
                    {item.name}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Requirements */}
                  {item.requirements && Object.keys(item.requirements).length > 0 && (
                    <div className="mb-4">
                      {item.requirements.level && (
                        <div className={`text-xs flex items-center space-x-1 ${
                          user.level >= item.requirements.level ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <StarIcon className="w-3 h-3" />
                          <span>Level {item.requirements.level}+</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price and Purchase */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400">🪙</span>
                      <span className="text-xl font-gaming text-yellow-400">{item.price}</span>
                    </div>
                    
                    {item.owned ? (
                      <span className="text-green-400 font-cyber text-sm flex items-center space-x-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Owned</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={user.coins < item.price}
                        className={`px-4 py-2 rounded-lg font-cyber text-sm transition-all duration-300 flex items-center space-x-2 ${
                          user.coins >= item.price
                            ? 'bg-cyber-cyan text-dark-bg hover:bg-opacity-80 hover:scale-105'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCartIcon className="w-4 h-4" />
                        <span>Buy</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <ShoppingCartIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-gaming text-white mb-2">No items found</h3>
            <p className="text-gray-400">Check back later for new items!</p>
          </motion.div>
        )}

        {/* Purchase Confirmation Modal */}
        <AnimatePresence>
          {showPurchaseModal && selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.target === e.currentTarget && setShowPurchaseModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-glass-card rounded-2xl p-6 w-full max-w-md border border-white border-opacity-10"
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-2xl font-gaming font-bold text-white mb-2">
                    Confirm Purchase
                  </h3>
                  <p className="text-gray-300">
                    Are you sure you want to buy this item?
                  </p>
                </div>

                {/* Item Preview */}
                <div className="cyber-card mb-6 p-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">
                      {selectedItem.category === 'avatar' ? '👤' :
                       selectedItem.category === 'theme' ? '🎨' :
                       selectedItem.category === 'badge' ? '🏆' :
                       selectedItem.category === 'power-up' ? '⚡' : '✨'}
                    </div>
                    <div>
                      <h4 className="font-gaming text-white">{selectedItem.name}</h4>
                      <p className="text-sm text-gray-300">{selectedItem.description}</p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-dark-surface rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Item Price:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">🪙</span>
                      <span className="text-yellow-400 font-gaming">{selectedItem.price}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Your Balance:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">🪙</span>
                      <span className="text-yellow-400 font-gaming">{user.coins}</span>
                    </div>
                  </div>
                  <hr className="border-gray-600 my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">After Purchase:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">🪙</span>
                      <span className="text-yellow-400 font-gaming">{user.coins - selectedItem.price}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    disabled={purchasing}
                    className="flex-1 px-4 py-3 border border-gray-600 text-white rounded-xl hover:bg-white hover:bg-opacity-10 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPurchase}
                    disabled={purchasing}
                    className="flex-1 cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {purchasing ? (
                      <LoadingSpinner size="small" text="Purchasing" />
                    ) : (
                      <>
                        <ShoppingCartIcon className="w-5 h-5 mr-2" />
                        Purchase
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Purchase Success Animation */}
        <AnimatePresence>
          {purchasing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <motion.div
                className="bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-full p-8"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <SparklesIcon className="w-16 h-16 text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VShop;