import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Bell } from 'lucide-react';

export default function AdminOrders({ socket }) {
  const [orders, setOrders] = useState([]);
  // 알림음 설정 (딩동 소리)
  const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

  useEffect(() => {
    fetchOrders();

    socket.on('initialData', (data) => {
      // If we want initial sync via socket, but REST is fine too.
    });

    socket.on('newOrder', (order) => {
      setOrders(prev => [order, ...prev]);
      // 소리 재생 시도
      notificationSound.play().catch(error => {
        console.log("Audio play failed (user interaction required):", error);
      });
    });

    socket.on('orderUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    return () => {
      socket.off('newOrder');
      socket.off('orderUpdated');
    };
  }, [socket]);

  const fetchOrders = async () => {
    const res = await api.get('/api/orders');
    // Sort by newest first
    setOrders(res.data.reverse());
  };

  const updateStatus = async (id, status) => {
    await api.put(`/api/orders/${id}/status`, { status });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        새로운 주문
        <motion.span 
          key={orders.filter(o => o.status === 'pending').length}
          initial={{ scale: 1.5, color: '#ef4444' }}
          animate={{ scale: 1, color: '#ffffff' }}
          className="bg-red-500 text-white text-xs px-2 py-1 rounded-full"
        >
          {orders.filter(o => o.status === 'pending').length}
        </motion.span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`p-6 rounded-2xl border-l-4 shadow-sm relative overflow-hidden ${order.status === 'completed' ? 'bg-gray-50 border-green-500 opacity-60' : 'bg-white border-yellow-500 shadow-md'}`}
            >
              {order.status === 'pending' && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute top-0 right-0 p-2"
                >
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </span>
                </motion.div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xl font-black text-gray-900">{order.userName || 'Guest'}</span>
                    <span className="text-sm text-gray-400 font-mono">#{order.id.slice(-4)}</span>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {order.status === 'pending' ? '대기중' : '완료'}
                </div>
              </div>

              <div className="space-y-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-lg border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                    <span className="font-bold text-gray-800">{item.name}</span>
                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600 font-bold text-sm">{item.quantity}잔</span>
                  </div>
                ))}
                {order.requestMessage && (
                  <div className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">
                    <span className="font-bold text-indigo-600">요청:</span> {order.requestMessage}
                  </div>
                )}
              </div>

              {order.status === 'pending' ? (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateStatus(order.id, 'completed')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition shadow-lg shadow-indigo-200"
                >
                  <CheckCircle size={18} /> 완료 처리
                </motion.button>
              ) : (
                <button 
                  disabled
                  className="w-full bg-gray-200 text-gray-400 font-bold py-3 rounded-xl flex justify-center items-center gap-2 cursor-not-allowed"
                >
                  완료됨
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}