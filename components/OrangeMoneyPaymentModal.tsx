'use client';

import React, { useState } from 'react';
import { Payment } from '../types';
import { formatFCFA } from '../lib/pdfGenerator';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, ShieldCheck, Loader2, Smartphone } from 'lucide-react';

interface OrangeMoneyPaymentModalProps {
  payment: Payment | null;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

export const OrangeMoneyPaymentModal: React.FC<OrangeMoneyPaymentModalProps> = ({
  payment,
  onClose,
  onSuccess,
}) => {
  const { payRent, currentUser } = useApp();
  const [phone, setPhone] = useState(currentUser.phone);
  const [step, setStep] = useState<'PHONE' | 'USSD' | 'PROCESSING' | 'SUCCESS'>('PHONE');
  const [codePin, setCodePin] = useState('');
  const [processedPayment, setProcessedPayment] = useState<Payment | null>(null);

  if (!payment) return null;

  const handleSendUssd = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('USSD');
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('PROCESSING');
    try {
      const res = await payRent(payment.id, 'ORANGE_MONEY', phone);
      setProcessedPayment(res);
      setStep('SUCCESS');
    } catch (err) {
      alert('Échec de la transaction Orange Money. Veuillez réessayer.');
      setStep('PHONE');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-orange-950 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col">
        {/* Header - Orange Money Branding */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-black border border-orange-400/40 flex items-center justify-center text-xl font-bold">
              🍊
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight text-black">Orange Money Sénégal</h2>
              <p className="text-xs text-orange-950 font-semibold">Service de Paiement Marchand</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Summary Box */}
          <div className="bg-black border border-neutral-800 rounded-2xl p-4 text-center space-y-1">
            <span className="text-xs text-neutral-400 uppercase font-semibold">
              Loyer {payment.periodMonth}
            </span>
            <div className="text-3xl font-black text-orange-500 tracking-tight">
              {formatFCFA(payment.amount)}
            </div>
            <p className="text-xs text-neutral-300 font-medium">{payment.propertyTitle}</p>
          </div>

          {step === 'PHONE' && (
            <form onSubmit={handleSendUssd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Numéro Orange Money (+221 77/78)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Payer par USSD #144#</span>
              </button>
            </form>
          )}

          {step === 'USSD' && (
            <form onSubmit={handleConfirmPay} className="space-y-4 animate-in fade-in">
              <div className="bg-orange-950/40 border border-orange-800/60 rounded-xl p-3 text-xs text-orange-200">
                Une notification USSD a été envoyée sur votre mobile.
                Entrez votre code secret Orange Money à 4 chiffres pour valider.
                <div className="text-[11px] text-orange-400 mt-1">Code de test : 0000</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Code Secret Orange Money
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="••••"
                  value={codePin}
                  onChange={(e) => setCodePin(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-center text-lg font-mono text-white tracking-widest focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>Confirmer le Débit Orange Money</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'PROCESSING' && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-white">Traitement Orange Money API...</h3>
              <p className="text-xs text-neutral-400">Communication sécurisée avec Sonatel Orange</p>
            </div>
          )}

          {step === 'SUCCESS' && processedPayment && (
            <div className="py-4 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-orange-950 text-orange-400 border border-orange-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Paiement Orange Money Réussi !</h3>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Transaction: {processedPayment.transactionId}
                </p>
              </div>

              <button
                onClick={() => {
                  onSuccess(processedPayment);
                  onClose();
                }}
                className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs rounded-xl shadow-lg transition-all"
              >
                Télécharger le Reçu Numérique
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
