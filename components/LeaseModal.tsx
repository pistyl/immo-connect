'use client';

import React, { useState } from 'react';
import { Lease } from '../types';
import { formatFCFA, printLeasePDF } from '../lib/pdfGenerator';
import { useApp } from '../context/AppContext';
import { X, FileText, CheckCircle2, Download, ShieldCheck, Clock } from 'lucide-react';

interface LeaseModalProps {
  lease: Lease | null;
  onClose: () => void;
}

export const LeaseModal: React.FC<LeaseModalProps> = ({ lease, onClose }) => {
  const { currentRole, currentUser, signLease } = useApp();
  const [agreed, setAgreed] = useState(false);

  if (!lease) return null;

  const userHasSigned =
    currentRole === 'LANDLORD'
      ? lease.landlordSignature.signed
      : lease.tenantSignature.signed;

  const handleSign = () => {
    if (!agreed) {
      alert('Veuillez cocher la case d\'acceptation des termes du contrat de bail.');
      return;
    }
    signLease(lease.id, currentRole, currentUser.name);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-extrabold text-base text-white">Contrat de Bail Digital (Sénégal)</h2>
              <p className="text-[11px] text-slate-400">Réf: {lease.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Status Badge & Actions */}
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-400">Statut du contrat : </span>
              {lease.status === 'ACTIVE' ? (
                <span className="bg-emerald-950 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-800">
                  ✓ Signé & Actif
                </span>
              ) : (
                <span className="bg-amber-950 text-amber-400 font-bold px-2.5 py-1 rounded-full border border-amber-800">
                  En attente de signature
                </span>
              )}
            </div>

            <button
              onClick={() => printLeasePDF(lease)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exporter PDF</span>
            </button>
          </div>

          {/* Contract Content Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 font-sans text-slate-300 leading-relaxed">
            <h3 className="text-center text-sm font-extrabold text-white uppercase border-b border-slate-800 pb-2">
              Contrat de Bail à Usage d'Habitation
            </h3>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="font-bold text-emerald-400 block mb-1">BAILLEUR (Propriétaire)</span>
                <p className="font-semibold text-white">{lease.landlordName}</p>
                <p className="text-slate-400 text-[11px]">{lease.landlordPhone}</p>
              </div>
              <div>
                <span className="font-bold text-emerald-400 block mb-1">PRENEUR (Locataire)</span>
                <p className="font-semibold text-white">{lease.tenantName}</p>
                <p className="text-slate-400 text-[11px]">{lease.tenantPhone}</p>
              </div>
            </div>

            {/* Property details */}
            <div className="space-y-1 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
              <span className="font-bold text-slate-200">Désignation des locaux :</span>
              <p className="text-white font-medium">{lease.propertyTitle}</p>
              <p className="text-slate-400">Situé à Dakar, Quartier {lease.propertyNeighborhood}</p>
            </div>

            {/* Terms */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 block">Loyer mensuel</span>
                <span className="text-base font-bold text-emerald-400">{formatFCFA(lease.monthlyRent)}</span>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 block">Dépôt de garantie</span>
                <span className="text-base font-bold text-white">{formatFCFA(lease.securityDeposit)}</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400">
              <p>• Date de prise d'effet : <strong>{new Date(lease.startDate).toLocaleDateString('fr-FR')}</strong></p>
              <p>• Durée du bail : <strong>{lease.durationMonths} mois</strong> (Renouvelable par tacite reconduction)</p>
              <p>• Modalités de paiement : Le loyer est payable d'avance le 5 de chaque mois via Mobile Money (Wave / Orange Money).</p>
            </div>
          </div>

          {/* Signatures Status Display */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-slate-400 text-[11px] block">Signature Bailleur</span>
              <span className="font-bold text-white text-xs">{lease.landlordName}</span>
              {lease.landlordSignature.signed ? (
                <div className="mt-2 text-emerald-400 text-[11px] font-semibold flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Signé le {lease.landlordSignature.timestamp}</span>
                </div>
              ) : (
                <div className="mt-2 text-amber-400 text-[11px]">En attente</div>
              )}
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-slate-400 text-[11px] block">Signature Locataire</span>
              <span className="font-bold text-white text-xs">{lease.tenantName}</span>
              {lease.tenantSignature.signed ? (
                <div className="mt-2 text-emerald-400 text-[11px] font-semibold flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Signé le {lease.tenantSignature.timestamp}</span>
                </div>
              ) : (
                <div className="mt-2 text-amber-400 text-[11px]">En attente</div>
              )}
            </div>
          </div>

          {/* Interactive Signature Area */}
          {!userHasSigned ? (
            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-950 p-4 rounded-2xl border border-emerald-800/80 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Signature Électronique Simple ({currentRole === 'LANDLORD' ? 'Bailleur' : 'Locataire'})</span>
              </h4>

              <div className="flex items-start space-x-2 text-slate-300 text-[11px]">
                <input
                  type="checkbox"
                  id="leaseAgree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                />
                <label htmlFor="leaseAgree" className="cursor-pointer">
                  Je certifie l'exactitude des informations ci-dessus et j'appose ma signature électronique sous le nom <strong>{currentUser.name}</strong> conformément à la loi sénégalaise.
                </label>
              </div>

              <button
                onClick={handleSign}
                disabled={!agreed}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Signer le Contrat de Bail Maintenant</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-950/40 border border-emerald-800 p-3 rounded-xl text-center text-xs text-emerald-300 font-semibold">
              Vous avez déjà apposé votre signature électronique sur ce contrat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
