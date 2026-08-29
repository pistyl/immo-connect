'use client';

import React from 'react';
import { Property } from '../types';
import { formatFCFA } from '../lib/pdfGenerator';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeletePropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (propertyId: string) => void;
}

export const DeletePropertyModal: React.FC<DeletePropertyModalProps> = ({
  property,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100 p-6 space-y-5">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400">
            <Trash2 className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-white">Supprimer cette propriété ?</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Êtes-vous sûr de vouloir supprimer l'annonce{' '}
            <strong className="text-white">{property.title}</strong> ({property.neighborhood} • {formatFCFA(property.price)}) ?
          </p>
        </div>

        <div className="bg-rose-950/30 border border-rose-900/40 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>Cette action est irréversible. La propriété sera définitivement retirée d'ImmoConnect.</span>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(property.id);
              onClose();
            }}
            className="w-1/2 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Oui, Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
