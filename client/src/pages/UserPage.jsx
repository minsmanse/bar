import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api';
import { ShoppingBag, Minus, Plus, Beer, X, Clock, Trash2, ChevronDown, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CompositionChart from '../components/CompositionChart';

// --- Animations ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

// --- Components ---

function MenuDetailModal({ item, onClose, onAddToCart, cartQuantity, onRemoveFromCart }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
      >
        <div className="relative h-72 bg-gray-100 shrink-0">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Beer size={64} />
            </div>
          )}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
            aria-label="모달 닫기"
          >
            <X size={20} />
          </motion.button>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="px-6 pb-6 -mt-12 relative overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col items-center">
             <h2 className="text-3xl font-black text-gray-900 mb-1 text-center">{item.name}</h2>
             <p className="text-gray-500 leading-relaxed text-sm text-center mb-4">{item.description}</p>
             <div className="w-full max-w-[180px]">
                <CompositionChart items={item.items} totalVolume={item.totalVolume} height={180} />
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto flex items-center justify-between gap-4">
          <div className="flex flex-col items-start pl-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ABV</span>
            <span className="text-3xl font-black text-indigo-600">{item.finalAbv}<span className="text-lg text-indigo-400">%</span></span>
          </div>

          <div className="flex-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onAddToCart(item);
                onClose();
              }}
              className="w-full h-14 bg-black text-white font-bold text-lg rounded-2xl shadow-lg shadow-gray-200 hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              주문 담기 <Plus size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CartSheet({ cart, isOpen, onClose, onPlaceOrder, isOrdering, onUpdateQuantity }) {
  const [userName, setUserName] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const cartItems = Object.values(cart);
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const savedName = localStorage.getItem('party_user_name');
    if (savedName) setUserName(savedName);
  }, []);

  const handleOrder = () => {
    if (!userName.trim()) {
      alert('주문자 이름을 입력해주세요!');
      return;
    }
    localStorage.setItem('party_user_name', userName);
    onPlaceOrder(userName, requestMessage);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 max-h-[90vh] flex flex-col max-w-md mx-auto shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
          >
            {/* Handle Bar */}
            <div className="pt-4 pb-2 flex justify-center cursor-pointer" onClick={onClose}>
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="px-6 pb-4 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-2xl font-black text-gray-900">장바구니 <span className="text-indigo-600 text-lg ml-1">{totalQuantity}</span></h2>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600">
                <ChevronDown size={20} />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {cartItems.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-gray-400">장바구니가 비어있습니다.</motion.div>
                ) : (
                  cartItems.map(item => (
                    <motion.div 
                      key={item.id} 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="flex items-center gap-4 bg-white p-2 rounded-2xl"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">{item.finalAbv}% ABV</p>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-1 rounded-xl">
                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => onUpdateQuantity(item.id, -1)} className="p-1.5 text-gray-600 bg-white rounded-lg shadow-sm"><Minus size={14} /></motion.button>
                        <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => onUpdateQuantity(item.id, 1)} className="p-1.5 text-gray-600 bg-white rounded-lg shadow-sm"><Plus size={14} /></motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto pb-8">
              <div className="mb-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">주문자 이름</label>
                  <input 
                    type="text" 
                    placeholder="이름 (예: 민수)" 
                    className="w-full p-3.5 rounded-xl border-none bg-white shadow-sm font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:font-normal"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">요청사항 (선택)</label>
                  <textarea 
                    placeholder="얼음 적게, 레몬 슬라이스 추가 등" 
                    className="w-full p-3.5 rounded-xl border-none bg-white shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-20 resize-none placeholder:text-gray-400"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOrder}
                disabled={isOrdering || totalQuantity === 0}
                className="w-full bg-black text-white font-bold text-xl py-4 rounded-2xl shadow-lg shadow-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isOrdering ? '주문 전송 중...' : `${totalQuantity}잔 주문하기`}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function OrderHistoryModal({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoading(true);
    const savedIds = JSON.parse(localStorage.getItem('party_order_ids') || '[]');
    if (savedIds.length > 0) {
      try {
        const res = await api.post('/api/orders/batch', { orderIds: savedIds });
        setHistory(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} 
      />
      <motion.div 
        variants={modalVariants}
        initial="hidden" animate="visible" exit="exit"
        className="relative bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[80vh] flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Clock size={20} className="text-indigo-600" /> 내 주문
          </h2>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 hover:bg-gray-100 shadow-sm"><X size={20} /></motion.button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {loading ? (
            <div className="text-center py-10 text-gray-400">불러오는 중...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>아직 주문 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map(order => (
                <motion.div 
                  key={order.id} 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === 'completed' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                  <div className="flex justify-between items-start mb-3 pl-3">
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.status === 'pending' ? '제조 중' : '완료됨'}
                    </span>
                  </div>
                  <div className="pl-3 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-base items-center">
                        <span className="font-bold text-gray-800">{item.name}</span>
                        <span className="text-gray-500 font-mono text-sm bg-gray-50 px-2 py-0.5 rounded">x{item.quantity}</span>
                      </div>
                    ))}
                    {order.requestMessage && (
                      <p className="text-xs text-gray-600 bg-gray-100 p-2.5 rounded-xl mt-3 border border-gray-200">
                        <span className="font-bold text-gray-800 block mb-1">요청사항:</span> {order.requestMessage}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// --- Main Page ---

export default function UserPage() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({}); 
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // UI States
  const [cartOpen, setCartOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showAdminWarning, setShowAdminWarning] = useState(false); // 경고 오버레이 상태

  useEffect(() => {
    fetchMenu();
  }, []);

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
          onClick={() => setShowAdminWarning(true)} // 페이지 이동 대신 상태 변경
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

      {/* 관리자 아님 경고 오버레이 */}
      <AnimatePresence>
        {showAdminWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} // 뾰잉 대신 부드러운 페이드
            className="fixed inset-0 bg-black/80 z-[9999] flex flex-col items-center justify-center p-4 cursor-pointer"
            onClick={() => setShowAdminWarning(false)}
          >
            <motion.img 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              src="https://dcimg1.dcinside.com/viewimage.php?id=2cb9dd2ff6c131a960&no=24b0d769e1d32ca73fea85fa11d028315c2a09e47d692719f95ebfe695d2a17112e7c2c528c8ebe8ad26729d9309e79deb4284f3f6ed1e7f451e7427ae3281954a902f5ea89fd1aa909e5596407ec96221ba577da5d23d&orgExt" 
              alt="Access Denied" 
              className="max-w-full h-auto max-h-[70vh] rounded-lg shadow-xl mb-6 border-4 border-red-500"
            />
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-5xl font-extrabold text-red-500 text-center drop-shadow-lg"
            >
              너 관리자 아니잖아!
            </motion.p>
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