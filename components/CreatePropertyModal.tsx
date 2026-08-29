'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Property, SenegalRegion, SENEGAL_REGIONS, SENEGAL_LOCALITIES, PropertyType } from '../types';
import { compressImage } from '../lib/imageCompressor';
import { X, Upload, Check, AlertCircle, WifiOff, Sparkles, MapPin, Edit3 } from 'lucide-react';

interface CreatePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyToEdit?: Property | null;
}

export const CreatePropertyModal: React.FC<CreatePropertyModalProps> = ({
  isOpen,
  onClose,
  propertyToEdit,
}) => {
  const { addProperty, updateProperty, isOffline } = useApp();

  const [title, setTitle] = useState('');
  const [region, setRegion] = useState<SenegalRegion>('Dakar');
  const [neighborhood, setNeighborhood] = useState<string>('Mermoz');
  const [city, setCity] = useState<string>('Dakar');
  const [type, setType] = useState<PropertyType>('APPARTEMENT');
  const [rooms, setRooms] = useState<number>(3);
  const [price, setPrice] = useState<number>(250000);
  const [chargesIncluded, setChargesIncluded] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [description, setDescription] = useState('');
  const [approxLocation, setApproxLocation] = useState('');

  const [photos, setPhotos] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (propertyToEdit) {
      setTitle(propertyToEdit.title || '');
      setRegion(propertyToEdit.region || 'Dakar');
      setNeighborhood(propertyToEdit.neighborhood || 'Mermoz');
      setCity(propertyToEdit.city || 'Dakar');
      setType(propertyToEdit.type || 'APPARTEMENT');
      setRooms(propertyToEdit.rooms || 1);
      setPrice(propertyToEdit.price || 0);
      setChargesIncluded(propertyToEdit.chargesIncluded ?? true);
      setIsAvailable(propertyToEdit.isAvailable ?? true);
      setDescription(propertyToEdit.description || '');
      setApproxLocation(propertyToEdit.approxLocation || '');
      setPhotos(propertyToEdit.photos || []);
    } else {
      setTitle('');
      setRegion('Dakar');
      setNeighborhood('Mermoz');
      setCity('Dakar');
      setType('APPARTEMENT');
      setRooms(3);
      setPrice(250000);
      setChargesIncluded(true);
      setIsAvailable(true);
      setDescription('');
      setApproxLocation('');
      setPhotos([]);
    }
  }, [propertyToEdit, isOpen]);

  if (!isOpen) return null;

  const handleRegionChange = (newRegion: SenegalRegion) => {
    setRegion(newRegion);
    const localities = SENEGAL_LOCALITIES[newRegion] || [];
    setNeighborhood(localities[0] || newRegion);
    setCity(newRegion);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsCompressing(true);

    const filesArray = Array.from(e.target.files).slice(0, 8 - photos.length);
    const compressedList: string[] = [];

    for (const file of filesArray) {
      const compressed = await compressImage(file, 1000, 0.75);
      compressedList.push(compressed);
    }

    setPhotos((prev) => [...prev, ...compressedList]);
    setIsCompressing(false);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || photos.length === 0) {
      alert('Veuillez ajouter au moins une photo et remplir les champs obligatoires.');
      return;
    }

    if (propertyToEdit) {
      updateProperty(propertyToEdit.id, {
        title,
        region,
        neighborhood,
        city: city || region,
        type,
        rooms,
        price: Number(price),
        chargesIncluded,
        isAvailable,
        description,
        approxLocation: approxLocation || `Localité : ${neighborhood}, Région de ${region}`,
        photos,
      });
    } else {
      addProperty({
        title,
        region,
        neighborhood,
        city: city || region,
        type,
        rooms,
        price: Number(price),
        chargesIncluded,
        isAvailable,
        description,
        approxLocation: approxLocation || `Localité : ${neighborhood}, Région de ${region}`,
        photos,
      });
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            {propertyToEdit ? (
              <Edit3 className="w-5 h-5 text-blue-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-emerald-400" />
            )}
            <h2 className="font-extrabold text-base text-white">
              {propertyToEdit ? 'Modifier la Propriété' : 'Publier une Annonce au Sénégal'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline notice */}
        {isOffline && (
          <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 text-xs text-amber-200 flex items-center space-x-2">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Mode Hors-ligne activé : Les modifications seront enregistrées en brouillon local.</span>
          </div>
        )}

        {submitted ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl border border-emerald-500/40">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {propertyToEdit ? 'Propriété modifiée avec succès !' : 'Annonce publiée avec succès !'}
            </h3>
            <p className="text-xs text-slate-400">
              {propertyToEdit
                ? 'Les modifications ont été enregistrées et mises à jour sur la plateforme.'
                : 'Votre bien est désormais visible pour les locataires sur ImmoConnect.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
            {/* Availability Status Toggle (If Editing) */}
            {propertyToEdit && (
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-white">Statut de disponibilité</label>
                  <span className="text-[11px] text-slate-400">Indiquez si le bien est actuellement libre ou loué</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    isAvailable
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {isAvailable ? 'Disponible' : 'Occupé (Loué)'}
                </button>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Titre de l'annonce *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Spacieux F3 meublé avec balcon vue mer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Region & Locality (Senegal) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Région du Sénégal *
                </label>
                <select
                  value={region}
                  onChange={(e) => handleRegionChange(e.target.value as SenegalRegion)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {SENEGAL_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Quartier / Localité *
                </label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {(SENEGAL_LOCALITIES[region] || [region]).map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type & Rooms */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Type de bien *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PropertyType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="STUDIO">Studio</option>
                  <option value="APPARTEMENT">Appartement</option>
                  <option value="MAISON">Maison / Villa</option>
                  <option value="CHAMBRE">Chambre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre de pièces *
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  required
                  value={rooms}
                  onChange={(e) => setRooms(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Price & Charges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Loyer mensuel (en FCFA) *
                </label>
                <input
                  type="number"
                  step="5000"
                  required
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pb-1.5">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chargesIncluded}
                    onChange={(e) => setChargesIncluded(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-300 font-medium">Charges comprises</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description détaillée *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Décrivez les commodités (climatisation, réserve d'eau, groupe électrogène, sécurité, gardiennage...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Approx Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Indication géographique approximative *</span>
                <span className="text-[10px] text-slate-400 font-normal">Pas d'adresse exacte</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Ex: À 150m du rond-point Mermoz, proche Pharmacie"
                  value={approxLocation}
                  onChange={(e) => setApproxLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Photo Upload with Compression */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Photos du bien (Max 8) *</span>
                <span className="text-[10px] text-emerald-400 font-medium">Auto-compression mobile</span>
              </label>

              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 group">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {photos.length < 8 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-400 font-medium">Ajouter</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {isCompressing && (
                  <p className="text-[11px] text-amber-400 animate-pulse font-medium">
                    Compression d'image WebP en cours pour l'économie de bande passante...
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isCompressing}
                className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 ${
                  propertyToEdit
                    ? 'bg-blue-600 hover:bg-blue-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{propertyToEdit ? 'Enregistrer les Modifications' : "Publier l'Annonce"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
