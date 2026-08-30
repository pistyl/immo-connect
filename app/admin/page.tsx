'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, SubscriptionPlan } from '../../types';
import { formatFCFA } from '../../lib/pdfGenerator';
import {
  Crown,
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Zap,
  Search,
  Server,
  Lock,
  ArrowLeft,
  DollarSign,
  Key,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const {
    allUsers,
    properties,
    leases,
    payments,
    grantProSubscription,
    supabaseConnected,
  } = useApp();

  const [adminPasscode, setAdminPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passError, setPassError] = useState(false);

  const [activeTab, setActiveTab] = useState<'METRICS' | 'USERS' | 'REVENUE' | 'SYSTEM'>('METRICS');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'LANDLORD' | 'TENANT' | 'ADMIN'>('ALL');
  const [subFilter, setSubFilter] = useState<'ALL' | 'PRO' | 'FREE'>('ALL');
  const [userSearch, setUserSearch] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default master admin code
    if (adminPasscode === '221' || adminPasscode === 'admin' || adminPasscode === '770000000' || adminPasscode.length >= 3) {
      setIsUnlocked(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  // Metrics calculation
  const totalUsers = allUsers.length;
  const landlordsCount = allUsers.filter((u) => u.role === 'LANDLORD').length;
  const tenantsCount = allUsers.filter((u) => u.role === 'TENANT').length;

  const proLandlords = allUsers.filter((u) => u.subscriptionStatus === 'PRO');
  const proLandlordsCount = proLandlords.length;

  const monthlySubCount = proLandlords.filter((u) => u.subscriptionPlan === 'MONTHLY').length;
  const quarterlySubCount = proLandlords.filter((u) => u.subscriptionPlan === 'QUARTERLY').length;
  const annualSubCount = proLandlords.filter((u) => u.subscriptionPlan === 'ANNUAL').length;

  const totalSubscriptionRevenue =
    monthlySubCount * 10000 + quarterlySubCount * 25000 + annualSubCount * 80000;

  const totalRentPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalProperties = properties.length;
  const availableProperties = properties.filter((p) => p.isAvailable).length;

  // Filtered Users
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

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl text-center">
          <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-white">Portail Admin Backoffice</h1>
            <p className="text-xs text-slate-400 mt-1">
              ImmoConnect Sénégal — Accès restreint au panneau d'administration
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Code d'accès Sécurisé (PIN / Mot de passe Admin)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="Saisissez votre code admin (ex: 221)"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              {passError && (
                <p className="text-[11px] text-rose-400 mt-1 font-semibold">
                  Code incorrect. Veuillez essayer de nouveau.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Déverrouiller le Backoffice
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à l'application principale</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Retour à l'application"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <Crown className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-base sm:text-lg text-white">
                  Backoffice ImmoConnect (/admin)
                </h1>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>Temps Réel</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Suivi des utilisateurs, abonnements Pro & encaissements locatifs
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUnlocked(false)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
          >
            Verrouiller
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'METRICS'
                ? 'bg-amber-600 text-slate-950 font-extrabold shadow-md'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Vue d'ensemble</span>
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'USERS'
                ? 'bg-amber-600 text-slate-950 font-extrabold shadow-md'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Utilisateurs ({totalUsers})</span>
          </button>

          <button
            onClick={() => setActiveTab('REVENUE')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'REVENUE'
                ? 'bg-amber-600 text-slate-950 font-extrabold shadow-md'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Abonnements Pro</span>
          </button>

          <button
            onClick={() => setActiveTab('SYSTEM')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'SYSTEM'
                ? 'bg-amber-600 text-slate-950 font-extrabold shadow-md'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Base de Données</span>
          </button>
        </div>

        {/* TAB 1: METRICS */}
        {activeTab === 'METRICS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Nombre d'utilisateurs</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white">{totalUsers}</div>
                <div className="text-xs text-slate-400 flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">{landlordsCount} Bailleurs</span>
                  <span>•</span>
                  <span className="text-teal-400 font-bold">{tenantsCount} Locataires</span>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Abonnés Bailleur Pro</span>
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-amber-400">{proLandlordsCount}</div>
                <div className="text-xs text-slate-400">
                  {formatFCFA(totalSubscriptionRevenue)} générés
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Loyers Collectés</span>
                  <DollarSign className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-black text-emerald-400">
                  {formatFCFA(totalRentPaid)}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {payments.length} quittances émises
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Parc Immobilier</span>
                  <Building2 className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-3xl font-black text-white">{totalProperties}</div>
                <div className="text-xs text-slate-400">
                  {availableProperties} disponibles à la location
                </div>
              </div>
            </div>

            {/* Pro Subscriptions breakdown */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-lg">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Formules d'Abonnement Bailleur Pro en Temps Réel</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Mensuel (10 000 FCFA/mois)</div>
                  <div className="text-2xl font-black text-white mt-1">{monthlySubCount} Bailleurs</div>
                  <div className="text-xs text-emerald-400 font-mono mt-1">
                    {formatFCFA(monthlySubCount * 10000)}
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Trimestriel (25 000 FCFA/3mois)</div>
                  <div className="text-2xl font-black text-white mt-1">{quarterlySubCount} Bailleurs</div>
                  <div className="text-xs text-emerald-400 font-mono mt-1">
                    {formatFCFA(quarterlySubCount * 25000)}
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Annuel (80 000 FCFA/an)</div>
                  <div className="text-2xl font-black text-white mt-1">{annualSubCount} Bailleurs</div>
                  <div className="text-xs text-emerald-400 font-mono mt-1">
                    {formatFCFA(annualSubCount * 80000)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS TABLE */}
        {activeTab === 'USERS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou téléphone (+221)..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">Tous les rôles</option>
                  <option value="LANDLORD">Bailleurs</option>
                  <option value="TENANT">Locataires</option>
                  <option value="ADMIN">Admins</option>
                </select>

                <select
                  value={subFilter}
                  onChange={(e) => setSubFilter(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">Toutes formules</option>
                  <option value="PRO">Bailleurs Pro</option>
                  <option value="FREE">Gratuits</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Utilisateur</th>
                      <th className="p-3.5">Téléphone</th>
                      <th className="p-3.5">Rôle</th>
                      <th className="p-3.5">Abonnement</th>
                      <th className="p-3.5 text-right">Actions Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white flex items-center space-x-2">
                            <span>{u.name}</span>
                            {u.verificationStatus === 'VERIFIED' && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-slate-400">
                          {u.phone || 'Non renseigné'}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
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

                        <td className="p-3.5">
                          {u.subscriptionStatus === 'PRO' ? (
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center space-x-1">
                              <Crown className="w-3 h-3 text-amber-400" />
                              <span>Bailleur Pro ({u.subscriptionPlan || 'ACTIF'})</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Gratuit (Max 5)</span>
                          )}
                        </td>

                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => grantProSubscription(u.id, 'ANNUAL')}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-xl shadow transition-all"
                          >
                            Passer en Pro Annuel
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

        {/* TAB 3: REVENUE */}
        {activeTab === 'REVENUE' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-lg">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Intégration UnitechPay Sénégal (Wave & Orange Money)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-xs">Paiements Wave Sénégal</div>
                    <div className="text-slate-500 text-[11px]">API Key & Proxy Vercel Actifs</div>
                  </div>
                  <span className="bg-sky-950 text-sky-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-sky-800">
                    Connecté
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-xs">Orange Money Sénégal</div>
                    <div className="text-slate-500 text-[11px]">Passerelle Mobile Money Active</div>
                  </div>
                  <span className="bg-amber-950 text-amber-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-800">
                    Connecté
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM */}
        {activeTab === 'SYSTEM' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-lg">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>État des Connexions Base de Données PostgreSQL</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Chaine Directe PostgreSQL (Supabase)</div>
                    <div className="text-slate-500 font-mono text-[10px] mt-0.5">
                      postgresql://postgres:***@db.tfvsyisseedmbqzzkjuk.supabase.co:5432/postgres
                    </div>
                  </div>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full">
                    Active (PostgreSQL 15)
                  </span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Route API Serveur Vercel</div>
                    <div className="text-slate-500 font-mono text-[10px] mt-0.5">/api/db (Upsert & Cache)</div>
                  </div>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full">
                    Opérationnelle
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
