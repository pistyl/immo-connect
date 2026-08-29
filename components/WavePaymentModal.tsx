'use client';

import React, { useState } from 'react';
import { Payment } from '../types';
import { formatFCFA } from '../lib/pdfGenerator';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

interface WavePaymentModalProps {
  payment: Payment | null;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

export const WavePaymentModal: React.FC<WavePaymentModalProps> = ({
  payment,
  onClose,
  onSuccess,
}) => {
  const { payRent, currentUser } = useApp();
  const [phone, setPhone] = useState(currentUser.phone);
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'PROCESSING' | 'SUCCESS'>('PHONE');
  const [otp, setOtp] = useState('');
  const [processedPayment, setProcessedPayment] = useState<Payment | null>(null);

  if (!payment) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('OTP');
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('PROCESSING');
    try {
      const res = await payRent(payment.id, 'WAVE', phone);
      setProcessedPayment(res);
      setStep('SUCCESS');
    } catch (err) {
      alert('Échec de la transaction Wave. Veuillez réessayer.');
      setStep('PHONE');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-sky-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col">
        {/* Header - Wave Branding */}
        <div className="bg-gradient-to-r from-sky-600 via-teal-600 to-sky-700 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-950/80 border border-sky-400/40 flex items-center justify-center text-xl font-bold">
              🌊
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight">Wave Digital Finance</h2>
              <p className="text-xs text-sky-100 font-medium">Paiement Sécurisé du Loyer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-sky-950/40 hover:bg-sky-950/80 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Summary Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">
              Loyer {payment.periodMonth}
            </span>
            <div className="text-3xl font-black text-sky-400 tracking-tight">
              {formatFCFA(payment.amount)}
            </div>
            <p className="text-xs text-slate-300 font-medium">{payment.propertyTitle}</p>
          </div>

          {step === 'PHONE' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Numéro Téléphone Wave Sénégal (+221)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>Continuer avec Wave</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'OTP' && (
            <form onSubmit={handleConfirmPay} className="space-y-4 animate-in fade-in">
              <div className="bg-sky-950/60 border border-sky-800/80 rounded-xl p-3 text-xs text-sky-200">
                Un SMS Wave avec un code de confirmation à 4 chiffres a été envoyé au{' '}
                <strong className="font-mono text-white">{phone}</strong>.
                <div className="text-[11px] text-sky-400 mt-1">Code de test instantané : 1234</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Code d'autorisation Wave
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="1234"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-lg font-mono text-white tracking-widest focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>Valider le Paiement Wave</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'PROCESSING' && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-white">Validation Wave API en cours...</h3>
              <p className="text-xs text-slate-400">Communication avec les serveurs Wave Sénégal</p>
            </div>
          )}

          {step === 'SUCCESS' && processedPayment && (
            <div className="py-4 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-sky-950 text-sky-400 border border-sky-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Paiement Réussi via Wave !</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Réf: {processedPayment.transactionId}
                </p>
              </div>

              <button
                onClick={() => {
                  onSuccess(processedPayment);
                  onClose();
                }}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Voir la Quittance / Télécharger le Reçu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
