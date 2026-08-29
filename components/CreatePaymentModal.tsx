'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../lib/pdfGenerator';
import { X, Send, Calendar, DollarSign, Building, UserCheck, Check, Sparkles } from 'lucide-react';

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({ isOpen, onClose }) => {
  const { leases, currentUser, addPayment } = useApp();

  // Find leases belonging to the landlord
  const activeLeases = leases.filter(
    (l) => l.landlordId === currentUser.id || l.status === 'ACTIVE' || l.status === 'PENDING_SIGNATURE'
  );

  const [selectedLeaseId, setSelectedLeaseId] = useState<string>(
    activeLeases[0]?.id || 'lease_mermoz_2026'
  );
  const [periodMonth, setPeriodMonth] = useState<string>('Septembre 2026');
  const [dueDate, setDueDate] = useState<string>('2026-09-05');
  const [amount, setAmount] = useState<number>(
    activeLeases[0]?.monthlyRent || 250000
  );

  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLeaseChange = (leaseId: string) => {
    setSelectedLeaseId(leaseId);
    const leaseObj = leases.find((l) => l.id === leaseId);
    if (leaseObj) {
      setAmount(leaseObj.monthlyRent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const leaseObj = leases.find((l) => l.id === selectedLeaseId) || leases[0];

    addPayment({
      leaseId: selectedLeaseId,
      propertyTitle: leaseObj ? leaseObj.propertyTitle : 'Appartement F3 Mermoz',
      tenantId: leaseObj ? leaseObj.tenantId : 'usr_tenant_aissatou',
      tenantName: leaseObj ? leaseObj.tenantName : 'Aïssatou Sow',
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
              Un avis d'échéance et une notification SMS de relance ont été envoyés au locataire.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Lease Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contrat de Bail / Propriété *
              </label>
              <select
                value={selectedLeaseId}
                onChange={(e) => handleLeaseChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {activeLeases.length > 0 ? (
                  activeLeases.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.propertyTitle} — Locataire: {l.tenantName} ({formatFCFA(l.monthlyRent)}/mois)
                    </option>
                  ))
                ) : (
                  <option value="lease_mermoz_2026">Appartement F3 Mermoz — Aïssatou Sow (250 000 FCFA)</option>
                )}
              </select>
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

            {/* Info notice */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300">💡 Notification automatique :</span>
              <p>
                Le locataire pourra régler cet appel de loyer directement depuis son application via Wave ou Orange Money, ou vous remettre le paiement en espèces.
              </p>
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
