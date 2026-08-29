'use client';

import React from 'react';
import { Property } from '../types';
import { formatFCFA } from '../lib/pdfGenerator';
import { MapPin, ShieldCheck, Bed, Sparkles, PhoneCall, ChevronRight } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onContact: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect, onContact }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between group">
      <div>
        {/* Photo Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
          <img
            src={property.photos[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Region & Neighborhood Pill */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-700/80 flex items-center space-x-1 shadow-sm">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{property.region} • {property.neighborhood}</span>
          </div>

          {/* Availability Status */}
          <div className="absolute top-3 right-3">
            {property.isAvailable ? (
              <span className="bg-emerald-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
                Disponible
              </span>
            ) : (
              <span className="bg-amber-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
                Loué
              </span>
            )}
          </div>

          {/* Price Tag Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-extrabold text-base tracking-tight">
              {formatFCFA(property.price)}
            </span>
            <span className="text-[11px] text-slate-400 font-normal"> / mois</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-100 text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors">
              {property.title}
            </h3>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <div className="flex items-center space-x-1 bg-slate-800/60 px-2 py-1 rounded">
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.rooms} pièce{property.rooms > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-800/60 px-2 py-1 rounded capitalize">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{property.type.toLowerCase()}</span>
            </div>
            {property.chargesIncluded && (
              <span className="text-[10px] text-teal-400 font-medium">Charges incl.</span>
            )}
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {property.description}
          </p>

          {/* Owner info */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span>Bailleur : <strong>{property.ownerName}</strong></span>
              {property.ownerVerified && (
                <span title="Propriétaire Vérifié avec Pièce d'Identité et Titre de Propriété">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons Footer */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <button
          onClick={() => onSelect(property)}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 transition-colors border border-slate-700"
        >
          <span>Détails</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onContact(property)}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Contacter</span>
        </button>
      </div>
    </div>
  );
};
