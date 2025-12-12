import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import AdminMenuManager from '../components/AdminMenuManager';
import AdminOrders from '../components/AdminOrders';
import { LayoutDashboard, Wine } from 'lucide-react';
import { useLocation } from 'react-router-dom'; // useLocation import

const socketURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(socketURL);

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const location = useLocation(); // useLocation 훅 사용
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('not_admin') === 'true') {
      setShowAccessDenied(true);
      // 일정 시간 후 메시지 숨기기
      const timer = setTimeout(() => {
        setShowAccessDenied(false);
      }, 5000); // 5초 후 사라짐
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  return (
    <div className="p-4 max-w-[1400px] mx-auto h-screen flex flex-col">
      <header className="flex justify-between items-center mb-6 flex-shrink-0">
        <h1 className="text-2xl font-black text-indigo-900 tracking-tight">바<span className="text-indigo-500">관리자</span></h1>
        <nav className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={18} /> 실시간 주문
          </button>
          <button 
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'studio' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Wine size={18} /> 메뉴 스튜디오
          </button>
        </nav>
      </header>

      {showAccessDenied && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
          <img 
            src="https://dcimg1.dcinside.com/viewimage.php?id=2cb9dd2ff6c131a960&no=24b0d769e1d32ca73fea85fa11d028315c2a09e47d692719f95ebfe695d2a17112e7c2c528c8ebe8ad26729d9309e79deb4284f3f6ed1e7f451e7427ae3281954a902f5ea89fd1aa909e5596407ec96221ba577da5d23d&orgExt" 
            alt="Access Denied" 
            className="max-w-full h-auto max-h-[70vh] rounded-lg shadow-xl mb-6"
          />
          <p className="text-4xl font-extrabold text-red-500 animate-pulse drop-shadow-lg text-center">
            너 관리자 아니잖아!
          </p>
        </div>
      )}

      <div className="flex-1 min-h-0">
        {activeTab === 'orders' && <AdminOrders socket={socket} />}
        {activeTab === 'studio' && <AdminMenuManager />}
      </div>
    </div>
  );
}