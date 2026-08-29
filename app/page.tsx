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
import { DeletePropertyModal } from '../components/DeletePropertyModal';
import { CreatePaymentModal } from '../components/CreatePaymentModal';
import { ManualPaymentModal } from '../components/ManualPaymentModal';
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
  Pencil,
  Trash2,
  DollarSign,
  Filter,
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
    updateProperty,
    deleteProperty,
    sendRentReminder,
    addPayment,
    markPaymentAsPaid,
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
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [activeLeaseModal, setActiveLeaseModal] = useState<Lease | null>(null);
  const [activeInventoryModal, setActiveInventoryModal] = useState<InventoryReport | null>(null);
  const [wavePayment, setWavePayment] = useState<Payment | null>(null);
  const [omPayment, setOmPayment] = useState<Payment | null>(null);
  const [manualPayment, setManualPayment] = useState<Payment | null>(null);
  const [isCreatePaymentOpen, setIsCreatePaymentOpen] = useState(false);
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
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
        {/* TAB 4: PAIEMENT & GESTION INTEGRALE DES LOYERS */}
        {/* ==================================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {currentRole === 'LANDLORD' ? (
              /* LANDLORD RENT MANAGEMENT VIEW */
              <div className="space-y-6">
                {/* Landlord Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Espace Bailleur
                      </span>
                    </div>
                    <h2 className="font-extrabold text-lg text-white flex items-center space-x-2 mt-1">
                      <CreditCard className="w-5.5 h-5.5 text-emerald-400" />
                      <span>Gestion des Loyers & Encaissements</span>
                    </h2>
                    <p className="text-xs text-slate-400">Suivi du patrimoine, émission d'appels de loyer et quittances numériques</p>
                  </div>

                  <button
                    onClick={() => setIsCreatePaymentOpen(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Émettre un appel de loyer</span>
                  </button>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Encaissé</span>
                    <span className="text-base sm:text-lg font-black text-emerald-400 mt-1 block">
                      {formatFCFA(
                        payments
                          .filter((p) => p.status === 'PAID')
                          .reduce((sum, p) => sum + p.amount, 0)
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">En Attente</span>
                    <span className="text-base sm:text-lg font-black text-amber-400 mt-1 block">
                      {formatFCFA(
                        payments
                          .filter((p) => p.status === 'PENDING')
                          .reduce((sum, p) => sum + p.amount, 0)
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Appels Émis</span>
                    <span className="text-base sm:text-lg font-black text-white mt-1 block">
                      {payments.length} quittances
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Taux Recouvrement</span>
                    <span className="text-base sm:text-lg font-black text-teal-400 mt-1 block">
                      {payments.length > 0
                        ? Math.round(
                            (payments.filter((p) => p.status === 'PAID').length / payments.length) * 100
                          )
                        : 100}
                      %
                    </span>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <div className="flex space-x-1.5 w-full sm:w-auto">
                    <button
                      onClick={() => setPaymentFilterStatus('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        paymentFilterStatus === 'ALL'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      Tous ({payments.length})
                    </button>
                    <button
                      onClick={() => setPaymentFilterStatus('PENDING')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        paymentFilterStatus === 'PENDING'
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      En attente ⏳ ({payments.filter((p) => p.status === 'PENDING').length})
                    </button>
                    <button
                      onClick={() => setPaymentFilterStatus('PAID')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        paymentFilterStatus === 'PAID'
                          ? 'bg-emerald-700 text-white shadow'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      Payés ✓ ({payments.filter((p) => p.status === 'PAID').length})
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Rechercher locataire, bien..."
                      value={paymentSearchQuery}
                      onChange={(e) => setPaymentSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Payments List for Landlord */}
                <div className="space-y-3">
                  {payments
                    .filter((pay) => {
                      const matchesFilter =
                        paymentFilterStatus === 'ALL' || pay.status === paymentFilterStatus;
                      const matchesSearch =
                        pay.propertyTitle.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
                        pay.tenantName.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
                        pay.periodMonth.toLowerCase().includes(paymentSearchQuery.toLowerCase());
                      return matchesFilter && matchesSearch;
                    })
                    .map((pay) => (
                      <div
                        key={pay.id}
                        className={`bg-slate-900 border rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow transition-all ${
                          pay.status === 'PAID'
                            ? 'border-emerald-800/60 bg-emerald-950/10'
                            : 'border-amber-800/60 bg-amber-950/10'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-extrabold text-white text-base">
                              {formatFCFA(pay.amount)}
                            </span>
                            <span className="text-xs text-slate-300 font-semibold">• Loyer {pay.periodMonth}</span>
                            {pay.status === 'PAID' ? (
                              <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-800 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Encaissé</span>
                              </span>
                            ) : (
                              <span className="bg-amber-950 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-800">
                                ⏳ En attente locataire (Échéance : {pay.dueDate})
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-300 mt-1 font-medium">
                            {pay.propertyTitle} — Locataire: <strong>{pay.tenantName}</strong>
                          </div>

                          {pay.paidDate && (
                            <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                              <span>
                                Encaissement le {new Date(pay.paidDate).toLocaleString('fr-FR')} via{' '}
                                <strong className="text-emerald-400">
                                  {pay.method === 'WAVE' ? 'Wave Sénégal' :
                                   pay.method === 'ORANGE_MONEY' ? 'Orange Money' :
                                   pay.method === 'CASH' ? 'Espèces (Cash)' :
                                   pay.method === 'BANK_TRANSFER' ? 'Virement Bancaire' :
                                   pay.method === 'CHEQUE' ? 'Chèque Bancaire' : pay.method}
                                </strong>
                              </span>
                              {pay.transactionId && (
                                <span className="font-mono text-slate-500">({pay.transactionId})</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
                          {pay.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => setManualPayment(pay)}
                                className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-1"
                                title="Enregistrer un versement en espèces ou virement"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Enregistrer Encaissement</span>
                              </button>
                              <button
                                onClick={() => sendRentReminder(pay.id)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700 transition-colors flex items-center justify-center"
                                title="Envoyer une relance par SMS au locataire"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setActiveReceiptModal(pay)}
                              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 shadow flex items-center justify-center space-x-1.5 transition-colors"
                            >
                              <Download className="w-4 h-4 text-emerald-400" />
                              <span>Quittance PDF</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              /* TENANT RENT & LEASE VIEW */
              <div className="space-y-6">
                {/* Tenant Header */}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-teal-950 text-teal-400 border border-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Espace Locataire
                    </span>
                  </div>
                  <h2 className="font-extrabold text-lg text-white flex items-center space-x-2 mt-1">
                    <CreditCard className="w-5.5 h-5.5 text-teal-400" />
                    <span>Mon Bail & Mes Loyers</span>
                  </h2>
                  <p className="text-xs text-slate-400">Consultation de votre contrat de bail digital, paiement du loyer et quittances</p>
                </div>

                {/* Mon Bail Card (Embedded Lease Content for Tenant) */}
                {leases[0] && (
                  <div className="bg-gradient-to-br from-teal-950/80 via-slate-900 to-emerald-950/80 border border-teal-800/80 rounded-3xl p-5 space-y-4 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                            Bail Actif • {leases[0].propertyNeighborhood || 'Mermoz'}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">
                            Réf: {leases[0].id}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-white mt-2">
                          {leases[0].propertyTitle}
                        </h3>
                        <p className="text-xs text-teal-300 font-medium mt-0.5">
                          Bailleur: <strong>{leases[0].landlordName}</strong> ({leases[0].landlordPhone})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 text-xs block">Loyer Mensuel</span>
                        <span className="text-xl sm:text-2xl font-black text-emerald-400">
                          {formatFCFA(leases[0].monthlyRent)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Dépôt de Garantie</span>
                        <span className="font-bold text-white">{formatFCFA(leases[0].securityDeposit)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Prise d'effet</span>
                        <span className="font-bold text-slate-200">
                          {new Date(leases[0].startDate).toLocaleDateString('fr-FR')} ({leases[0].durationMonths} mois)
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-400 block text-[11px]">Quittances Réglées</span>
                        <span className="font-bold text-emerald-400">
                          {payments.filter((p) => p.status === 'PAID').length} mois payés
                        </span>
                      </div>
                    </div>

                    {/* Lease & Inventory Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <button
                        onClick={() => setActiveLeaseModal(leases[0])}
                        className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Consulter & Signer mon Bail (PDF)</span>
                      </button>

                      {inventoryReports.length > 0 && (
                        <button
                          onClick={() => setActiveInventoryModal(inventoryReports[0])}
                          className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 shadow transition-all flex items-center justify-center space-x-2"
                        >
                          <Layers className="w-4 h-4 text-emerald-400" />
                          <span>Voir mon État des Lieux</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tenant Payments List */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-white">Historique de vos Échéances de Loyer</h3>
                  {payments.map((pay) => (
                    <div
                      key={pay.id}
                      className={`bg-slate-900 border rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow ${
                        pay.status === 'PAID'
                          ? 'border-emerald-800/60 bg-emerald-950/10'
                          : 'border-amber-800/60 bg-amber-950/10 animate-pulse'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-white text-base">
                            {formatFCFA(pay.amount)}
                          </span>
                          <span className="text-xs text-slate-300 font-semibold">• Loyer {pay.periodMonth}</span>
                          {pay.status === 'PAID' ? (
                            <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-800 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Réglé</span>
                            </span>
                          ) : (
                            <span className="bg-amber-950 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-800">
                              ⏳ En attente de votre règlement (Échéance : {pay.dueDate})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-300 mt-1 font-medium">{pay.propertyTitle}</div>
                        {pay.paidDate && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Paiement effectué le {new Date(pay.paidDate).toLocaleString('fr-FR')} via{' '}
                            <strong className="text-emerald-400">
                              {pay.method === 'WAVE' ? 'Wave Sénégal' :
                               pay.method === 'ORANGE_MONEY' ? 'Orange Money' :
                               pay.method === 'CASH' ? 'Espèces' : pay.method}
                            </strong> ({pay.transactionId})
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
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
                            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 shadow flex items-center justify-center space-x-1.5 transition-colors"
                          >
                            <Download className="w-4 h-4 text-emerald-400" />
                            <span>Télécharger Quittance</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-white">Mes Propriétés à Dakar</h3>
                    <button
                      onClick={() => {
                        setEditingProperty(null);
                        setIsCreateOpen(true);
                      }}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter un bien</span>
                    </button>
                  </div>

                  {properties.filter((p) => p.ownerId === currentUser.id).length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                      <p className="text-xs text-slate-400">Vous n'avez aucune propriété enregistrée.</p>
                      <button
                        onClick={() => {
                          setEditingProperty(null);
                          setIsCreateOpen(true);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all inline-flex items-center space-x-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Publier ma première propriété</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {properties
                        .filter((p) => p.ownerId === currentUser.id)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedProperty(p)}>
                              <img src={p.photos[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                              <div>
                                <div className="font-bold text-sm text-white hover:text-emerald-400 transition-colors">{p.title}</div>
                                <div className="text-xs text-slate-400">{p.neighborhood} • {formatFCFA(p.price)}</div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 self-end sm:self-auto">
                              {/* Status Toggle Badge */}
                              <button
                                onClick={() => updateProperty(p.id, { isAvailable: !p.isAvailable })}
                                className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                                  p.isAvailable
                                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                                }`}
                                title="Cliquer pour changer la disponibilité"
                              >
                                {p.isAvailable ? 'Disponible' : 'Occupé (Loué)'}
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => setEditingProperty(p)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center space-x-1 text-xs font-medium"
                                title="Modifier cette propriété"
                              >
                                <Pencil className="w-3.5 h-3.5 text-blue-400" />
                                <span className="hidden sm:inline">Modifier</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => setDeletingProperty(p)}
                                className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl border border-rose-800/60 transition-colors flex items-center space-x-1 text-xs font-medium"
                                title="Supprimer cette propriété"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                <span className="hidden sm:inline">Supprimer</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
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
        onEditProperty={(p) => setEditingProperty(p)}
        onDeleteProperty={(p) => setDeletingProperty(p)}
      />

      <CreatePropertyModal
        isOpen={isCreateOpen || editingProperty !== null}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingProperty(null);
        }}
        propertyToEdit={editingProperty}
      />

      <DeletePropertyModal
        property={deletingProperty}
        isOpen={deletingProperty !== null}
        onClose={() => setDeletingProperty(null)}
        onConfirm={(propertyId) => {
          deleteProperty(propertyId);
          setDeletingProperty(null);
        }}
      />

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

      <CreatePaymentModal
        isOpen={isCreatePaymentOpen}
        onClose={() => setIsCreatePaymentOpen(false)}
      />

      <ManualPaymentModal
        payment={manualPayment}
        isOpen={manualPayment !== null}
        onClose={() => setManualPayment(null)}
        onSuccess={(pay) => setActiveReceiptModal(pay)}
      />

      <ProfileVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
}
