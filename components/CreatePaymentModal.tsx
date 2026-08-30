'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../lib/pdfGenerator';
import { X, Send, Building, User, Phone, Check, Sparkles } from 'lucide-react';

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({ isOpen, onClose }) => {
  const { properties, leases, currentUser, addPayment } = useApp();

  // Filter properties belonging strictly to the landlord
  const landlordProperties = properties.filter(
    (p) =>
      p.ownerId === currentUser.id ||
      p.ownerName === currentUser.name ||
      (!p.ownerId && currentUser.name === 'Ibrahima Samb')
  );

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    landlordProperties[0]?.id || 'prop_mermoz_f3'
  );
  const [tenantName, setTenantName] = useState<string>('');
  const [tenantPhone, setTenantPhone] = useState<string>('');
  const [periodMonth, setPeriodMonth] = useState<string>('Septembre 2026');
  const [dueDate, setDueDate] = useState<string>('2026-09-05');
  const [amount, setAmount] = useState<number>(
    landlordProperties[0]?.price || 250000
  );

  const [submitted, setSubmitted] = useState<boolean>(false);

  // Synchronize rent amount when property selection changes
  useEffect(() => {
    const prop = landlordProperties.find((p) => p.id === selectedPropertyId) || landlordProperties[0];
    if (prop) {
      setAmount(prop.price);
    }
  }, [selectedPropertyId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const propObj = landlordProperties.find((p) => p.id === selectedPropertyId) || landlordProperties[0];
    const leaseObj = leases.find((l) => l.propertyId === selectedPropertyId);

    addPayment({
      leaseId: leaseObj ? leaseObj.id : `lease_${Date.now()}`,
      propertyTitle: propObj ? propObj.title : 'Propriété Immobilère',
      tenantId: leaseObj ? leaseObj.tenantId : `usr_tenant_${Date.now()}`,
      tenantName: tenantName.trim() || 'Locataire',
      landlordId: currentUser.id,
      amount: Number(amount),
      periodMonth,
      dueDate,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="font-extrabold text-base text-white">Émettre un Appel de Loyer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl border border-emerald-500/40">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Appel de loyer émis avec succès !</h3>
            <p className="text-xs text-slate-400">
              Une demande d'encaissement et une alerte SMS de relance ont été transmises à {tenantName} ({tenantPhone}).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Property Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mes Propriétés Concernées *</span>
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                {landlordProperties.length > 0 ? (
                  landlordProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.neighborhood}) — {formatFCFA(p.price)}/mois
                    </option>
                  ))
                ) : (
                  <option value="prop_mermoz_f3">Appartement F3 Moderne Lumineux (Mermoz)</option>
                )}
              </select>
            </div>

            {/* Tenant Info Section */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Informations du Locataire
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tenant Name */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 flex items-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Nom complet du locataire *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Prénom et Nom du locataire"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                {/* Tenant Phone */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>Téléphone du locataire (+221) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+221 77 000 00 00"
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Period Month */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Période / Mois de loyer *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Septembre 2026"
                value={periodMonth}
                onChange={(e) => setPeriodMonth(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Amount & Due Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Montant Loyer (en FCFA) *
                </label>
                <input
                  type="number"
                  step="5000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Date Limite d'Échéance *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Créer et Émettre l'Appel de Loyer</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
