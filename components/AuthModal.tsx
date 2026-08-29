'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Phone, ArrowRight, Building, UserCheck, User, Sparkles, X, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithPhone, isAuthenticated } = useApp();

  const [mode, setMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [role, setRole] = useState<UserRole>('LANDLORD');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+221 ');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen && isAuthenticated) return null;

  const handleQuickDemoSelect = (selectedRole: UserRole) => {
    if (selectedRole === 'LANDLORD') {
      loginWithPhone('+221 77 645 89 12', 'LANDLORD', 'Mamadou Ndiaye');
    } else {
      loginWithPhone('+221 78 312 45 67', 'TENANT', 'Aïssatou Sow');
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.length < 8) {
      alert('Veuillez fournir un numéro de téléphone Sénégal valide (+221).');
      return;
    }
    if (!password || password.length < 4) {
      alert('Veuillez saisir un mot de passe d\'au moins 4 caractères.');
      return;
    }

    if (mode === 'REGISTER') {
      if (!fullName.trim()) {
        alert('Veuillez fournir votre nom complet.');
        return;
      }
      loginWithPhone(phone, role, fullName);
    } else {
      // Login mode
      const defaultName = role === 'LANDLORD' ? 'Propriétaire Connecté' : 'Locataire Connecté';
      loginWithPhone(phone, role, fullName.trim() || defaultName);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 border-b border-slate-800 flex justify-between items-center text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-xl font-bold">
              🇸🇳
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">ImmoConnect Sénégal</h2>
              <p className="text-xs text-emerald-300">Plateforme Immobilière Certifiée</p>
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">
                {mode === 'REGISTER' ? 'Créer votre compte ImmoConnect' : 'Connexion à votre espace'}
              </h3>
              <p className="text-slate-400 text-[11px]">
                {mode === 'REGISTER'
                  ? 'Choisissez votre statut, vos identifiants et votre mot de passe pour débuter.'
                  : 'Entrez vos identifiants pour vous connecter à votre compte.'}
              </p>
            </div>

            {/* Statut / Role Selection Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Statut / Rôle *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('LANDLORD')}
                  className={`p-3 rounded-2xl border text-center flex items-center justify-center space-x-2 transition-all ${
                    role === 'LANDLORD'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-md font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building className="w-4 h-4 text-amber-400" />
                  <span>Propriétaire</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('TENANT')}
                  className={`p-3 rounded-2xl border text-center flex items-center justify-center space-x-2 transition-all ${
                    role === 'TENANT'
                      ? 'bg-teal-950/60 border-teal-500 text-teal-300 shadow-md font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <span>Locataire</span>
                </button>
              </div>
            </div>

            {/* Full Name (In Register Mode) */}
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nom complet (Prénom et Nom) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required={mode === 'REGISTER'}
                    placeholder="Ex: Mamadou Ndiaye ou Fatou Sow"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Numéro de téléphone Sénégal (+221) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="+221 77 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              {mode === 'REGISTER' ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>S'inscrire & Accéder à l'Application</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter</span>
                </>
              )}
            </button>

            {/* Account Switcher Link */}
            <div className="text-center pt-2">
              {mode === 'REGISTER' ? (
                <p className="text-[11px] text-slate-400">
                  Vous avez déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('LOGIN')}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    Se connecter
                  </button>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Vous n'avez pas de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('REGISTER')}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    S'inscrire
                  </button>
                </p>
              )}
            </div>

            {/* Quick Demo Selector */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block text-center">
                Ou connexion instantanée en 1 clic (Mode Démo)
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('LANDLORD')}
                  className="py-2.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-200 text-[11px] font-bold rounded-xl truncate px-2 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>🏠 Démo Propriétaire</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('TENANT')}
                  className="py-2.5 bg-teal-950/40 hover:bg-teal-900/60 border border-teal-800/60 text-teal-200 text-[11px] font-bold rounded-xl truncate px-2 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>🔑 Démo Locataire</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
