'use client';

import React from 'react';
import { Payment } from '../types';
import { formatFCFA, printReceiptPDF } from '../lib/pdfGenerator';
import { X, Download, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-extrabold text-base text-white">Quittance Numérique de Loyer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Main Amount Card */}
          <div className="bg-emerald-950/60 border border-emerald-800 rounded-2xl p-5 text-center space-y-1">
            <span className="text-xs text-emerald-300 font-semibold uppercase">
              Montant payé pour {payment.periodMonth}
            </span>
            <div className="text-3xl font-black text-emerald-400">{formatFCFA(payment.amount)}</div>
            <div className="inline-flex items-center space-x-1 text-[11px] text-emerald-300 bg-emerald-900/60 px-2.5 py-0.5 rounded-full mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Quittance de loyer libératoire payée</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Locataire</span>
              <span className="font-bold text-white">{payment.tenantName}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Bien concerné</span>
              <span className="font-bold text-white text-right max-w-[200px] truncate">
                {payment.propertyTitle}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Mode de paiement</span>
              <span className="font-bold text-sky-400">
                {payment.method === 'WAVE' ? '🌊 Wave Sénégal' : '🍊 Orange Money'}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Réf. Transaction</span>
              <span className="font-mono text-slate-200">{payment.transactionId || payment.id}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Date d'encaissement</span>
              <span className="text-slate-300">
                {payment.paidDate ? new Date(payment.paidDate).toLocaleString('fr-FR') : 'N/A'}
              </span>
            </div>
          </div>

          <button
            onClick={() => printReceiptPDF(payment)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger la Quittance PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
