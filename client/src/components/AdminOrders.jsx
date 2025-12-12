import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';

export default function AdminOrders({ socket }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();

    socket.on('initialData', (data) => {
      // If we want initial sync via socket, but REST is fine too.
    });

    socket.on('newOrder', (order) => {
      setOrders(prev => [order, ...prev]);
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
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{orders.filter(o => o.status === 'pending').length}</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-6 rounded-xl border-l-4 shadow-sm ${order.status === 'completed' ? 'bg-gray-50 border-green-500' : 'bg-white border-yellow-500 shadow-md'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xl font-black text-gray-900">{order.userName || 'Guest'}</span>
                    <span className="text-sm text-gray-400 font-mono">#{order.id.slice(-4)}</span>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {order.status === 'pending' ? '대기중' : '완료'}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-lg">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">{item.quantity}개</span>
                  </div>
                ))}
              </div>

              {order.status === 'pending' ? (
                <button 
                  onClick={() => updateStatus(order.id, 'completed')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg flex justify-center items-center gap-2 transition"
                >
                  <CheckCircle size={18} /> 완료 처리
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full bg-gray-200 text-gray-400 font-bold py-2 rounded-lg flex justify-center items-center gap-2 cursor-not-allowed"
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