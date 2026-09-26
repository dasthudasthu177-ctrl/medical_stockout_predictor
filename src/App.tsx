/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PresentationDeck } from './components/PresentationDeck';
import { DashboardOverview } from './components/DashboardOverview';
import { OutbreakSimulator } from './components/OutbreakSimulator';
import { NudgesList } from './components/NudgesList';
import { SupplierNudgeModal } from './components/SupplierNudgeModal';
import { GeminiChatbot } from './components/GeminiChatbot';
import { GoogleDataPanel } from './components/GoogleDataPanel';
import { InventoryManagerModal } from './components/InventoryManagerModal';
import { MobileBottomNav } from './components/MobileBottomNav';

import {
  INITIAL_FACILITIES,
  INITIAL_MEDICINES,
  INITIAL_OUTBREAK_SIGNALS,
  INITIAL_NUDGES,
} from './data/initialData';
import { Facility, Medicine, OutbreakSignals, SupplierNudge } from './types';
import { updateMedicineWithSignals } from './utils/forecasting';
import {
  auth,
  onAuthStateChanged,
  User,
  saveNudgeToFirestore,
  updateNudgeStatusInFirestore,
  db,
} from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function App() {
  const [currentView, setCurrentView] = useState<
    'presentation' | 'dashboard' | 'simulator' | 'nudges' | 'google-data'
  >('dashboard');
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [selectedFacility, setSelectedFacility] = useState<Facility>(INITIAL_FACILITIES[0]);
  const [signals, setSignals] = useState<OutbreakSignals>(INITIAL_OUTBREAK_SIGNALS);
  const [rawMedicines, setRawMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [nudges, setNudges] = useState<SupplierNudge[]>(INITIAL_NUDGES);

  // User state from Firebase Auth
  const [user, setUser] = useState<User | null>(null);

  // Modals state
  const [activeNudge, setActiveNudge] = useState<SupplierNudge | null>(null);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore nudges collection for live real-time sync across devices
  useEffect(() => {
    try {
      const q = query(collection(db, 'nudges'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const loadedNudges: SupplierNudge[] = [];
          snapshot.forEach((doc) => {
            loadedNudges.push(doc.data() as SupplierNudge);
          });
          if (loadedNudges.length > 0) {
            setNudges((prev) => {
              const ids = new Set(loadedNudges.map((n) => n.id));
              const localUnsaved = prev.filter((n) => !ids.has(n.id));
              return [...loadedNudges, ...localUnsaved];
            });
          }
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore nudges listener bypassed:', err);
    }
  }, []);

  // Recalculate medicine trajectories dynamically as outbreak signals or shelf stocks change
  const computedMedicines = useMemo(() => {
    return rawMedicines.map((med) => updateMedicineWithSignals(med, signals));
  }, [rawMedicines, signals]);

  const criticalCount = computedMedicines.filter((m) => m.riskLevel === 'CRITICAL').length;

  // Trigger automated restock nudge for a specific medicine
  const handleTriggerNudge = async (med: Medicine) => {
    // Check if an existing nudge exists
    const existing = nudges.find((n) => n.medicineId === med.id && n.facilityId === selectedFacility.id);
    if (existing) {
      setActiveNudge(existing);
      return;
    }

    // Create a new customized nudge
    const suggestedQty = Math.round(med.reorderPoint * 1.5);
    const urgency = med.daysRemaining <= 3 ? 'Immediate (24h)' : 'Urgent (48h)';
    const newNudge: SupplierNudge = {
      id: `ndg-${Date.now()}`,
      poNumber: `TNMSC-PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      facilityId: selectedFacility.id,
      facilityName: selectedFacility.name,
      medicineId: med.id,
      medicineName: med.name,
      currentStock: med.currentStock,
      daysRemaining: med.daysRemaining,
      suggestedQuantity: suggestedQty,
      urgency,
      status: 'Sent via WhatsApp',
      timestamp: 'Just now',
      supplierName: selectedFacility.distributor,
      supplierPhone: selectedFacility.distributorPhone,
      messageText: `🚨 *URGENT RESTOCK NUDGE* - Tamil Nadu Medical Services\nTo: ${selectedFacility.distributor}\nFacility: ${selectedFacility.name}\nItem: ${med.name} (${med.batchNumber})\nCurrent Stock: ${med.currentStock} ${med.unit} | Burn: ${med.adjustedDailyBurnRate} ${med.unit}/day\nDays to Zero Shelf Stock: *${med.daysRemaining} DAYS*\nRecommended Dispatch: ${suggestedQty.toLocaleString()} ${med.unit}\nRequired Delivery: ${urgency}\nReply 'CONFIRM' to dispatch carrier.`,
    };

    setNudges((prev) => [newNudge, ...prev]);
    setActiveNudge(newNudge);

    // Save to Firestore
    await saveNudgeToFirestore(newNudge);
  };

  const handleAcknowledgeNudge = async (id: string) => {
    setNudges((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'Acknowledged' } : n))
    );
    await updateNudgeStatusInFirestore(id, 'Acknowledged');
  };

  const handleUpdateStock = (medicineId: string, newStock: number) => {
    setRawMedicines((prev) =>
      prev.map((m) => (m.id === medicineId ? { ...m, currentStock: newStock } : m))
    );
  };

  const handleComposeNudge = () => {
    const sorted = [...computedMedicines].sort((a, b) => a.daysRemaining - b.daysRemaining);
    if (sorted[0]) {
      handleTriggerNudge(sorted[0]);
    }
  };

  const currentStockSummary = computedMedicines
    .slice(0, 4)
    .map((m) => `${m.name}: ${m.currentStock} ${m.unit} (${m.daysRemaining}d left, risk: ${m.riskLevel})`)
    .join('; ');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        facilities={facilities}
        selectedFacility={selectedFacility}
        setSelectedFacility={setSelectedFacility}
        outbreakSignals={signals}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
        onOpenInventoryModal={() => setIsInventoryModalOpen(true)}
        criticalCount={criticalCount}
        user={user}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16 lg:pb-8">
        {currentView === 'dashboard' && (
          <DashboardOverview
            facility={selectedFacility}
            facilities={facilities}
            medicines={computedMedicines}
            signals={signals}
            onTriggerNudge={handleTriggerNudge}
            onOpenSimulator={() => setCurrentView('simulator')}
            onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
            onOpenGoogleData={() => setCurrentView('google-data')}
            onSelectFacility={(fac) => setSelectedFacility(fac)}
          />
        )}

        {currentView === 'google-data' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <GoogleDataPanel />
          </div>
        )}

        {currentView === 'simulator' && (
          <OutbreakSimulator
            signals={signals}
            setSignals={setSignals}
            medicines={computedMedicines}
            onApplyAndGoDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'nudges' && (
          <NudgesList
            nudges={nudges}
            onOpenNudgeModal={(nudge) => setActiveNudge(nudge)}
            onComposeNudge={handleComposeNudge}
            facility={selectedFacility}
          />
        )}

        {currentView === 'presentation' && (
          <PresentationDeck
            onNavigateToLive={(view) => {
              if (view === 'ai-copilot') {
                setIsAiCopilotOpen(true);
              } else {
                setCurrentView(view);
              }
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Thumb Navigation */}
      <MobileBottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
        criticalCount={criticalCount}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 text-slate-500 text-xs py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-300">Medicine Stockout Predictor</span>
            <span>— Smart Health & Supply Chain Resilience</span>
          </div>
          <div>
            Code for Communities • GDG Chennai DevFest Roadshow 4 • Presenter: <strong className="text-slate-400">Dasthu</strong>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SupplierNudgeModal
        nudge={activeNudge}
        onClose={() => setActiveNudge(null)}
        onAcknowledgeNudge={handleAcknowledgeNudge}
      />

      <GeminiChatbot
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        facility={selectedFacility}
        currentStockSummary={currentStockSummary}
      />

      <InventoryManagerModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        facility={selectedFacility}
        medicines={computedMedicines}
        onUpdateStock={handleUpdateStock}
      />
    </div>
  );
}
