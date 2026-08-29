'use client';

import React, { useState } from 'react';
import { Payment, PaymentMethod } from '../types';
import { formatFCFA } from '../lib/pdfGenerator';
import { useApp } from '../context/AppContext';
import { X, CheckCircle2, DollarSign, CreditCard, FileCheck, ShieldCheck } from 'lucide-react';

interface ManualPaymentModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

export const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  payment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { markPaymentAsPaid } = useApp();

  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [reference, setReference] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen || !payment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = markPaymentAsPaid(payment.id, method, reference || undefined);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      onSuccess(updated);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="font-extrabold text-base text-white">Enregistrer un Encaissement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl border border-emerald-500/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">Paiement validé avec succès !</h3>
            <p className="text-xs text-slate-400">
              La quittance numérique libératoire a été générée.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Rent Summary Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                Loyer {payment.periodMonth}
              </span>
              <div className="text-xl font-black text-emerald-400">{formatFCFA(payment.amount)}</div>
              <div className="text-xs text-slate-300">
                {payment.propertyTitle} — Locataire: <strong>{payment.tenantName}</strong>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mode d'encaissement *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('CASH')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    method === 'CASH'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="text-[11px]">Espèces</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('BANK_TRANSFER')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    method === 'BANK_TRANSFER'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[11px]">Virement</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('CHEQUE')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    method === 'CHEQUE'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span className="text-[11px]">Chèque</span>
                </button>
              </div>
            </div>

            {/* Transaction Reference / Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Numéro de référence ou note (Optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: Reçu n°0492 / Bordereau Virement BOA"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Valider le Paiement</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
