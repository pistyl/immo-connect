'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Upload, Check, FileCheck, Phone, User as UserIcon, X } from 'lucide-react';
import { compressImage } from '../lib/imageCompressor';

interface ProfileVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileVerificationModal: React.FC<ProfileVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, updateUserVerification } = useApp();
  const [idCardFile, setIdCardFile] = useState<string | null>(currentUser.idCardUrl || null);
  const [proofFile, setProofFile] = useState<string | null>(currentUser.proofOfOwnershipUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const compressed = await compressImage(e.target.files[0], 800, 0.75);
      setIdCardFile(compressed);
    }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const compressed = await compressImage(e.target.files[0], 800, 0.75);
      setProofFile(compressed);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardFile || !proofFile) {
      alert('Veuillez fournir la pièce d\'identité ainsi que la preuve de propriété.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      updateUserVerification(idCardFile, proofFile);
      setIsSubmitting(false);
      alert('Votre profil propriétaire est maintenant vérifié ! Le badge "Vérifié" est actif sur toutes vos annonces.');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-extrabold text-base text-white">Vérification d'Identité Propriétaire</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="bg-emerald-950/40 border border-emerald-800/80 p-3.5 rounded-2xl text-emerald-200 leading-relaxed">
            Pour rassurer les locataires et publier en toute confiance à Dakar, téléversez votre pièce d'identité officielle et une preuve de propriété (titre foncier, attestation de bail, ou facture Senelec).
          </div>

          {/* User Info Readonly */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-white">{currentUser.name}</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-400 font-mono">
              <Phone className="w-3 h-3" />
              <span>{currentUser.phone}</span>
            </div>
          </div>

          {/* CNI Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              1. Photo Pièce d'Identité (CNI Sénégalaise / Passeport) *
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-950/60">
              <input
                type="file"
                accept="image/*"
                onChange={handleIdUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {idCardFile ? (
                <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold">
                  <Check className="w-4 h-4" />
                  <span>CNI chargée avec succès</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1 text-slate-400">
                  <Upload className="w-5 h-5 text-emerald-400" />
                  <span>Prendre en photo ou choisir CNI</span>
                </div>
              )}
            </div>
          </div>

          {/* Proof of Ownership Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              2. Preuve de Propriété (Titre Foncier / Bail / Facture Senelec) *
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-950/60">
              <input
                type="file"
                accept="image/*"
                onChange={handleProofUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {proofFile ? (
                <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold">
                  <Check className="w-4 h-4" />
                  <span>Preuve de propriété chargée</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1 text-slate-400">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <span>Téléverser facture Senelec ou Titre</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Valider ma Vérification Propriétaire</span>
          </button>
        </form>
      </div>
    </div>
  );
};
