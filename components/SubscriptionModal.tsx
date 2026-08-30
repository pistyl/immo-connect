'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../lib/pdfGenerator';
import { SubscriptionPlan } from '../types';
import {
  X,
  Crown,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Building,
  Phone,
  Check,
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPropertyCount?: number;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentPropertyCount = 5,
}) => {
  const { currentUser, upgradeSubscription } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('ANNUAL');
  const [paymentMethod, setPaymentMethod] = useState<'WAVE' | 'ORANGE_MONEY'>('WAVE');
  const [phoneNumber, setPhoneNumber] = useState<string>(currentUser.phone || '+221 77 000 00 00');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'MONTHLY' as SubscriptionPlan,
      name: 'Plan Mensuel',
      duration: '1 Mois',
      price: 10000,
      savings: null,
      badge: null,
    },
    {
      id: 'QUARTERLY' as SubscriptionPlan,
      name: 'Plan Trimestriel',
      duration: '3 Mois',
      price: 25000,
      savings: 'Économisez 5 000 FCFA',
      badge: 'Économique',
    },
    {
      id: 'ANNUAL' as SubscriptionPlan,
      name: 'Plan Annuel',
      duration: '1 An (12 Mois)',
      price: 80000,
      savings: 'Économisez 40 000 FCFA',
      badge: 'Meilleure Offre ⭐',
    },
  ];

  const currentSelectedObj = plans.find((p) => p.id === selectedPlan) || plans[2];

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      upgradeSubscription(selectedPlan);
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <Crown className="w-40 h-40" />
          </div>

          <div className="relative z-10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-200 border border-white/30">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="font-black text-lg text-white">Abonnement Bailleur Pro</h2>
                <span className="bg-white/20 text-white font-bold text-[10px] px-2 py-0.5 rounded-full border border-white/30 uppercase tracking-wider">
                  Illimité
                </span>
              </div>
              <p className="text-xs text-amber-100">
                Débloquez la publication illimitée au-delà de 5 biens
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reached Limit Banner Notice */}
        {currentPropertyCount >= 5 && currentUser.subscriptionStatus !== 'PRO' && (
          <div className="bg-amber-950/90 border-b border-amber-800/80 px-4 py-2.5 text-xs text-amber-200 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Vous avez atteint la limite gratuite de <strong>5 biens publiés</strong>. Choisissez un plan pour publier sans restriction.
            </span>
          </div>
        )}

        {isSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-3xl border border-amber-500/50 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">Félicitations ! Compte Pro Activé</h3>
            <p className="text-xs text-slate-300">
              Votre abonnement <strong>{currentSelectedObj.name}</strong> a été validé par {paymentMethod}.
              Vous pouvez maintenant publier un nombre illimité de biens.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubscribeSubmit} className="p-5 space-y-4 text-xs">
            {/* SaaS Features Highlight */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-300">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Publication de biens <strong>Illimitée</strong></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Relances SMS automatiques</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Quittances & Baux PDF certifiés</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Support prioritaire Sénégal</span>
              </div>
            </div>

            {/* Plans Selector Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Choisissez votre Formule d'Abonnement *
              </label>

              <div className="space-y-2">
                {plans.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-amber-400 bg-amber-500' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-sm text-white">{plan.name}</span>
                            {plan.badge && (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{plan.duration}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-base text-amber-400 block">
                          {formatFCFA(plan.price)}
                        </span>
                        {plan.savings && (
                          <span className="text-[10px] text-emerald-400 font-semibold block">
                            {plan.savings}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Money Payment Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300">
                Mode de Règlement Mobile Money *
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('WAVE')}
                  className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                    paymentMethod === 'WAVE'
                      ? 'bg-sky-950/80 border-sky-500 text-sky-300 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>🌊 Wave Sénégal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('ORANGE_MONEY')}
                  className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                    paymentMethod === 'ORANGE_MONEY'
                      ? 'bg-orange-950/80 border-orange-500 text-orange-300 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>🍊 Orange Money</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>Numéro de compte Mobile Money (+221) *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Validation du paiement par {paymentMethod}...</span>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>
                      Payer {formatFCFA(currentSelectedObj.price)} & Activer le Compte Pro
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
