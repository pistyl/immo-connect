'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Property, SenegalRegion, SENEGAL_REGIONS, SENEGAL_LOCALITIES, Lease, InventoryReport, Payment } from '../types';
import { formatFCFA } from '../lib/pdfGenerator';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyDetailModal } from '../components/PropertyDetailModal';
import { CreatePropertyModal } from '../components/CreatePropertyModal';
import { WavePaymentModal } from '../components/WavePaymentModal';
import { OrangeMoneyPaymentModal } from '../components/OrangeMoneyPaymentModal';
import { LeaseModal } from '../components/LeaseModal';
import { InventoryModal } from '../components/InventoryModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { ProfileVerificationModal } from '../components/ProfileVerificationModal';
import { AuthModal } from '../components/AuthModal';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Building,
  Plus,
  MessageSquare,
  FileText,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Send,
  Download,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export default function HomePage() {
  const {
    currentRole,
    currentUser,
    isAuthenticated,
    isAuthModalOpen,
    closeAuthModal,
    properties,
    leases,
    inventoryReports,
    payments,
    conversations,
    sendMessage,
    sendSmsFallback,
    activeTab,
    setActiveTab,
    createLease,
  } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('TOUTES');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('TOUS');
  const [selectedType, setSelectedType] = useState<string>('TOUS');
  const [maxPrice, setMaxPrice] = useState<number>(700000);

  // Modals state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeLeaseModal, setActiveLeaseModal] = useState<Lease | null>(null);
  const [activeInventoryModal, setActiveInventoryModal] = useState<InventoryReport | null>(null);
  const [wavePayment, setWavePayment] = useState<Payment | null>(null);
  const [omPayment, setOmPayment] = useState<Payment | null>(null);
  const [activeReceiptModal, setActiveReceiptModal] = useState<Payment | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  // Chat State
  const [activeChatPropertyId, setActiveChatPropertyId] = useState<string | null>(
    conversations[0]?.propertyId || null
  );
  const [chatInputText, setChatInputText] = useState('');

  // Filtered Properties
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion =
      selectedRegion === 'TOUTES' || p.region === selectedRegion;
    const matchesNeighborhood =
      selectedNeighborhood === 'TOUS' || p.neighborhood === selectedNeighborhood;
    const matchesType = selectedType === 'TOUS' || p.type === selectedType;
    const matchesPrice = p.price <= maxPrice;
    return matchesSearch && matchesRegion && matchesNeighborhood && matchesType && matchesPrice;
  });

  // Selected Active Chat
  const currentChat = conversations.find((c) => c.propertyId === activeChatPropertyId) || conversations[0];

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !currentChat) return;
    const recipientRole = currentRole === 'LANDLORD' ? 'TENANT' : 'LANDLORD';
    sendMessage(currentChat.propertyId, chatInputText, recipientRole);
    setChatInputText('');
  };

  const handleTriggerSmsFallback = () => {
    if (!currentChat || !chatInputText.trim()) {
      alert('Veuillez d\'abord saisir un message avant d\'envoyer le SMS de secours.');
      return;
    }
    sendSmsFallback(currentChat.id, chatInputText);
    setChatInputText('');
  };

  // Financial Stats
  const totalCollected = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, p) => acc + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Sticky Navbar */}
      <Navbar onOpenCreateProperty={() => setIsCreateOpen(true)} />

      {/* Main Page Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* ==================================================================== */}
        {/* TAB 1: EXPLORE / ANNONCES */}
        {/* ==================================================================== */}
        {activeTab === 'explore' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Rechercher à Dakar, Thiès, Saly, Saint-Louis, Cap Skirring, Ziguinchor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>

            {/* Senegal Regions Horizontal Scroll Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Régions du Sénégal (14 Régions)</span>
                </span>
                {selectedRegion !== 'TOUTES' && (
                  <button
                    onClick={() => {
                      setSelectedRegion('TOUTES');
                      setSelectedNeighborhood('TOUS');
                    }}
                    className="text-emerald-400 text-[11px] underline"
                  >
                    Toutes les régions
                  </button>
                )}
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedRegion('TOUTES')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedRegion === 'TOUTES'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Tout le Sénégal ({properties.length})
                </button>
                {SENEGAL_REGIONS.map((r) => {
                  const count = properties.filter((p) => p.region === r).length;
                  const isActive = selectedRegion === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        setSelectedRegion(r);
                        setSelectedNeighborhood('TOUS');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center space-x-1 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>{r}</span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isActive ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Filter Bar */}
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Budget max : </span>
                <span className="font-extrabold text-emerald-400">{formatFCFA(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={1000000}
                step={50000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-28 sm:w-40 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Properties Grid Header */}
            <div className="flex justify-between items-center pt-2">
              <h2 className="font-extrabold text-sm text-white flex items-center space-x-2">
                <span>Annonces disponibles</span>
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-mono">
                  {filteredProperties.length}
                </span>
              </h2>

              {currentRole === 'LANDLORD' && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center space-x-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publier une annonce</span>
                </button>
              )}
            </div>

            {/* Properties Cards Grid */}
            {filteredProperties.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
                <Building className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">Aucune annonce trouvée</h3>
                <p className="text-xs text-slate-500">
                  Essayez de modifier les filtres ou d'augmenter le budget max.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onSelect={(p) => setSelectedProperty(p)}
                    onContact={(p) => {
                      setActiveChatPropertyId(p.id);
                      setActiveTab('messages');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: MESSAGERIE INTERNE & SMS FALLBACK */}
        {/* ==================================================================== */}
        {activeTab === 'messages' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <h2 className="font-extrabold text-base text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>Messagerie ImmoConnect</span>
              </h2>
              <span className="text-xs text-slate-400">SMS Fallback disponible</span>
            </div>

            {/* Conversations list selector */}
            <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {conversations.map((conv) => {
                const isActive = conv.propertyId === currentChat?.propertyId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveChatPropertyId(conv.propertyId)}
                    className={`flex items-center space-x-2 p-2 px-3 rounded-2xl border shrink-0 text-xs transition-all ${
                      isActive
                        ? 'bg-emerald-950 border-emerald-700 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <img src={conv.propertyPhoto} alt="" className="w-7 h-7 rounded-lg object-cover" />
                    <div className="text-left">
                      <div className="font-bold truncate max-w-[120px]">{conv.propertyTitle}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {currentRole === 'LANDLORD' ? conv.tenantName : conv.landlordName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Chat Box Interface */}
            {currentChat ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[65vh] shadow-xl">
                {/* Chat Header */}
                <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src={currentChat.propertyPhoto}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-white">{currentChat.propertyTitle}</h3>
                      <p className="text-xs text-emerald-400">
                        Interlocuteur :{' '}
                        <strong>
                          {currentRole === 'LANDLORD' ? currentChat.tenantName : currentChat.landlordName}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
                  {currentChat.messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-slate-500 mb-1 px-1">{msg.senderName} • {msg.timestamp}</div>
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                            msg.isSmsFallback
                              ? 'bg-amber-950/90 text-amber-200 border border-amber-800'
                              : isMe
                              ? 'bg-emerald-600 text-white rounded-tr-none shadow'
                              : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Form */}
                <form
                  onSubmit={handleSendMessageSubmit}
                  className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    placeholder="Écrivez votre message..."
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition-all"
                    title="Envoyer message interne"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                  {/* SMS Fallback Button */}
                  <button
                    type="button"
                    onClick={handleTriggerSmsFallback}
                    className="px-3 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow transition-all shrink-0"
                    title="Envoyer une alerte SMS si l'utilisateur est hors-ligne"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">SMS Fallback</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-900 p-8 rounded-3xl text-center text-slate-500 text-xs">
                Aucune conversation active pour le moment.
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: BAUX DIGITAUX & ÉTATS DES LIEUX */}
        {/* ==================================================================== */}
        {activeTab === 'leases' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Section 1: Digital Leases */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Contrats de Bail Digitaux (Sénégal)</span>
                </h2>
                {currentRole === 'LANDLORD' && (
                  <button
                    onClick={() => {
                      if (properties.length > 0) {
                        createLease({
                          propertyId: properties[0].id,
                          propertyTitle: properties[0].title,
                          propertyRegion: properties[0].region,
                          propertyNeighborhood: properties[0].neighborhood,
                          landlordId: currentUser.id,
                          landlordName: currentUser.name,
                          landlordPhone: currentUser.phone,
                          tenantId: 'usr_tenant_aissatou',
                          tenantName: 'Aïssatou Sow',
                          tenantPhone: '+221 78 312 45 67',
                          monthlyRent: properties[0].price,
                          securityDeposit: properties[0].price * 2,
                          startDate: '2026-09-01',
                          durationMonths: 12,
                        });
                        alert('Nouveau bail généré pour Aïssatou Sow !');
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouveau bail</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {leases.map((lease) => (
                  <div
                    key={lease.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{lease.propertyTitle}</span>
                        {lease.status === 'ACTIVE' ? (
                          <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                            Actif
                          </span>
                        ) : (
                          <span className="bg-amber-950 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-800">
                            En attente de signature
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Bailleur : <strong>{lease.landlordName}</strong> • Locataire : <strong>{lease.tenantName}</strong>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                        Loyer : {formatFCFA(lease.monthlyRent)} / mois
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveLeaseModal(lease)}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-1"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Consulter & Signer (PDF)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Room-by-Room Inventory Reports & Side-by-Side Comparison */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <span>États des Lieux & Comparateur Entrée / Sortie</span>
                </h2>
              </div>

              <div className="space-y-3">
                {inventoryReports.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{inv.propertyTitle}</span>
                        <span className="bg-sky-950 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-800">
                          {inv.type === 'ENTREE' ? "Remise des clés (Entrée)" : "Restitution (Sortie)"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {inv.items.length} éléments inspectés pièce par pièce avec photos horodatées
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveInventoryModal(inv)}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 shadow transition-all flex items-center justify-center space-x-1"
                    >
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Voir & Comparer</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: PAIEMENT DES LOYERS & MOBILE MONEY */}
        {/* ==================================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <h2 className="font-extrabold text-base text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Paiement des Loyers via Mobile Money</span>
              </h2>
            </div>

            {/* Rent Due Alert Cards */}
            <div className="space-y-3">
              {payments.map((pay) => (
                <div
                  key={pay.id}
                  className={`bg-slate-900 border rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow ${
                    pay.status === 'PAID'
                      ? 'border-emerald-800/80 bg-emerald-950/20'
                      : 'border-amber-800/80 bg-amber-950/20 animate-pulse'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-white text-base">
                        {formatFCFA(pay.amount)}
                      </span>
                      <span className="text-xs text-slate-400">• Loyer {pay.periodMonth}</span>
                      {pay.status === 'PAID' ? (
                        <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                          ✓ Réglé
                        </span>
                      ) : (
                        <span className="bg-amber-950 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-800">
                          ⏳ En attente de paiement
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 mt-1">{pay.propertyTitle}</div>
                    {pay.paidDate && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Réglé le {new Date(pay.paidDate).toLocaleString('fr-FR')} via{' '}
                        <strong>{pay.method}</strong> ({pay.transactionId})
                      </div>
                    )}
                  </div>

                  {pay.status === 'PENDING' ? (
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => setWavePayment(pay)}
                        className="flex-1 sm:flex-none px-3.5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1"
                      >
                        <span>🌊 Payer avec Wave</span>
                      </button>
                      <button
                        onClick={() => setOmPayment(pay)}
                        className="flex-1 sm:flex-none px-3.5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1"
                      >
                        <span>🍊 Orange Money</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveReceiptModal(pay)}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 shadow flex items-center justify-center space-x-1.5"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Télécharger Quittance</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: TABLEAU DE BORD (PROPRIÉTAIRE & LOCATAIRE) */}
        {/* ==================================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {currentRole === 'LANDLORD' ? (
              /* LANDLORD DASHBOARD VIEW */
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-extrabold text-lg text-white">Tableau de Bord Bailleur</h2>
                    <p className="text-xs text-slate-400">Vue consolidée de votre patrimoine immobilier à Dakar</p>
                  </div>
                  {currentUser.verificationStatus === 'VERIFIED' ? (
                    <span className="bg-emerald-950 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-800 flex items-center space-x-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Bailleur Vérifié</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsVerificationOpen(true)}
                      className="bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow"
                    >
                      Faire vérifier mon identité
                    </button>
                  )}
                </div>

                {/* Financial KPI Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Encaissé</span>
                    <span className="text-base sm:text-lg font-black text-emerald-400 mt-1 block">
                      {formatFCFA(totalCollected)}
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">En attente</span>
                    <span className="text-base sm:text-lg font-black text-amber-400 mt-1 block">
                      {pendingCount} loyer{pendingCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Biens Gérés</span>
                    <span className="text-base sm:text-lg font-black text-white mt-1 block">
                      {properties.filter((p) => p.ownerId === currentUser.id).length}
                    </span>
                  </div>
                </div>

                {/* My Properties List */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-white">Mes Propriétés à Dakar</h3>
                  <div className="space-y-3">
                    {properties
                      .filter((p) => p.ownerId === currentUser.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-3">
                            <img src={p.photos[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              <div className="font-bold text-sm text-white">{p.title}</div>
                              <div className="text-xs text-slate-400">{p.neighborhood} • {formatFCFA(p.price)}</div>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              p.isAvailable
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {p.isAvailable ? 'Disponible' : 'Occupé (Loué)'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              /* TENANT DASHBOARD VIEW */
              <div className="space-y-5">
                <div>
                  <h2 className="font-extrabold text-lg text-white">Espace Locataire</h2>
                  <p className="text-xs text-slate-400">Bienvenue Aïssatou Sow • Suivi de votre bail à Mermoz</p>
                </div>

                {/* Rented Property Summary Card */}
                {leases[0] && (
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-2.5 py-1 rounded-full">
                          Bail Actif • Quartier Mermoz
                        </span>
                        <h3 className="font-extrabold text-base text-white mt-2">
                          {leases[0].propertyTitle}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-xs block">Loyer Mensuel</span>
                        <span className="text-xl font-black text-emerald-400">
                          {formatFCFA(leases[0].monthlyRent)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-400 block">Bailleur</span>
                        <span className="font-bold text-white">{leases[0].landlordName}</span>
                        <span className="text-[11px] text-slate-500 block">{leases[0].landlordPhone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Prochaine Échéance</span>
                        <span className="font-bold text-amber-400">5 Septembre 2026</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveLeaseModal(leases[0])}
                        className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center space-x-1"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Mon Contrat (PDF)</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('payments')}
                        className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Payer mon Loyer</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Tab Navigation */}
      <BottomNav />

      {/* ALL INTERACTIVE MODALS */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onOpenMessage={(p) => {
          setActiveChatPropertyId(p.id);
          setActiveTab('messages');
        }}
        onCreateLease={(p) => {
          createLease({
            propertyId: p.id,
            propertyTitle: p.title,
            propertyRegion: p.region,
            propertyNeighborhood: p.neighborhood,
            landlordId: currentUser.id,
            landlordName: currentUser.name,
            landlordPhone: currentUser.phone,
            tenantId: 'usr_tenant_aissatou',
            tenantName: 'Aïssatou Sow',
            tenantPhone: '+221 78 312 45 67',
            monthlyRent: p.price,
            securityDeposit: p.price * 2,
            startDate: '2026-09-01',
            durationMonths: 12,
          });
          alert('Bail généré pour cette propriété !');
        }}
      />

      <CreatePropertyModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <LeaseModal lease={activeLeaseModal} onClose={() => setActiveLeaseModal(null)} />

      <InventoryModal report={activeInventoryModal} onClose={() => setActiveInventoryModal(null)} />

      <WavePaymentModal
        payment={wavePayment}
        onClose={() => setWavePayment(null)}
        onSuccess={(pay) => {
          setActiveReceiptModal(pay);
          setActiveTab('payments');
        }}
      />

      <OrangeMoneyPaymentModal
        payment={omPayment}
        onClose={() => setOmPayment(null)}
        onSuccess={(pay) => {
          setActiveReceiptModal(pay);
          setActiveTab('payments');
        }}
      />

      <ReceiptModal payment={activeReceiptModal} onClose={() => setActiveReceiptModal(null)} />

      <ProfileVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
}
