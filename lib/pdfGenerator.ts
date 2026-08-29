import { Lease, InventoryReport, Payment } from '../types';

/**
 * Format currency in FCFA (CFA Francs BEAC/BCEAO)
 */
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('XOF', 'FCFA');
}

/**
 * Helper to trigger print or export window for formatted official documents
 */
export function generateDocumentPrintWindow(htmlContent: string, title: string) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Veuillez autoriser les fenêtres surgissantes (popups) pour afficher le document PDF.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1e293b;
          line-height: 1.5;
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
        }
        .header {
          border-bottom: 2px solid #0f766e;
          padding-bottom: 12px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header h1 {
          color: #0f766e;
          margin: 0;
          font-size: 22px;
        }
        .badge {
          background: #ccfbf1;
          color: #0f766e;
          padding: 4px 12px;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 12px;
        }
        .section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .section-title {
          font-weight: 700;
          color: #0f766e;
          font-size: 15px;
          margin-bottom: 8px;
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 4px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
        }
        .value {
          font-weight: 600;
          font-size: 14px;
        }
        .signature-box {
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          padding: 16px;
          background: #fff;
          text-align: center;
        }
        .stamp {
          display: inline-block;
          border: 2px solid #0f766e;
          color: #0f766e;
          font-weight: bold;
          padding: 6px 12px;
          border-radius: 6px;
          transform: rotate(-3deg);
          margin-top: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        th, td {
          border: 1px solid #e2e8f0;
          padding: 10px;
          text-align: left;
          font-size: 13px;
        }
        th {
          background: #f1f5f9;
          font-weight: 600;
        }
        .no-print {
          margin-bottom: 20px;
          padding: 12px;
          background: #e0f2fe;
          color: #0369a1;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn-print {
          background: #0f766e;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <span>📄 Aperçu Officiel du Document</span>
        <button class="btn-print" onclick="window.print()">Télécharger / Imprimer (PDF)</button>
      </div>
      ${htmlContent}
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Generate Lease PDF Content
 */
export function printLeasePDF(lease: Lease) {
  const html = `
    <div class="header">
      <div>
        <h1>CONTRAT DE BAIL À USAGE D'HABITATION</h1>
        <div style="font-size: 12px; color: #64748b;">Conforme à la Réglementation des Baux du Sénégal (Loi N° 2014-03 & Code Civil)</div>
      </div>
      <div class="badge">Bail Réf: ${lease.id}</div>
    </div>

    <div class="section grid-2">
      <div>
        <div class="section-title">BAILLEUR (PROPRIÉTAIRE)</div>
        <div class="label">Nom complet</div>
        <div class="value">${lease.landlordName}</div>
        <div class="label" style="margin-top:8px;">Téléphone</div>
        <div class="value">${lease.landlordPhone}</div>
      </div>
      <div>
        <div class="section-title">PRENEUR (LOCATAIRE)</div>
        <div class="label">Nom complet</div>
        <div class="value">${lease.tenantName}</div>
        <div class="label" style="margin-top:8px;">Téléphone</div>
        <div class="value">${lease.tenantPhone}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">DÉSIGNATION DU BIEN LOUÉ</div>
      <div class="value" style="font-size: 16px;">${lease.propertyTitle}</div>
      <div class="label" style="margin-top: 4px;">Localisation</div>
      <div class="value">Région de ${lease.propertyRegion || 'Dakar'} • Localité : ${lease.propertyNeighborhood}, Sénégal</div>
    </div>

    <div class="section grid-2">
      <div>
        <div class="section-title">CONDITIONS FINANCIÈRES</div>
        <div class="label">Loyer mensuel</div>
        <div class="value" style="color: #0f766e; font-size: 18px;">${formatFCFA(lease.monthlyRent)}</div>
        <div class="label" style="margin-top: 8px;">Dépôt de garantie (Caution)</div>
        <div class="value">${formatFCFA(lease.securityDeposit)}</div>
      </div>
      <div>
        <div class="section-title">DURÉE ET PRISE DE POSSESSION</div>
        <div class="label">Date de prise d'effet</div>
        <div class="value">${new Date(lease.startDate).toLocaleDateString('fr-FR')}</div>
        <div class="label" style="margin-top: 8px;">Durée du bail</div>
        <div class="value">${lease.durationMonths} mois (Renouvelable par tacite reconduction)</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">CLAUSES GÉNÉRALES</div>
      <p style="font-size: 12px; color: #475569;">
        Le preneur s'engage à payer le loyer mensuel au plus tard le 5 de chaque mois par voie de paiement digital (Wave / Orange Money) ou virement.
        Le bailleur s'assure de fournir un logement conforme et en bon état d'usage. Tout litige relatif au présent contrat relèvera de la compétence exclusive du Tribunal de Grande Instance de Dakar.
      </p>
    </div>

    <div class="grid-2" style="margin-top: 24px;">
      <div class="signature-box">
        <div class="label">Signature du Bailleur</div>
        <div class="value" style="margin-top:8px;">${lease.landlordName}</div>
        ${
          lease.landlordSignature.signed
            ? `<div class="stamp">SIGNÉ NURIQUEMENT</div>
               <div style="font-size:10px; color:#64748b; margin-top:4px;">Horodatage : ${lease.landlordSignature.timestamp}<br>IP trace : ${lease.landlordSignature.ip}</div>`
            : `<div style="color: #ef4444; font-size:12px; margin-top:12px;">En attente de signature</div>`
        }
      </div>

      <div class="signature-box">
        <div class="label">Signature du Locataire</div>
        <div class="value" style="margin-top:8px;">${lease.tenantName}</div>
        ${
          lease.tenantSignature.signed
            ? `<div class="stamp">SIGNÉ NURIQUEMENT</div>
               <div style="font-size:10px; color:#64748b; margin-top:4px;">Horodatage : ${lease.tenantSignature.timestamp}<br>IP trace : ${lease.tenantSignature.ip}</div>`
            : `<div style="color: #ef4444; font-size:12px; margin-top:12px;">En attente de signature</div>`
        }
      </div>
    </div>

    <div style="text-align: center; margin-top: 32px; font-size: 11px; color: #94a3b8;">
      Certifié et horodaté par ImmoConnect Dakar • Plateforme de Gestion Locative Digitale du Sénégal
    </div>
  `;

  generateDocumentPrintWindow(html, `Bail_ImmoConnect_${lease.id}.pdf`);
}

/**
 * Generate Rent Payment Receipt PDF
 */
export function printReceiptPDF(payment: Payment) {
  const html = `
    <div class="header">
      <div>
        <h1>REÇU DE PAIEMENT DE LOYER</h1>
        <div style="font-size: 12px; color: #64748b;">Quittance de Loyer Numérique Dématérialisée</div>
      </div>
      <div class="badge" style="background:#dcfce7; color:#15803d;">Paiement Validé</div>
    </div>

    <div class="section grid-2">
      <div>
        <div class="label">N° de Transaction</div>
        <div class="value" style="font-family: monospace; font-size:16px;">${payment.transactionId || payment.id}</div>
        <div class="label" style="margin-top: 8px;">Mode de Paiement</div>
        <div class="value" style="color: ${payment.method === 'WAVE' ? '#0284c7' : '#ea580c'};">
          ${payment.method === 'WAVE' ? '🌊 Wave Sénégal' : '🍊 Orange Money Sénégal'}
        </div>
      </div>
      <div>
        <div class="label">Période concernée</div>
        <div class="value" style="font-size: 16px; color:#0f766e;">${payment.periodMonth}</div>
        <div class="label" style="margin-top: 8px;">Date de Règlement</div>
        <div class="value">${payment.paidDate ? new Date(payment.paidDate).toLocaleString('fr-FR') : 'N/A'}</div>
      </div>
    </div>

    <div class="section grid-2">
      <div>
        <div class="section-title">BÉNÉFICIAIRE</div>
        <div class="label">Locataire</div>
        <div class="value">${payment.tenantName}</div>
      </div>
      <div>
        <div class="section-title">DÉSIGNATION BIEN</div>
        <div class="value">${payment.propertyTitle}</div>
      </div>
    </div>

    <div class="section" style="text-align: center; background: #ecfdf5; border-color: #a7f3d0;">
      <div class="label">MONTANT REÇU AVEC SUCCÈS</div>
      <div style="font-size: 32px; font-weight: 800; color: #047857; margin: 4px 0;">
        ${formatFCFA(payment.amount)}
      </div>
      <div style="font-size: 12px; color: #065f46;">Loyer intégral et charges réglés pour ${payment.periodMonth}</div>
    </div>

    <div style="margin-top: 30px; text-align: center;">
      <div class="stamp" style="border-color:#15803d; color:#15803d;">QUITTANCE PAYÉE ET VALIDE</div>
      <p style="font-size: 11px; color: #64748b; margin-top: 12px;">
        Document émis électroniquement par ImmoConnect Sénégal via l'API officielle ${payment.method === 'WAVE' ? 'Wave for Business' : 'Orange Money API'}.
      </p>
    </div>
  `;

  generateDocumentPrintWindow(html, `Recu_Loyer_${payment.periodMonth.replace(' ', '_')}.pdf`);
}

/**
 * Generate Inventory PDF Content
 */
export function printInventoryPDF(inventory: InventoryReport) {
  const itemsHtml = inventory.items
    .map(
      (item) => `
    <tr>
      <td><strong>${item.room}</strong></td>
      <td>${item.elementName}</td>
      <td><span style="font-weight:600; color:${getConditionColor(item.conditionEntry)}">${item.conditionEntry}</span></td>
      <td>${item.notesEntry || '-'}</td>
      ${
        inventory.type === 'SORTIE' || item.conditionExit
          ? `<td><span style="font-weight:600; color:${getConditionColor(item.conditionExit || 'BON_ETAT')}">${item.conditionExit || 'N/A'}</span></td>`
          : ''
      }
    </tr>
  `
    )
    .join('');

  const html = `
    <div class="header">
      <div>
        <h1>ÉTAT DES LIEUX DIGITAL (${inventory.type || 'ENTREE'})</h1>
        <div style="font-size: 12px; color: #64748b;">${inventory.propertyTitle} — Région ${inventory.propertyRegion || 'Dakar'} • ${inventory.propertyNeighborhood}</div>
      </div>
      <div class="badge">Réf: ${inventory.id}</div>
    </div>

    <div class="section grid-2">
      <div>
        <div class="label">Bailleur</div>
        <div class="value">${inventory.landlordName}</div>
        <div class="label" style="margin-top: 8px;">Locataire</div>
        <div class="value">${inventory.tenantName}</div>
      </div>
      <div>
        <div class="label">Date de l'état des lieux d'entrée</div>
        <div class="value">${new Date(inventory.dateEntry).toLocaleDateString('fr-FR')}</div>
        ${
          inventory.dateExit
            ? `<div class="label" style="margin-top:8px;">Date de sortie</div><div class="value">${new Date(inventory.dateExit).toLocaleDateString('fr-FR')}</div>`
            : ''
        }
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Pièce</th>
          <th>Élément / Équipement</th>
          <th>État d'Entrée</th>
          <th>Observations Entrée</th>
          ${inventory.type === 'SORTIE' ? '<th>État de Sortie</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="grid-2" style="margin-top: 32px;">
      <div class="signature-box">
        <div class="label">Signature Bailleur</div>
        <div class="value">${inventory.landlordName}</div>
        <div class="stamp" style="margin-top:8px;">VERIFIÉ SUR PLACE</div>
      </div>
      <div class="signature-box">
        <div class="label">Signature Locataire</div>
        <div class="value">${inventory.tenantName}</div>
        <div class="stamp" style="margin-top:8px;">VERIFIÉ SUR PLACE</div>
      </div>
    </div>
  `;

  generateDocumentPrintWindow(html, `Etat_des_Lieux_${inventory.id}.pdf`);
}

function getConditionColor(cond?: string): string {
  switch (cond) {
    case 'NEUF':
      return '#047857';
    case 'BON_ETAT':
      return '#0284c7';
    case 'USAGE':
      return '#d97706';
    case 'ABIME':
      return '#dc2626';
    default:
      return '#475569';
  }
}
