'use client';

import React, { useState } from 'react';
import { InventoryReport, ItemCondition } from '../types';
import { printInventoryPDF } from '../lib/pdfGenerator';
import { useApp } from '../context/AppContext';
import {
  X,
  ClipboardList,
  Download,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';

interface InventoryModalProps {
  report: InventoryReport | null;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ report, onClose }) => {
  const { updateExitInventory } = useApp();
  const [viewMode, setViewMode] = useState<'DETAILS' | 'COMPARISON'>('DETAILS');
  const [exitDate, setExitDate] = useState('2026-08-28');
  const [itemsExit, setItemsExit] = useState(
    report?.items.map((it) => ({
      ...it,
      conditionExit: it.conditionExit || it.conditionEntry,
    })) || []
  );

  if (!report) return null;

  const handleSaveExitInventory = () => {
    updateExitInventory(report.id, itemsExit, exitDate);
    alert('État des lieux de sortie enregistré avec succès !');
  };

  const getBadgeStyle = (cond: ItemCondition) => {
    switch (cond) {
      case 'NEUF':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'BON_ETAT':
        return 'bg-sky-950 text-sky-400 border-sky-800';
      case 'USAGE':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'ABIME':
        return 'bg-rose-950 text-rose-400 border-rose-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-extrabold text-base text-white">
                État des Lieux Digital ({report.type})
              </h2>
              <p className="text-[11px] text-slate-400">{report.propertyTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Bar */}
        <div className="bg-slate-950 border-b border-slate-800 p-2 flex justify-between items-center text-xs">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('DETAILS')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1 ${
                viewMode === 'DETAILS'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Constat Pièce par Pièce</span>
            </button>
            <button
              onClick={() => setViewMode('COMPARISON')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1 ${
                viewMode === 'COMPARISON'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Comparateur Entrée / Sortie</span>
            </button>
          </div>

          <button
            onClick={() => printInventoryPDF(report)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {viewMode === 'DETAILS' ? (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Locataire</span>
                  <span className="font-bold text-white text-sm">{report.tenantName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date Entrée</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {new Date(report.dateEntry).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-white">Éléments inspectés</h3>
                {report.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px]">
                          {item.room}
                        </span>
                        <h4 className="font-bold text-sm text-white mt-1">{item.elementName}</h4>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getBadgeStyle(
                          item.conditionEntry
                        )}`}
                      >
                        {item.conditionEntry.replace('_', ' ')}
                      </span>
                    </div>

                    {item.notesEntry && (
                      <p className="text-slate-400 text-xs italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                        "{item.notesEntry}"
                      </p>
                    )}

                    {item.photoEntryUrl && (
                      <div className="pt-1">
                        <span className="text-[10px] text-slate-500 font-semibold mb-1 block">Photo Horodatée :</span>
                        <img
                          src={item.photoEntryUrl}
                          alt=""
                          className="w-24 h-24 object-cover rounded-xl border border-slate-800"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* SIDE-BY-SIDE COMPARISON VIEW */
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-800 p-3.5 rounded-2xl text-xs text-emerald-200 flex items-start space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Comparaison Automatique : </span>
                  Comparez visuellement l'état du logement à la remise des clés (Entrée) avec l'état actuel (Sortie) pour calculer la restitution de caution.
                </div>
              </div>

              <div className="space-y-4">
                {itemsExit.map((item, idx) => {
                  const hasChanged = item.conditionEntry !== item.conditionExit;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border ${
                        hasChanged
                          ? 'bg-amber-950/20 border-amber-800/80'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-sm text-white">
                          {item.room} — {item.elementName}
                        </span>
                        {hasChanged && (
                          <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                            Changement d'état détecté
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-center">
                        {/* Entree Column */}
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase mb-1">
                            À l'Entrée
                          </span>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyle(
                              item.conditionEntry
                            )}`}
                          >
                            {item.conditionEntry.replace('_', ' ')}
                          </span>
                          {item.photoEntryUrl && (
                            <img
                              src={item.photoEntryUrl}
                              alt=""
                              className="w-full h-24 object-cover rounded-lg border border-slate-800 mt-2"
                            />
                          )}
                        </div>

                        {/* Exit Column */}
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase mb-1">
                            À la Sortie
                          </span>
                          <select
                            value={item.conditionExit}
                            onChange={(e) => {
                              const val = e.target.value as ItemCondition;
                              setItemsExit((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, conditionExit: val } : it))
                              );
                            }}
                            className="bg-slate-950 border border-slate-700 text-xs font-bold text-white rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="NEUF">NEUF</option>
                            <option value="BON_ETAT">BON ÉTAT</option>
                            <option value="USAGE">USAGÉ</option>
                            <option value="ABIME">ABÎMÉ</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSaveExitInventory}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Enregistrer & Valider l'État des Lieux de Sortie</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
