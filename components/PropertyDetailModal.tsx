'use client';

import React, { useState } from 'react';
import { Property } from '../types';
import { formatFCFA } from '../lib/pdfGenerator';
import { useApp } from '../context/AppContext';
import {
  X,
  MapPin,
  ShieldCheck,
  Bed,
  CheckCircle,
  MessageSquare,
  FileSignature,
  Building,
  Phone,
  AlertTriangle,
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onOpenMessage: (property: Property) => void;
  onCreateLease: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onOpenMessage,
  onCreateLease,
}) => {
  const { currentRole } = useApp();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2 truncate">
            <span className="bg-emerald-950 text-emerald-400 font-bold text-xs px-2.5 py-1 rounded-lg border border-emerald-800">
              Région {property.region} • {property.neighborhood}
            </span>
            <span className="text-xs text-slate-400 capitalize">{property.type.toLowerCase()}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Photo Gallery */}
          <div className="space-y-2">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-800 border border-slate-800">
              <img
                src={property.photos[selectedPhotoIndex] || property.photos[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-white">
                Photo {selectedPhotoIndex + 1} / {property.photos.length}
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {property.photos.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {property.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedPhotoIndex === idx
                        ? 'border-emerald-400 scale-105'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">{property.title}</h2>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{property.neighborhood}, Dakar, Sénégal</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl font-black text-emerald-400">{formatFCFA(property.price)}</div>
              <div className="text-[11px] text-slate-400">
                {property.chargesIncluded ? 'Charges eau & électricité incluses' : 'Hors charges'}
              </div>
            </div>
          </div>

          {/* Location Safety Alert */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-400">Protection des données : </span>
              <span>
                {property.approxLocation}. L'adresse exacte et le numéro d'appartement sont transmis au locataire après validation du contrat de bail.
              </span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 mb-1">Nombre de pièces</div>
              <div className="font-bold text-base text-white flex items-center justify-center space-x-1">
                <Bed className="w-4 h-4 text-emerald-400" />
                <span>{property.rooms} pièce{property.rooms > 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 mb-1">Type de bien</div>
              <div className="font-bold text-base text-white capitalize">{property.type.toLowerCase()}</div>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 mb-1">Statut</div>
              <div className="font-bold text-base text-emerald-400">
                {property.isAvailable ? 'Disponible' : 'Loué'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-200">Description du logement</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Landlord Identity verification Box */}
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 font-bold text-base">
                {property.ownerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-white">{property.ownerName}</span>
                  {property.ownerVerified && (
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Propriétaire Vérifié</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{property.ownerPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenMessage(property);
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 border border-slate-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Envoyer un message</span>
          </button>

          {currentRole === 'LANDLORD' ? (
            <button
              onClick={() => {
                onClose();
                onCreateLease(property);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all"
            >
              <FileSignature className="w-4 h-4" />
              <span>Générer un bail</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenMessage(property);
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all"
            >
              <Building className="w-4 h-4" />
              <span>Demander la location</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
