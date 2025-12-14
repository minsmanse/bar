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
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 text-white font-sans selection:bg-indigo-500/30">
      {/* Liquid Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-4 max-w-[1400px] mx-auto h-screen flex flex-col">
        <header className="flex justify-between items-center mb-6 flex-shrink-0">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 tracking-tight drop-shadow-sm">
            Bar <span className="font-light text-white/80">Admin</span>
          </h1>
          <nav className="flex bg-black/20 backdrop-blur-lg p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === 'orders' 
                  ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={18} /> 주문 확인
            </button>
            <button 
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === 'studio' 
                  ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wine size={18} /> 메뉴 관리
            </button>
          </nav>
        </header>

        <div className="flex-1 min-h-0 glass-panel rounded-3xl overflow-hidden relative border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          <div className="relative h-full p-6 overflow-auto">
            {activeTab === 'orders' && <AdminOrders socket={socket} />}
            {activeTab === 'studio' && <AdminMenuManager />}
          </div>
        </div>
      </div>
    </div>
  );
}