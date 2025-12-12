import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api';
import { ShoppingBag, Minus, Plus, Beer, X, Clock, Trash2, ChevronDown, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CompositionChart from '../components/CompositionChart';

// ... (Animations and Components remain the same)

// --- Main Page ---

export default function UserPage() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({}); 
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // UI States
  const [cartOpen, setCartOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenu();
  }, []);

  // ... (fetchMenu, addToCart, removeFromCart, updateCartQuantity, totalQuantity, placeOrder functions remain the same)

  const fetchMenu = async () => {
    const res = await api.get('/api/menu');
    setMenu(res.data);
  };

  const addToCart = (item) => {
    setCart(prev => {
      const current = prev[item.id] || { ...item, quantity: 0 };
      return { ...prev, [item.id]: { ...current, quantity: current.quantity + 1 } };
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const current = prev[itemId];
      if (!current) return prev;
      if (current.quantity <= 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: { ...current, quantity: current.quantity - 1 } };
    });
  };

  const updateCartQuantity = (itemId, delta) => {
    if (delta > 0) {
      const item = cart[itemId] || menu.find(m => m.id === itemId);
      addToCart(item);
    } else {
      removeFromCart(itemId);
    }
  };

  const totalQuantity = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);

  const placeOrder = async (userName, requestMessage) => {
    if (totalQuantity === 0) return;
    setIsOrdering(true);
    const items = Object.values(cart).map(item => ({
      menuId: item.id,
      name: item.name,
      quantity: item.quantity
    }));

    try {
      const res = await api.post('/api/orders', { items, userName, requestMessage });
      const savedIds = JSON.parse(localStorage.getItem('party_order_ids') || '[]');
      savedIds.push(res.data.id);
      localStorage.setItem('party_order_ids', JSON.stringify(savedIds));

      setCart({});
      setCartOpen(false);
      alert(`${userName}님, 주문이 접수되었습니다!`);
    } catch (e) {
      alert('주문 중 오류가 발생했습니다.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="pb-32 max-w-md mx-auto bg-gray-50 min-h-screen shadow-2xl relative overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md p-6 shadow-sm sticky top-0 z-10 flex justify-between items-center transition-all">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
            <Beer className="text-yellow-500 fill-yellow-500" />
            파티 바
          </h1>
          <p className="text-sm text-gray-500 font-medium">오늘은 내가 바텐더!</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setHistoryOpen(true)}
          className="p-3 bg-white border border-gray-100 shadow-sm rounded-2xl text-gray-600 hover:text-indigo-600 hover:border-indigo-100 transition-colors"
          aria-label="주문 내역 확인"
        >
          <Clock size={20} />
        </motion.button>
      </header>

      {/* Menu List */}
      <motion.div 
        className="p-4 space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {menu.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>아직 메뉴가 없습니다.</p>
            <p className="text-sm">바텐더에게 메뉴를 만들어 달라고 요청해주세요!</p>
          </div>
        ) : (
          menu.map(item => {
            const quantity = cart[item.id]?.quantity || 0;
            return (
              <motion.div 
                key={item.id} 
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedItem(item)}
                className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex gap-4 items-center cursor-pointer hover:shadow-md hover:border-indigo-50 transition-all duration-300"
              >
                {/* Image */}
                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Beer size={24} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 py-1">
                  <h3 className="font-bold text-lg text-gray-900 truncate tracking-tight">{item.name}</h3>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-1">{item.description}</p>
                  <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-extrabold px-2.5 py-1 rounded-lg">
                    {item.finalAbv}% ABV
                  </span>
                </div>
                
                <div className="flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {quantity > 0 ? (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="flex flex-col items-center bg-gray-100 rounded-full p-1"
                    >
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => addToCart(item)} className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
                        <Plus size={16} />
                      </motion.button>
                      <span className="font-bold text-lg py-1 w-6 text-center">{quantity}</span>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => removeFromCart(item.id)} className="p-2 bg-white rounded-full shadow-sm text-gray-600">
                        <Minus size={16} />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.button 
                      whileTap={{ scale: 0.8 }}
                      onClick={() => addToCart(item)}
                      className="bg-black text-white p-3 rounded-2xl shadow-lg shadow-gray-300 hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={20} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* 관리자 페이지로 이동 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="p-4 flex justify-center mt-6"
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/fuckyou')} // 정적 페이지로 이동
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold shadow-md hover:bg-gray-300 transition-colors"
        >
          <Key size={18} /> 관리자 페이지로 이동
        </motion.button>
      </motion.div>

      {/* Floating Order Bar */}
      <AnimatePresence>
        {totalQuantity > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-30"
          >
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setCartOpen(true)}
              className="w-full bg-black/90 backdrop-blur-md text-white font-bold text-lg py-4 rounded-2xl shadow-2xl flex justify-between items-center px-6 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="bg-indigo-500 text-white px-2.5 py-0.5 rounded-lg text-sm font-extrabold">{totalQuantity}</span>
                <span className="text-gray-200 text-sm font-medium">지금 주문하기</span>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-indigo-300">장바구니 <ChevronDown size={16} className="rotate-180"/></span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals & Sheets */}
      <AnimatePresence>
        {selectedItem && (
          <MenuDetailModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            cartQuantity={cart[selectedItem?.id]?.quantity || 0}
          />
        )}
      </AnimatePresence>

      <CartSheet 
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onPlaceOrder={placeOrder}
        isOrdering={isOrdering}
        onUpdateQuantity={updateCartQuantity}
      />

      <OrderHistoryModal 
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
}