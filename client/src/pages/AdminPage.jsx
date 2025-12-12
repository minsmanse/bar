import React, { useState } from 'react';
import { io } from 'socket.io-client';
import AdminMenuManager from '../components/AdminMenuManager';
import AdminOrders from '../components/AdminOrders';
import { LayoutDashboard, Wine } from 'lucide-react';

const socketURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(socketURL);

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="p-4 max-w-[1400px] mx-auto h-screen flex flex-col">
      <header className="flex justify-between items-center mb-6 flex-shrink-0">
        <h1 className="text-2xl font-black text-indigo-900 tracking-tight">관리자<span className="text-indigo-500">메뉴</span></h1>
        <nav className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={18} /> 주문 확인
          </button>
          <button 
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'studio' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Wine size={18} /> 메뉴 관리
          </button>
        </nav>
      </header>

      <div className="flex-1 min-h-0">
        {activeTab === 'orders' && <AdminOrders socket={socket} />}
        {activeTab === 'studio' && <AdminMenuManager />}
      </div>
    </div>
  );
}