import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Archive } from 'lucide-react';
import { useHealthData } from '@/hooks/useHealthData';
import { MedicationCard } from '@/components/MedicationCard';
import { EmptyState } from '@/components/EmptyState';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

export default function Medications() {
  const data = useHealthData();
  const [showForm, setShowForm] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [name, setName] = useState('');
  const [drugClass, setDrugClass] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;
    data.addMedication({
      name: name.trim(), drugClass: drugClass || undefined, dosage, frequency,
      startDate, providerId: undefined,
    });
    setName(''); setDrugClass(''); setDosage(''); setFrequency(''); setShowForm(false);
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
            <button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-medium">
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
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {/* Bottom Sheet Form */}
      <Drawer open={showForm} onOpenChange={setShowForm}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Medication</DrawerTitle>
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
                Save medication
              </button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Active */}
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
              showEffectRating={daysSince >= 7}
            />
          );
        })}
      </div>

      {/* Discontinue button on each active med */}
      {data.activeMedications.length > 0 && (
        <p className="text-xs text-muted-foreground text-center mb-4">
          Tap medication card checkbox to track daily compliance
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
                <div key={med.id} className="bg-muted/30 rounded-xl border border-border p-3 opacity-60">
                  <span className="text-sm font-medium">{med.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{med.dosage}</span>
                  {med.discontinuationReason && <p className="text-xs text-muted-foreground mt-1">{med.discontinuationReason}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
