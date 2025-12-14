import React, { useState } from 'react';
import { io } from 'socket.io-client';
import AdminMenuManager from '../components/AdminMenuManager';
import AdminOrders from '../components/AdminOrders';
import { LayoutDashboard, Wine, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const socketURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(socketURL);

// Claude-like Theme Constants
const THEME = {
  bg: 'bg-[#F9F8F6]',
  textMain: 'text-[#3E3E3C]',
  textMuted: 'text-[#8E8B86]',
  accent: 'text-[#D97757]',
  accentBg: 'bg-[#D97757]',
  card: 'bg-white',
  border: 'border-[#EAE8E4]',
  buttonPrimary: 'bg-[#2D2B26]',
  buttonPrimaryHover: 'hover:bg-[#4A4843]',
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${THEME.bg} ${THEME.textMain} font-sans selection:bg-[#D97757]/20`}>
      <div className="relative z-10 p-6 max-w-[1400px] mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className={`flex justify-between items-center mb-6 flex-shrink-0 pb-5 border-b ${THEME.border}`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className={`p-2 ${THEME.card} border ${THEME.border} rounded-xl ${THEME.textMuted} hover:${THEME.textMain} transition-colors shadow-sm`}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className={`text-2xl font-serif font-bold ${THEME.textMain} tracking-tight`}>
                Bar <span className={THEME.accent}>Admin</span>
              </h1>
              <p className={`text-xs ${THEME.textMuted} font-medium uppercase tracking-widest`}>Dashboard</p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <nav className={`flex ${THEME.card} p-1.5 rounded-xl border ${THEME.border} shadow-sm`}>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'orders' 
                  ? `${THEME.buttonPrimary} text-[#F9F8F6] shadow-md` 
                  : `${THEME.textMuted} hover:${THEME.textMain} hover:bg-[#F2F0ED]`
              }`}
            >
              <LayoutDashboard size={16} /> 주문 확인
            </button>
            <button 
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'studio' 
                  ? `${THEME.buttonPrimary} text-[#F9F8F6] shadow-md` 
                  : `${THEME.textMuted} hover:${THEME.textMain} hover:bg-[#F2F0ED]`
              }`}
            >
              <Wine size={16} /> 메뉴 관리
            </button>
          </nav>
        </header>

        {/* Main Content */}
        <div className={`flex-1 min-h-0 ${THEME.card} rounded-2xl overflow-hidden relative border ${THEME.border} shadow-sm`}>
          <div className="relative h-full p-6 overflow-auto">
            {activeTab === 'orders' && <AdminOrders socket={socket} />}
            {activeTab === 'studio' && <AdminMenuManager />}
          </div>
        </div>
      </div>
    </div>
  );
}