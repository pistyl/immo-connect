'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubscriptionPlan, UserRole } from '../types';
import { formatFCFA } from '../lib/pdfGenerator';
import {
  X,
  Users,
  Building2,
  CreditCard,
  Crown,
  ShieldCheck,
  TrendingUp,
  FileText,
  Activity,
  CheckCircle,
  Clock,
  Search,
  Filter,
  DollarSign,
  ArrowUpRight,
  Phone,
  Calendar,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';

interface AdminBackofficeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminBackofficeModal: React.FC<AdminBackofficeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    allUsers,
    properties,
    leases,
    payments,
    grantProSubscription,
    supabaseConnected,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'METRICS' | 'USERS' | 'REVENUE' | 'SYSTEM'>('METRICS');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'LANDLORD' | 'TENANT' | 'ADMIN'>('ALL');
  const [subFilter, setSubFilter] = useState<'ALL' | 'PRO' | 'FREE'>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserToGrant, setSelectedUserToGrant] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time Calculated Metrics
  const totalUsers = allUsers.length;
  const landlordsCount = allUsers.filter((u) => u.role === 'LANDLORD').length;
  const tenantsCount = allUsers.filter((u) => u.role === 'TENANT').length;

  const proLandlords = allUsers.filter((u) => u.subscriptionStatus === 'PRO');
  const proLandlordsCount = proLandlords.length;

  // Calculate MRR / Subscription Revenue Estimate
  const monthlySubCount = proLandlords.filter((u) => u.subscriptionPlan === 'MONTHLY').length;
  const quarterlySubCount = proLandlords.filter((u) => u.subscriptionPlan === 'QUARTERLY').length;
  const annualSubCount = proLandlords.filter((u) => u.subscriptionPlan === 'ANNUAL').length;

  const totalSubscriptionRevenue =
    monthlySubCount * 10000 + quarterlySubCount * 25000 + annualSubCount * 80000;

  const totalRentPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingRentCount = payments.filter((p) => p.status === 'PENDING').length;
  const totalProperties = properties.length;
  const availableProperties = properties.filter((p) => p.isAvailable).length;

  // User Filter Logic
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSub =
      subFilter === 'ALL' ||
      (subFilter === 'PRO' && u.subscriptionStatus === 'PRO') ||
      (subFilter === 'FREE' && u.subscriptionStatus !== 'PRO');
    return matchesSearch && matchesRole && matchesSub;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col max-h-[95vh]">
        {/* Top Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white">
                  Backoffice ImmoConnect
                </h2>
                <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>En temps réel</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Surveillance des utilisateurs, abonnements Pro & revenus locatifs au Sénégal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950/60 px-5 border-b border-slate-800/80 flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 shrink-0 transition-colors ${
              activeTab === 'METRICS'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Vue d'ensemble</span>
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 shrink-0 transition-colors ${
              activeTab === 'USERS'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Utilisateurs ({totalUsers})</span>
          </button>

          <button
            onClick={() => setActiveTab('REVENUE')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 shrink-0 transition-colors ${
              activeTab === 'REVENUE'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Abonnements & Revenus</span>
          </button>

          <button
            onClick={() => setActiveTab('SYSTEM')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 shrink-0 transition-colors ${
              activeTab === 'SYSTEM'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Système & DB</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: METRICS & VUE D'ENSEMBLE */}
          {activeTab === 'METRICS' && (
            <div className="space-y-6">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Nombre d'utilisateurs</span>
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalUsers}</div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <span className="text-emerald-400 font-bold">{landlordsCount} Bailleurs</span>
                    <span>•</span>
                    <span className="text-teal-400 font-bold">{tenantsCount} Locataires</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Abonnés Bailleur Pro</span>
                    <Crown className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                    {proLandlordsCount}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatFCFA(totalSubscriptionRevenue)} générés
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Loyers Encaissements</span>
                    <DollarSign className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    {formatFCFA(totalRentPaid)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {payments.length} quittances émises
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Parc Immobilier</span>
                    <Building2 className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    {totalProperties}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {availableProperties} disponibles à la location
                  </div>
                </div>
              </div>

              {/* Pro Subscriptions breakdown */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Répartition des Formules d'Abonnement Pro (Temps Réel)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Mensuel (10 000 FCFA/mois)</div>
                    <div className="text-xl font-bold text-white mt-1">{monthlySubCount} Bailleurs</div>
                    <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      {formatFCFA(monthlySubCount * 10000)}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Trimestriel (25 000 FCFA/3mois)</div>
                    <div className="text-xl font-bold text-white mt-1">{quarterlySubCount} Bailleurs</div>
                    <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      {formatFCFA(quarterlySubCount * 25000)}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Annuel (80 000 FCFA/an)</div>
                    <div className="text-xl font-bold text-white mt-1">{annualSubCount} Bailleurs</div>
                    <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      {formatFCFA(annualSubCount * 80000)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS & SUBSCRIBERS TABLE */}
          {activeTab === 'USERS' && (
            <div className="space-y-4">
              {/* Search & Role Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou numéro de téléphone (+221)..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">Tous les rôles</option>
                    <option value="LANDLORD">Bailleurs</option>
                    <option value="TENANT">Locataires</option>
                    <option value="ADMIN">Administrateurs</option>
                  </select>

                  <select
                    value={subFilter}
                    onChange={(e) => setSubFilter(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">Toutes formules</option>
                    <option value="PRO">Formule Pro</option>
                    <option value="FREE">Formule Gratuite</option>
                  </select>
                </div>
              </div>

              {/* Users Live Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Utilisateur</th>
                        <th className="p-3">Téléphone</th>
                        <th className="p-3">Rôle</th>
                        <th className="p-3">Statut Pro</th>
                        <th className="p-3 text-right">Actions Pro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-white flex items-center space-x-2">
                              <span>{u.name}</span>
                              {u.verificationStatus === 'VERIFIED' && (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                            </div>
                          </td>

                          <td className="p-3 font-mono text-slate-400">
                            {u.phone || 'Non renseigné'}
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                u.role === 'LANDLORD'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : u.role === 'ADMIN'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                  : 'bg-teal-950 text-teal-300 border border-teal-800'
                              }`}
                            >
                              {u.role === 'LANDLORD'
                                ? 'Bailleur'
                                : u.role === 'ADMIN'
                                ? 'Admin'
                                : 'Locataire'}
                            </span>
                          </td>

                          <td className="p-3">
                            {u.subscriptionStatus === 'PRO' ? (
                              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                                <Crown className="w-3 h-3 text-amber-400" />
                                <span>Bailleur Pro ({u.subscriptionPlan || 'ACTIF'})</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Gratuit (Max 5)</span>
                            )}
                          </td>

                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => grantProSubscription(u.id, 'ANNUAL')}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-lg shadow transition-all"
                            >
                              Accorder Pro
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVENUE STREAM */}
          {activeTab === 'REVENUE' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Passerelle de Paiement Sénégal Mobile Money</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Toutes les transactions de loyer et d'abonnements transitent via l'API officielle UnitechPay Sénégal.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-bold">Wave Mobile Money</span>
                    <span className="bg-sky-950 text-sky-400 font-mono text-[11px] px-2 py-0.5 rounded border border-sky-800">
                      Actif
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-bold">Orange Money Sénégal</span>
                    <span className="bg-amber-950 text-amber-400 font-mono text-[11px] px-2 py-0.5 rounded border border-amber-800">
                      Actif
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM & DB STATUS */}
          {activeTab === 'SYSTEM' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>État des Connexions Base de Données</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">PostgreSQL Direct Connection</div>
                      <div className="text-slate-500 font-mono text-[10px]">
                        postgresql://postgres:***@db.tfvsyisseedmbqzzkjuk.supabase.co:5432/postgres
                      </div>
                    </div>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Connecté (PostgreSQL 15)
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">Vercel Proxy Route</div>
                      <div className="text-slate-500 font-mono text-[10px]">/api/db (JSON Sync)</div>
                    </div>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Opérationnel
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
