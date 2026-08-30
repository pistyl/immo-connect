'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Building,
  UserCheck,
  WifiOff,
  Bell,
  RefreshCw,
  Phone,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateProperty?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateProperty }) => {
  const {
    currentRole,
    toggleRole,
    currentUser,
    isAuthenticated,
    openAuthModal,
    logout,
    isOffline,
    offlineDrafts,
    smsNotifications,
    clearSmsNotifications,
    supabaseConnected,
  } = useApp();

  const [showSmsDrawer, setShowSmsDrawer] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-amber-95 text-xs font-semibold px-4 py-1.5 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Mode Hors-Ligne actif (Réseau 3G instable). Vos brouillons sont sauvegardés en local.</span>
          </div>
          {offlineDrafts.length > 0 && (
            <span className="bg-amber-900/60 px-2 py-0.5 rounded text-[11px] font-mono">
              {offlineDrafts.length} en attente
            </span>
          )}
        </div>
      )}

      {/* Main Top Header */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            🇸🇳
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">ImmoConnect</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-800">
                SÉNÉGAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Gestion Locative Digitale Nationale</p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center space-x-2">
          {/* SMS Notification Bell */}
          <button
            onClick={() => setShowSmsDrawer(!showSmsDrawer)}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Notifications SMS & Alertes"
          >
            <Bell className="w-4 h-4" />
            {smsNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {smsNotifications.length}
              </span>
            )}
          </button>

          {/* Quick Create Property Button for Landlords */}
          {currentRole === 'LANDLORD' && onOpenCreateProperty && (
            <button
              onClick={onOpenCreateProperty}
              className="hidden sm:flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publier</span>
            </button>
          )}

          {/* Profile Switcher Toggle */}
          <button
            onClick={toggleRole}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
              currentRole === 'LANDLORD'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-500 text-white'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 border-teal-500 text-white'
            }`}
          >
            {currentRole === 'LANDLORD' ? (
              <>
                <Building className="w-3.5 h-3.5" />
                <span>Propriétaire</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Locataire</span>
              </>
            )}
            <RefreshCw className="w-3 h-3 ml-0.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* Profile Bar Status */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-t border-slate-800/80 text-[11px] flex justify-between items-center text-slate-400 max-w-4xl mx-auto">
        <div className="flex items-center space-x-2 truncate">
          <span className="font-semibold text-slate-200 truncate">{currentUser.name}</span>
          <span className="text-slate-500">({currentUser.phone})</span>
          {currentUser.verificationStatus === 'VERIFIED' && (
            <span className="inline-flex items-center space-x-0.5 text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>Vérifié</span>
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 text-[10px]">
          <button
            onClick={openAuthModal}
            className="text-emerald-400 font-bold hover:underline"
          >
            Connexion Rôles
          </button>
          <span className="text-slate-600">•</span>
          <button
            onClick={logout}
            className="text-rose-400 hover:underline"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* SMS Drawer Modal */}
      {showSmsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 w-full max-w-md h-full shadow-2xl p-4 flex flex-col justify-between border-l border-slate-800 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Alertes SMS & Notifications</h3>
                    <p className="text-xs text-slate-400">Centre d'Alertes SMS Sénégal (+221)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSmsDrawer(false)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {smsNotifications.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    Aucune alerte SMS enregistrée pour le moment.
                    <br />
                    Les notifications de paiement et alertes de messagerie s'afficheront ici.
                  </div>
                ) : (
                  smsNotifications.map((sms) => (
                    <div
                      key={sms.id}
                      className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-xs space-y-1.5"
                    >
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SMS vers {sms.phone}</span>
                        </span>
                        <span className="text-slate-400 font-mono">{sms.timestamp}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed font-sans">{sms.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {smsNotifications.length > 0 && (
              <button
                onClick={clearSmsNotifications}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors border border-slate-700"
              >
                Effacer l'historique SMS
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
