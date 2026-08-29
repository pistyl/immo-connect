'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  MessageSquare,
  FileCheck,
  CreditCard,
  LayoutDashboard,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentRole, conversations, payments } = useApp();

  const unreadMsgCount = conversations.reduce((acc, c) => acc + c.messages.length, 0);
  const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;

  const tabs = [
    { id: 'explore', label: 'Annonces', icon: Building2 },
    { id: 'messages', label: 'Messagerie', icon: MessageSquare, badge: unreadMsgCount > 0 ? unreadMsgCount : null },
    { id: 'leases', label: 'Baux & Lieux', icon: FileCheck },
    { id: 'payments', label: 'Loyers', icon: CreditCard, badge: pendingPayments > 0 ? pendingPayments : null },
    { id: 'dashboard', label: currentRole === 'LANDLORD' ? 'Mes Biens' : 'Mon Bail', icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400">
      <div className="max-w-md mx-auto grid grid-cols-5 h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center space-y-1 transition-all ${
                isActive ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] truncate max-w-full px-1">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
