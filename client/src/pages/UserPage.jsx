import React, { useState, useEffect } from 'react';
import api from '../api';
import { ShoppingBag, Minus, Plus, Beer, X, Clock, Trash2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CompositionChart from '../components/CompositionChart';

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
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
      >
        <div className="relative h-64 bg-gray-100 shrink-0">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Beer size={64} />
            </div>
          )}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition"
            aria-label="모달 닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-2">{item.name}</h2>
            <p className="text-gray-500 leading-relaxed text-sm">{item.description}</p>
          </div>

          <div className="flex justify-center mb-4">
              <div className="w-40">
                <CompositionChart items={item.items} totalVolume={item.totalVolume} height={200} />
              </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto flex items-center justify-between gap-4">
          <div className="flex flex-col items-start pl-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ABV</span>
            <span className="text-2xl font-black text-indigo-600">{item.finalAbv}%</span>
          </div>

          <div className="flex-1">
            <button 
              onClick={() => {
                onAddToCart(item);
                onClose();
              }}
              className="w-full h-14 bg-black text-white font-bold text-lg rounded-xl shadow-lg hover:bg-gray-800 transition active:scale-95 flex items-center justify-center gap-2"
            >
              주문 담기 <Plus size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CartSheet({ cart, isOpen, onClose, onPlaceOrder, isOrdering, onUpdateQuantity }) {
  const [userName, setUserName] = useState('');
  const [requestMessage, setRequestMessage] = useState(''); // 주문 요청사항 상태 추가
  const cartItems = Object.values(cart);
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // 로컬 스토리지에서 이름 불러오기
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
    onPlaceOrder(userName, requestMessage); // 요청사항 함께 전달
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
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] flex flex-col max-w-md mx-auto"
          >
            {/* Handle Bar */}
            <div className="p-4 flex justify-center" onClick={onClose}>
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-4 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-2xl font-black text-gray-900">장바구니</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <ChevronDown size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-10 text-gray-400">장바구니가 비어있습니다.</div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.finalAbv}% ABV</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 text-gray-500 hover:text-black"><Minus size={16} /></button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 text-gray-500 hover:text-black"><Plus size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">주문자 이름</label>
                <input 
                  type="text" 
                  placeholder="이름을 입력하세요 (예: 민수)" 
                  className="w-full p-4 rounded-xl border border-gray-200 font-bold text-lg focus:ring-2 focus:ring-black focus:outline-none"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">주문 요청사항</label>
                <textarea 
                  placeholder="얼음 적게, 레몬 슬라이스 추가 등" 
                  className="w-full p-4 rounded-xl border border-gray-200 text-base focus:ring-2 focus:ring-black focus:outline-none h-24 resize-none"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                ></textarea>
              </div>
              <button 
                onClick={handleOrder}
                disabled={isOrdering || totalQuantity === 0}
                className="w-full bg-black text-white font-bold text-xl py-4 rounded-xl shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
              >
                {isOrdering ? '주문 전송 중...' : `${totalQuantity}잔 주문하기`}
              </button>
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[80vh] flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Clock size={20} className="text-indigo-600" /> 주문 내역
          </h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 hover:bg-gray-100"><X size={20} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="text-center py-10 text-gray-400">불러오는 중...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>아직 주문 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map(order => (
                <div key={order.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === 'completed' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <span className="text-xs font-mono text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.status === 'pending' ? '제조 중' : '완료됨'}
                    </span>
                  </div>
                  <div className="pl-2 space-y-1">
                    <p className="font-bold text-gray-900">{order.userName || 'Guest'}님의 주문</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <span className="text-gray-500">x{item.quantity}</span>
                      </div>
                    ))}
                    {order.requestMessage && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg mt-2 border border-gray-100">
                        <span className="font-bold">요청:</span> {order.requestMessage}
                      </p>
                    )}
                  </div>
                </div>
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

  // 장바구니에서 직접 수량 조절
  const updateCartQuantity = (itemId, delta) => {
    if (delta > 0) {
      const item = cart[itemId] || menu.find(m => m.id === itemId);
      addToCart(item);
    } else {
      removeFromCart(itemId);
    }
  };

  const totalQuantity = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);

  const placeOrder = async (userName, requestMessage) => { // requestMessage 인자 추가
    if (totalQuantity === 0) return;
    setIsOrdering(true);
    const items = Object.values(cart).map(item => ({
      menuId: item.id,
      name: item.name,
      quantity: item.quantity
    }));

    try {
      const res = await api.post('/api/orders', { items, userName, requestMessage }); // requestMessage 전달
      
      // 로컬 스토리지에 내 주문 ID 저장
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
    <div className="pb-24 max-w-md mx-auto bg-gray-50 min-h-screen shadow-2xl relative overflow-hidden">
      {/* 헤더 */}
      <header className="bg-white p-6 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Beer className="text-yellow-500" />
            파티 바
          </h1>
          <p className="text-sm text-gray-500">여기서 음료를 주문하세요</p>
        </div>
        <button 
          onClick={() => setHistoryOpen(true)}
          className="p-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition"
          aria-label="주문 내역 확인"
        >
          <Clock size={20} />
        </button>
      </header>

      {/* 메뉴 리스트 */}
      <div className="p-4 space-y-4">
        {menu.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>아직 메뉴가 없습니다.</p>
            <p className="text-sm">바텐더에게 메뉴를 만들어 달라고 요청해주세요!</p>
          </div>
        ) : (
          menu.map(item => {
            const quantity = cart[item.id]?.quantity || 0;
            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center cursor-pointer active:bg-gray-50 transition"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Beer size={24} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate">{item.name}</h3>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-1">{item.description}</p>
                  <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded">
                    {item.finalAbv}% ABV
                  </span>
                </div>
                
                <div className="flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {quantity > 0 ? (
                    <div className="flex flex-col items-center bg-gray-100 rounded-full p-1">
                      <button onClick={() => addToCart(item)} className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
                        <Plus size={16} />
                      </button>
                      <span className="font-bold text-lg py-1 w-6 text-center">{quantity}</span>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 bg-white rounded-full shadow-sm text-gray-600">
                        <Minus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(item)}
                      className="bg-gray-900 text-white p-3 rounded-xl shadow-lg hover:bg-gray-800 transition"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 플로팅 주문 바 */}
      <AnimatePresence>
        {totalQuantity > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-4 max-w-md mx-auto bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-30"
          >
            <button 
              onClick={() => setCartOpen(true)}
              className="pointer-events-auto w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-2xl shadow-xl flex justify-between items-center px-8 hover:bg-indigo-700 transition active:scale-95"
            >
              <div className="flex items-center gap-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{totalQuantity}</span>
                <span>항목 담김</span>
              </div>
              <span className="flex items-center gap-1">장바구니 보기 <ChevronDown size={16} className="rotate-180"/></span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 모달 및 시트 */}
      <MenuDetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        cartQuantity={cart[selectedItem?.id]?.quantity || 0}
      />

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