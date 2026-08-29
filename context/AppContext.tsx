'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Property,
  Lease,
  InventoryReport,
  Payment,
  Conversation,
  OfflineDraft,
  UserRole,
  PaymentMethod,
  InventoryItem,
} from '../types';
import {
  INITIAL_USER_LANDLORD,
  INITIAL_USER_TENANT,
  INITIAL_PROPERTIES,
  INITIAL_LEASES,
  INITIAL_INVENTORY_REPORTS,
  INITIAL_PAYMENTS,
  INITIAL_CONVERSATIONS,
} from '../lib/seedData';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  isAuthenticated: boolean;
  loginWithPhone: (phone: string, role: UserRole, name?: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  currentRole: UserRole;
  toggleRole: () => void;
  currentUser: User;
  updateUserVerification: (idCardUrl: string, proofUrl: string) => void;
  properties: Property[];
  addProperty: (propertyData: Omit<Property, 'id' | 'createdAt' | 'ownerId' | 'ownerName' | 'ownerPhone' | 'ownerVerified'>) => Property;
  updateProperty: (propertyId: string, updatedData: Partial<Property>) => void;
  deleteProperty: (propertyId: string) => void;
  leases: Lease[];
  createLease: (leaseData: Omit<Lease, 'id' | 'createdAt' | 'status' | 'landlordSignature' | 'tenantSignature'>) => Lease;
  signLease: (leaseId: string, role: UserRole, signerName: string) => void;
  inventoryReports: InventoryReport[];
  createInventoryReport: (report: Omit<InventoryReport, 'id'>) => void;
  updateExitInventory: (reportId: string, itemsExit: InventoryItem[], dateExit: string) => void;
  payments: Payment[];
  payRent: (paymentId: string, method: PaymentMethod, phoneNumber: string) => Promise<Payment>;
  conversations: Conversation[];
  sendMessage: (propertyId: string, text: string, recipientRole: UserRole) => void;
  sendSmsFallback: (conversationId: string, text: string) => void;
  isOffline: boolean;
  offlineDrafts: OfflineDraft[];
  saveOfflineDraft: (type: 'PROPERTY' | 'INVENTORY' | 'MESSAGE', payload: any) => void;
  smsNotifications: { id: string; phone: string; message: string; timestamp: string }[];
  clearSmsNotifications: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  supabaseConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(true);

  const [currentRole, setCurrentRole] = useState<UserRole>('LANDLORD');
  const [landlordUser, setLandlordUser] = useState<User>(INITIAL_USER_LANDLORD);
  const [tenantUser, setTenantUser] = useState<User>(INITIAL_USER_TENANT);

  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [leases, setLeases] = useState<Lease[]>(INITIAL_LEASES);
  const [inventoryReports, setInventoryReports] = useState<InventoryReport[]>(INITIAL_INVENTORY_REPORTS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineDraft[]>([]);
  const [smsNotifications, setSmsNotifications] = useState<{ id: string; phone: string; message: string; timestamp: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  // Network listener & LocalStorage / Supabase hydration
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('immo_authenticated');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
        setIsAuthModalOpen(false);
      }
      const savedRole = localStorage.getItem('immo_role');
      if (savedRole === 'LANDLORD' || savedRole === 'TENANT') {
        setCurrentRole(savedRole as UserRole);
      }
      const savedUser = localStorage.getItem('immo_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.role === 'LANDLORD') setLandlordUser(parsedUser);
        if (parsedUser.role === 'TENANT') setTenantUser(parsedUser);
      }
      const savedProps = localStorage.getItem('immo_properties');
      if (savedProps) setProperties(JSON.parse(savedProps));
      
      const savedLeases = localStorage.getItem('immo_leases');
      if (savedLeases) setLeases(JSON.parse(savedLeases));

      const savedPayments = localStorage.getItem('immo_payments');
      if (savedPayments) setPayments(JSON.parse(savedPayments));
    } catch (e) {
      console.warn('LocalStorage initialization warning:', e);
    }

    // Fetch from Supabase PostgreSQL if configured
    const loadFromSupabase = async () => {
      if (!isSupabaseConfigured()) return;
      const client = getSupabase();
      if (!client) return;

      try {
        // Fetch properties
        const { data: dbProps, error: propErr } = await client.from('properties').select('*');
        if (!propErr && dbProps && dbProps.length > 0) {
          const mappedProps: Property[] = dbProps.map((p: any) => ({
            id: p.id,
            ownerId: p.owner_id || '',
            ownerName: p.owner_name,
            ownerPhone: p.owner_phone,
            ownerVerified: p.owner_verified,
            title: p.title,
            description: p.description,
            region: p.region,
            neighborhood: p.neighborhood,
            city: p.city,
            type: p.type,
            rooms: p.rooms,
            price: Number(p.price),
            chargesIncluded: p.charges_included,
            isAvailable: p.is_available,
            photos: p.photos || [],
            approxLocation: p.approx_location,
            createdAt: p.created_at,
          }));
          setProperties(mappedProps);
          setSupabaseConnected(true);
        }

        // Fetch leases
        const { data: dbLeases, error: leaseErr } = await client.from('leases').select('*');
        if (!leaseErr && dbLeases && dbLeases.length > 0) {
          const mappedLeases: Lease[] = dbLeases.map((l: any) => ({
            id: l.id,
            propertyId: l.property_id,
            propertyTitle: l.property_title,
            propertyRegion: l.property_region,
            propertyNeighborhood: l.property_neighborhood,
            landlordId: l.landlord_id,
            landlordName: l.landlord_name,
            landlordPhone: l.landlord_phone,
            tenantId: l.tenant_id,
            tenantName: l.tenant_name,
            tenantPhone: l.tenant_phone,
            monthlyRent: Number(l.monthly_rent),
            securityDeposit: Number(l.security_deposit),
            startDate: l.start_date,
            durationMonths: l.duration_months,
            status: l.status,
            landlordSignature: l.landlord_signature || { signed: false },
            tenantSignature: l.tenant_signature || { signed: false },
            pdfUrl: l.pdf_url,
            createdAt: l.created_at,
          }));
          setLeases(mappedLeases);
        }

        // Fetch payments
        const { data: dbPayments, error: payErr } = await client.from('payments').select('*');
        if (!payErr && dbPayments && dbPayments.length > 0) {
          const mappedPayments: Payment[] = dbPayments.map((p: any) => ({
            id: p.id,
            leaseId: p.lease_id,
            propertyTitle: p.property_title,
            tenantId: p.tenant_id,
            tenantName: p.tenant_name,
            landlordId: p.landlord_id,
            amount: Number(p.amount),
            periodMonth: p.period_month,
            dueDate: p.due_date,
            paidDate: p.paid_date,
            method: p.method,
            status: p.status,
            transactionId: p.transaction_id,
            receiptUrl: p.receipt_url,
          }));
          setPayments(mappedPayments);
        }
      } catch (err) {
        console.warn('Supabase fetch notice:', err);
      }
    };

    loadFromSupabase();

    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineDrafts();
    };
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('immo_role', currentRole);
      localStorage.setItem('immo_properties', JSON.stringify(properties));
      localStorage.setItem('immo_leases', JSON.stringify(leases));
      localStorage.setItem('immo_payments', JSON.stringify(payments));
    } catch (e) {
      // storage quota or SSR edge
    }
  }, [currentRole, properties, leases, payments]);

  const loginWithPhone = (phone: string, role: UserRole, name?: string) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('immo_authenticated', 'true');
      localStorage.setItem('immo_role', role);
    } catch (e) {}

    const updatedUser: User = {
      id: `usr_${Date.now()}`,
      phone,
      name: name?.trim() || (role === 'LANDLORD' ? 'Mamadou Ndiaye' : 'Aïssatou Sow'),
      role,
      verificationStatus: 'VERIFIED',
      createdAt: new Date().toISOString(),
    };

    if (role === 'LANDLORD') {
      setLandlordUser(updatedUser);
    } else {
      setTenantUser(updatedUser);
    }

    try {
      localStorage.setItem('immo_user', JSON.stringify(updatedUser));
    } catch (e) {}

    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('immo_authenticated');
      localStorage.removeItem('immo_user');
    } catch (e) {}
    setIsAuthModalOpen(true);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const toggleRole = () => {
    setCurrentRole((prev) => (prev === 'LANDLORD' ? 'TENANT' : 'LANDLORD'));
  };

  const currentUser = currentRole === 'LANDLORD' ? landlordUser : tenantUser;

  const updateUserVerification = (idCardUrl: string, proofUrl: string) => {
    setLandlordUser((prev) => ({
      ...prev,
      verificationStatus: 'VERIFIED',
      idCardUrl,
      proofOfOwnershipUrl: proofUrl,
    }));
  };

  const addProperty = (propertyData: Omit<Property, 'id' | 'createdAt' | 'ownerId' | 'ownerName' | 'ownerPhone' | 'ownerVerified'>) => {
    const newProp: Property = {
      ...propertyData,
      id: `prop_${Date.now()}`,
      ownerId: landlordUser.id,
      ownerName: landlordUser.name,
      ownerPhone: landlordUser.phone,
      ownerVerified: landlordUser.verificationStatus === 'VERIFIED',
      createdAt: new Date().toISOString(),
    };
    setProperties((prev) => [newProp, ...prev]);

    // Persist to Supabase if available
    const client = getSupabase();
    if (client) {
      client.from('properties').insert([{
        id: newProp.id,
        owner_id: newProp.ownerId,
        owner_name: newProp.ownerName,
        owner_phone: newProp.ownerPhone,
        owner_verified: newProp.ownerVerified,
        title: newProp.title,
        description: newProp.description,
        region: newProp.region,
        neighborhood: newProp.neighborhood,
        city: newProp.city,
        type: newProp.type,
        rooms: newProp.rooms,
        price: newProp.price,
        charges_included: newProp.chargesIncluded,
        is_available: newProp.isAvailable,
        photos: newProp.photos,
        approx_location: newProp.approxLocation,
      }]).then(({ error }) => {
        if (error) console.warn('Supabase insert property warning:', error);
      });
    }

    // Save offline draft if offline
    if (isOffline) {
      saveOfflineDraft('PROPERTY', newProp);
    }
    return newProp;
  };

  const updateProperty = (propertyId: string, updatedData: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, ...updatedData } : p))
    );

    const client = getSupabase();
    if (client) {
      const payload: any = {};
      if (updatedData.title !== undefined) payload.title = updatedData.title;
      if (updatedData.description !== undefined) payload.description = updatedData.description;
      if (updatedData.region !== undefined) payload.region = updatedData.region;
      if (updatedData.neighborhood !== undefined) payload.neighborhood = updatedData.neighborhood;
      if (updatedData.city !== undefined) payload.city = updatedData.city;
      if (updatedData.type !== undefined) payload.type = updatedData.type;
      if (updatedData.rooms !== undefined) payload.rooms = updatedData.rooms;
      if (updatedData.price !== undefined) payload.price = updatedData.price;
      if (updatedData.chargesIncluded !== undefined) payload.charges_included = updatedData.chargesIncluded;
      if (updatedData.isAvailable !== undefined) payload.is_available = updatedData.isAvailable;
      if (updatedData.photos !== undefined) payload.photos = updatedData.photos;
      if (updatedData.approxLocation !== undefined) payload.approx_location = updatedData.approxLocation;

      client.from('properties').update(payload).eq('id', propertyId).then(({ error }) => {
        if (error) console.warn('Supabase update property warning:', error);
      });
    }
  };

  const deleteProperty = (propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));

    const client = getSupabase();
    if (client) {
      client.from('properties').delete().eq('id', propertyId).then(({ error }) => {
        if (error) console.warn('Supabase delete property warning:', error);
      });
    }
  };

  const createLease = (leaseData: Omit<Lease, 'id' | 'createdAt' | 'status' | 'landlordSignature' | 'tenantSignature'>) => {
    const newLease: Lease = {
      ...leaseData,
      id: `lease_${Date.now()}`,
      status: 'PENDING_SIGNATURE',
      createdAt: new Date().toISOString(),
      landlordSignature: {
        signed: true,
        timestamp: new Date().toLocaleString('fr-FR'),
        ip: '41.82.102.19 (Dakar)',
        signerName: landlordUser.name,
      },
      tenantSignature: {
        signed: false,
      },
    };
    setLeases((prev) => [newLease, ...prev]);

    // Also update property availability
    setProperties((prev) =>
      prev.map((p) => (p.id === leaseData.propertyId ? { ...p, isAvailable: false } : p))
    );

    // Create corresponding payment schedule
    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      leaseId: newLease.id,
      propertyTitle: newLease.propertyTitle,
      tenantId: newLease.tenantId,
      tenantName: newLease.tenantName,
      landlordId: newLease.landlordId,
      amount: newLease.monthlyRent,
      periodMonth: 'Septembre 2026',
      dueDate: '2026-09-05',
      status: 'PENDING',
    };
    setPayments((prev) => [newPayment, ...prev]);

    // Persist to Supabase if available
    const client = getSupabase();
    if (client) {
      client.from('leases').insert([{
        id: newLease.id,
        property_id: newLease.propertyId,
        property_title: newLease.propertyTitle,
        property_region: newLease.propertyRegion,
        property_neighborhood: newLease.propertyNeighborhood,
        landlord_id: newLease.landlordId,
        landlord_name: newLease.landlordName,
        landlord_phone: newLease.landlordPhone,
        tenant_id: newLease.tenantId,
        tenant_name: newLease.tenantName,
        tenant_phone: newLease.tenantPhone,
        monthly_rent: newLease.monthlyRent,
        security_deposit: newLease.securityDeposit,
        start_date: newLease.startDate,
        duration_months: newLease.durationMonths,
        status: newLease.status,
        landlord_signature: newLease.landlordSignature,
        tenant_signature: newLease.tenantSignature,
      }]).then(({ error }) => {
        if (error) console.warn('Supabase insert lease warning:', error);
      });

      client.from('payments').insert([{
        id: newPayment.id,
        lease_id: newPayment.leaseId,
        property_title: newPayment.propertyTitle,
        tenant_id: newPayment.tenantId,
        tenant_name: newPayment.tenantName,
        landlord_id: newPayment.landlordId,
        amount: newPayment.amount,
        period_month: newPayment.periodMonth,
        due_date: newPayment.dueDate,
        status: newPayment.status,
      }]).then(({ error }) => {
        if (error) console.warn('Supabase insert payment warning:', error);
      });
    }

    return newLease;
  };

  const signLease = (leaseId: string, role: UserRole, signerName: string) => {
    let updatedLease: Lease | null = null;

    setLeases((prev) =>
      prev.map((lease) => {
        if (lease.id !== leaseId) return lease;
        const updated = { ...lease };
        const sigObj = {
          signed: true,
          timestamp: new Date().toLocaleString('fr-FR'),
          ip: '197.214.18.52 (Free Senegal)',
          signerName,
        };
        if (role === 'LANDLORD') updated.landlordSignature = sigObj;
        if (role === 'TENANT') updated.tenantSignature = sigObj;

        if (updated.landlordSignature.signed && updated.tenantSignature.signed) {
          updated.status = 'ACTIVE';
        }
        updatedLease = updated;
        return updated;
      })
    );

    // Sync to Supabase if updated
    if (updatedLease) {
      const client = getSupabase();
      if (client) {
        const u = updatedLease as Lease;
        client.from('leases').update({
          landlord_signature: u.landlordSignature,
          tenant_signature: u.tenantSignature,
          status: u.status,
        }).eq('id', leaseId).then(({ error }) => {
          if (error) console.warn('Supabase update lease signature warning:', error);
        });
      }
    }
  };

  const createInventoryReport = (report: Omit<InventoryReport, 'id'>) => {
    const newReport: InventoryReport = {
      ...report,
      id: `inv_${Date.now()}`,
    };
    setInventoryReports((prev) => [newReport, ...prev]);

    // Persist to Supabase if available
    const client = getSupabase();
    if (client) {
      client.from('inventory_reports').insert([{
        id: newReport.id,
        lease_id: newReport.leaseId,
        property_title: newReport.propertyTitle,
        property_region: newReport.propertyRegion,
        property_neighborhood: newReport.propertyNeighborhood,
        tenant_name: newReport.tenantName,
        landlord_name: newReport.landlordName,
        date_entry: newReport.dateEntry,
        date_exit: newReport.dateExit,
        type: newReport.type || 'ENTREE',
        items: newReport.items,
        is_entry_signed: newReport.isEntrySigned,
      }]).then(({ error }) => {
        if (error) console.warn('Supabase insert inventory warning:', error);
      });
    }
  };

  const updateExitInventory = (reportId: string, itemsExit: InventoryItem[], dateExit: string) => {
    setInventoryReports((prev) =>
      prev.map((inv) => {
        if (inv.id !== reportId) return inv;
        const updated = {
          ...inv,
          type: 'SORTIE' as const,
          dateExit,
          isExitSigned: true,
          exitSignatureDate: new Date().toLocaleString('fr-FR'),
          items: itemsExit,
        };

        const client = getSupabase();
        if (client) {
          client.from('inventory_reports').update({
            type: 'SORTIE',
            date_exit: dateExit,
            is_exit_signed: true,
            exit_signature_date: updated.exitSignatureDate,
            items: itemsExit,
          }).eq('id', reportId).then(({ error }) => {
            if (error) console.warn('Supabase update exit inventory warning:', error);
          });
        }

        return updated;
      })
    );
  };

  const payRent = async (paymentId: string, method: PaymentMethod, phoneNumber: string): Promise<Payment> => {
    // Simulate Network delay & Wave/Orange Money API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const txId = method === 'WAVE' ? `WAVE-SN-${Date.now().toString().slice(-6)}` : `OM-SN-77${Date.now().toString().slice(-6)}`;

    // Find existing payment
    const existingPay = payments.find((p) => p.id === paymentId);
    const amountVal = existingPay ? existingPay.amount : 250000;

    const updatedPayment: Payment = {
      ...(existingPay || {
        id: paymentId,
        leaseId: 'lease_mermoz_2026',
        propertyTitle: 'Appartement Immo',
        tenantId: tenantUser.id,
        tenantName: tenantUser.name,
        landlordId: landlordUser.id,
        amount: 250000,
        periodMonth: 'Août 2026',
        dueDate: '2026-08-05',
      }),
      status: 'PAID',
      method,
      paidDate: new Date().toISOString(),
      transactionId: txId,
    };

    setPayments((prev) =>
      prev.map((pay) => (pay.id === paymentId ? updatedPayment : pay))
    );

    // Sync to Supabase if available
    const client = getSupabase();
    if (client) {
      client.from('payments').update({
        status: 'PAID',
        method,
        paid_date: updatedPayment.paidDate,
        transaction_id: txId,
      }).eq('id', paymentId).then(({ error }) => {
        if (error) console.warn('Supabase update payment status warning:', error);
      });
    }

    // Push SMS alert notification
    const sms = {
      id: `sms_${Date.now()}`,
      phone: phoneNumber,
      message: `ImmoConnect: Paiement de ${amountVal.toLocaleString()} FCFA reçu via ${method} (Réf: ${txId}). Reçu disponible sur l'application.`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    setSmsNotifications((prev) => [sms, ...prev]);

    return updatedPayment;
  };

  const sendMessage = (propertyId: string, text: string, recipientRole: UserRole) => {
    setConversations((prev) => {
      const existing = prev.find((c) => c.propertyId === propertyId);
      const newMsg = {
        id: `msg_${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      let updatedList = [...prev];

      if (existing) {
        updatedList = prev.map((c) =>
          c.propertyId === propertyId
            ? { ...c, messages: [...c.messages, newMsg], lastUpdated: new Date().toISOString() }
            : c
        );
      } else {
        const prop = properties.find((p) => p.id === propertyId);
        const newConv: Conversation = {
          id: `conv_${Date.now()}`,
          propertyId,
          propertyTitle: prop?.title || 'Annonce Immo',
          propertyPhoto: prop?.photos[0] || '',
          landlordId: prop?.ownerId || landlordUser.id,
          landlordName: prop?.ownerName || landlordUser.name,
          tenantId: tenantUser.id,
          tenantName: tenantUser.name,
          lastUpdated: new Date().toISOString(),
          messages: [newMsg],
        };
        updatedList = [newConv, ...prev];
      }

      return updatedList;
    });

    if (isOffline) {
      saveOfflineDraft('MESSAGE', { propertyId, text });
    }
  };

  const sendSmsFallback = (conversationId: string, text: string) => {
    const conv = conversations.find((c) => c.id === conversationId);
    const recipientPhone = currentUser.role === 'LANDLORD' ? tenantUser.phone : landlordUser.phone;

    const sms = {
      id: `sms_${Date.now()}`,
      phone: recipientPhone,
      message: `[SMS Fallback ImmoConnect] ${currentUser.name} vous a envoyé : "${text}". Répondez directement ou ouvrez l'application.`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setSmsNotifications((prev) => [sms, ...prev]);

    // Append to chat with SMS fallback flag
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: [
            ...c.messages,
            {
              id: `msg_sms_${Date.now()}`,
              senderId: currentUser.id,
              senderName: currentUser.name,
              text: `📱 [Alerte SMS envoyée à ${recipientPhone}] : ${text}`,
              timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              isSmsFallback: true,
            },
          ],
        };
      })
    );
  };

  const saveOfflineDraft = (type: 'PROPERTY' | 'INVENTORY' | 'MESSAGE', payload: any) => {
    const draft: OfflineDraft = {
      id: `draft_${Date.now()}`,
      type,
      payload,
      timestamp: new Date().toLocaleTimeString('fr-FR'),
    };
    setOfflineDrafts((prev) => [draft, ...prev]);
  };

  const syncOfflineDrafts = () => {
    if (offlineDrafts.length === 0) return;
    // Notify auto-sync
    const sms = {
      id: `sms_${Date.now()}`,
      phone: currentUser.phone,
      message: `ImmoConnect: Connexion Internet rétablie. ${offlineDrafts.length} brouillons hors-ligne ont été synchronisés avec succès.`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    setSmsNotifications((prev) => [sms, ...prev]);
    setOfflineDrafts([]);
  };

  const clearSmsNotifications = () => setSmsNotifications([]);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        loginWithPhone,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        currentRole,
        toggleRole,
        currentUser,
        updateUserVerification,
        properties,
        addProperty,
        updateProperty,
        deleteProperty,
        leases,
        createLease,
        signLease,
        inventoryReports,
        createInventoryReport,
        updateExitInventory,
        payments,
        payRent,
        conversations,
        sendMessage,
        sendSmsFallback,
        isOffline,
        offlineDrafts,
        saveOfflineDraft,
        smsNotifications,
        clearSmsNotifications,
        activeTab,
        setActiveTab,
        supabaseConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
