export type UserRole = 'LANDLORD' | 'TENANT';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED';

export type PropertyType = 'STUDIO' | 'APPARTEMENT' | 'MAISON' | 'CHAMBRE';

export type SenegalRegion =
  | 'Dakar'
  | 'Thiès'
  | 'Saint-Louis'
  | 'Ziguinchor'
  | 'Diourbel'
  | 'Kaolack'
  | 'Fatick'
  | 'Kolda'
  | 'Louga'
  | 'Matam'
  | 'Kaffrine'
  | 'Kédougou'
  | 'Sédhiou'
  | 'Tambacounda';

export const SENEGAL_REGIONS: SenegalRegion[] = [
  'Dakar',
  'Thiès',
  'Saint-Louis',
  'Ziguinchor',
  'Diourbel',
  'Kaolack',
  'Fatick',
  'Kolda',
  'Louga',
  'Matam',
  'Kaffrine',
  'Kédougou',
  'Sédhiou',
  'Tambacounda',
];

export const SENEGAL_LOCALITIES: Record<SenegalRegion, string[]> = {
  Dakar: [
    'Almadies',
    'Mermoz',
    'Plateau',
    'Point E',
    'Ngor',
    'Yoff',
    'Sacré-Cœur',
    'Ouakam',
    'Liberté',
    'Sicap',
    'Parcelles Assainies',
    'Grand Yoff',
    'Rufisque',
    'Guédiawaye',
    'Keur Massar',
    'Diamniadio',
  ],
  Thiès: [
    'Thiès Ville',
    'Saly Portudal',
    'Mbour',
    'Somone',
    'Popenguine',
    'Ndayane',
    'Tivaouane',
  ],
  'Saint-Louis': [
    'Île de Saint-Louis',
    'Sor',
    'Langue de Barbarie',
    'Dagana',
    'Podor',
  ],
  Ziguinchor: [
    'Cap Skirring',
    'Ziguinchor Ville',
    'Oussouye',
    'Bignona',
  ],
  Diourbel: ['Diourbel Ville', 'Touba', 'Mbacké'],
  Kaolack: ['Kaolack Ville', 'Ndoffane', 'Nioro du Rip'],
  Fatick: ['Fatick Ville', 'Foundiougne', 'Toubacouta', 'Passy'],
  Kolda: ['Kolda Ville', 'Vélingara', 'Medina Yoro Foulah'],
  Louga: ['Louga Ville', 'Linguère', 'Kébémer'],
  Matam: ['Matam Ville', 'Kanel', 'Ranérou'],
  Kaffrine: ['Kaffrine Ville', 'Koungheul', 'Birkelane'],
  Kédougou: ['Kédougou Ville', 'Saraya', 'Salémata'],
  Sédhiou: ['Sédhiou Ville', 'Goudomp', 'Bounkiling'],
  Tambacounda: ['Tambacounda Ville', 'Bakel', 'Goudiry'],
};

export type SubscriptionPlan = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  idCardUrl?: string;
  proofOfOwnershipUrl?: string;
  email?: string;
  createdAt: string;
  subscriptionStatus?: 'FREE' | 'PRO';
  subscriptionPlan?: SubscriptionPlan;
  subscriptionExpiresAt?: string;
}

export interface Property {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerVerified: boolean;
  title: string;
  description: string;
  region: SenegalRegion;
  neighborhood: string;
  city: string;
  type: PropertyType;
  rooms: number;
  price: number; // In FCFA
  chargesIncluded: boolean;
  isAvailable: boolean;
  photos: string[];
  approxLocation: string; // e.g. "À 200m du Rond-point Mermoz"
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSmsFallback?: boolean;
}

export interface Conversation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPhoto: string;
  landlordId: string;
  tenantId: string;
  landlordName: string;
  tenantName: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

export interface Signature {
  signed: boolean;
  timestamp?: string;
  ip?: string;
  signerName?: string;
}

export type LeaseStatus = 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'TERMINATED';

export interface Lease {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyRegion: SenegalRegion;
  propertyNeighborhood: string;
  landlordId: string;
  landlordName: string;
  landlordPhone: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  monthlyRent: number; // FCFA
  securityDeposit: number; // FCFA (e.g., 2 months)
  startDate: string;
  durationMonths: number;
  status: LeaseStatus;
  landlordSignature: Signature;
  tenantSignature: Signature;
  pdfUrl?: string;
  createdAt: string;
}

export type ItemCondition = 'NEUF' | 'BON_ETAT' | 'USAGE' | 'ABIME';

export interface InventoryItem {
  id: string;
  room: string; // e.g. "Salon", "Chambre 1", "Cuisine", "Salle de Bain", "Balcon"
  elementName: string; // e.g. "Murs & Peinture", "Carrelage / Sol", "Prises & Interrupteurs", "Plomberie & Robinetterie"
  conditionEntry: ItemCondition;
  photoEntryUrl?: string;
  notesEntry?: string;
  conditionExit?: ItemCondition;
  photoExitUrl?: string;
  notesExit?: string;
}

export interface InventoryReport {
  id: string;
  leaseId: string;
  propertyTitle: string;
  propertyRegion: SenegalRegion;
  propertyNeighborhood: string;
  tenantName: string;
  landlordName: string;
  dateEntry: string;
  dateExit?: string;
  type?: 'ENTREE' | 'SORTIE';
  items: InventoryItem[];
  isEntrySigned: boolean;
  isExitSigned?: boolean;
  entrySignatureDate?: string;
  exitSignatureDate?: string;
  pdfUrl?: string;
}

export type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'CASH' | 'BANK_TRANSFER' | 'CHEQUE';

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Payment {
  id: string;
  leaseId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  tenantPhone?: string;
  landlordId: string;
  amount: number; // FCFA
  periodMonth: string; // e.g. "Août 2026"
  dueDate: string;
  paidDate?: string;
  method?: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  receiptUrl?: string;
}

export interface OfflineDraft {
  id: string;
  type: 'PROPERTY' | 'INVENTORY' | 'MESSAGE';
  payload: any;
  timestamp: string;
}
