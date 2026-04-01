import React, { useState } from 'react';
import { Plus, Archive } from 'lucide-react';
import { useHealthData } from '@/hooks/useHealthData';
import { MedicationCard } from '@/components/MedicationCard';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import type { Medication } from '@/types/health';

const DISCONTINUE_REASONS = ['Side effects', 'Not helping', 'Doctor changed', 'Completed course', 'Other'];

export default function Medications() {
  const data = useHealthData();
  const [showForm, setShowForm] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [discontinuingMed, setDiscontinuingMed] = useState<Medication | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [drugClass, setDrugClass] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Discontinue fields
  const [discReason, setDiscReason] = useState('');
  const [discOtherText, setDiscOtherText] = useState('');

  const isEditing = !!editingMed;
  const formOpen = showForm || isEditing;

  const openAdd = () => {
    setEditingMed(null);
    setDiscontinuingMed(null);
    setName(''); setDrugClass(''); setDosage(''); setFrequency('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setShowForm(true);
  };

  const openEdit = (med: Medication) => {
    setDiscontinuingMed(null);
    setName(med.name);
    setDrugClass(med.drugClass || '');
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setStartDate(med.startDate);
    setEditingMed(med);
    setShowForm(true);
  };

  const openDiscontinue = (med: Medication) => {
    setEditingMed(null);
    setShowForm(false);
    setDiscReason('');
    setDiscOtherText('');
    setDiscontinuingMed(med);
  };

  const closeForm = (open: boolean) => {
    if (!open) {
      setShowForm(false);
      setEditingMed(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    if (isEditing && editingMed) {
      data.updateMedication(editingMed.id, {
        name: name.trim(),
        drugClass: drugClass || undefined,
        dosage,
        frequency,
        startDate,
      });
    } else {
      data.addMedication({
        name: name.trim(), drugClass: drugClass || undefined, dosage, frequency,
        startDate, providerId: undefined,
      });
    }
    setName(''); setDrugClass(''); setDosage(''); setFrequency('');
    setShowForm(false);
    setEditingMed(null);
  };

  const handleDiscontinueConfirm = () => {
    if (!discontinuingMed) return;
    const reason = discReason === 'Other' ? discOtherText.trim() || 'Other' : discReason;
    data.discontinueMedication(discontinuingMed.id, reason || undefined);
    setDiscontinuingMed(null);
  };

  const pastMeds = data.medications.filter(m => m.status === 'discontinued');

  if (data.medications.length === 0 && !showForm) {
    return (
      <div className="p-4 max-w-lg mx-auto pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <EmptyState
          icon="💊"
          title="Add your first medication"
          description="Track medications to see how treatments affect your symptoms over time."
          action={
            <button onClick={openAdd} className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-medium">
              Add medication
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">Medications</h1>
        <button onClick={openAdd} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {/* Add / Edit Drawer */}
      <Drawer open={formOpen} onOpenChange={closeForm}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isEditing ? 'Edit Medication' : 'Add Medication'}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto max-h-[85vh] px-4 pb-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Medication name"
                className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none" />
              <input value={drugClass} onChange={e => setDrugClass(e.target.value)} placeholder="Drug class (optional)"
                className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Dosage (e.g. 50mg)"
                  className="bg-muted/50 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none" />
                <input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="Frequency (e.g. daily)"
                  className="bg-muted/50 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none" />
              </div>
              <button type="submit" disabled={!name.trim() || !dosage.trim()} className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium disabled:opacity-40">
                {isEditing ? 'Update medication' : 'Save medication'}
              </button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Discontinue Drawer */}
      <Drawer open={!!discontinuingMed} onOpenChange={(open) => { if (!open) setDiscontinuingMed(null); }}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Discontinue {discontinuingMed?.name}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-4">
            <p className="text-sm text-muted-foreground">Why are you stopping this medication?</p>
            <div className="flex flex-wrap gap-2">
              {DISCONTINUE_REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => { setDiscReason(reason); if (reason !== 'Other') setDiscOtherText(''); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    discReason === reason
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/20'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            {discReason === 'Other' && (
              <input
                value={discOtherText}
                onChange={e => setDiscOtherText(e.target.value)}
                placeholder="Reason..."
                className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none"
                autoFocus
              />
            )}
            <button
              onClick={handleDiscontinueConfirm}
              disabled={!discReason}
              className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium disabled:opacity-40"
            >
              Confirm discontinue
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Active medications */}
      <div className="space-y-2 mb-6">
        {data.activeMedications.map(med => {
          const tc = data.todayCompliance.find(c => c.medicationId === med.id);
          const daysSince = Math.floor((Date.now() - new Date(med.startDate).getTime()) / (1000*60*60*24));
          return (
            <MedicationCard
              key={med.id}
              medication={med}
              ratings={data.effectRatings}
              todayCompliance={tc}
              onToggleCompliance={(taken) => data.toggleCompliance(med.id, taken)}
              onRate={(rating) => data.addEffectRating(med.id, rating)}
              onDelete={() => data.deleteMedication(med.id)}
              onEdit={() => openEdit(med)}
              onDiscontinue={() => openDiscontinue(med)}
              showEffectRating={daysSince >= 7}
            />
          );
        })}
      </div>

      {data.activeMedications.length > 0 && (
        <p className="text-xs text-muted-foreground text-center mb-4">
          Tap medication card to edit · checkbox for daily compliance
        </p>
      )}

      {/* Past meds */}
      {pastMeds.length > 0 && (
        <>
          <button onClick={() => setShowPast(!showPast)} className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Archive className="w-3.5 h-3.5" /> {showPast ? 'Hide' : 'Show'} discontinued ({pastMeds.length})
          </button>
          {showPast && (
            <div className="space-y-2">
              {pastMeds.map(med => (
                <div key={med.id} className="bg-muted/30 rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground/70">{med.name}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Discontinued</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{med.dosage} · {med.frequency}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {med.endDate && (
                      <span className="text-[10px] text-muted-foreground/60">
                        Ended {new Date(med.endDate).toLocaleDateString()}
                      </span>
                    )}
                    {med.discontinuationReason && (
                      <span className="text-[10px] text-muted-foreground/60">· {med.discontinuationReason}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
