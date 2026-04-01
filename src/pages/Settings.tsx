import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Upload, AlertCircle, Check, Plus, Trash2, LogOut } from 'lucide-react';
import { useHealthDataContext } from '@/contexts/HealthDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { ExportPDF } from '@/components/ExportPDF';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const data = useHealthDataContext();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Provider form
  const [providerName, setProviderName] = useState('');
  const [providerSpecialty, setProviderSpecialty] = useState('');

  const handleExport = () => {
    const json = data.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carethread-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = data.importData(reader.result as string);
      setStatus(ok ? 'success' : 'error');
      setTimeout(() => setStatus('idle'), 3000);
    };
    reader.readAsText(file);
  };

  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName.trim() || !providerSpecialty.trim()) return;
    data.addProvider({ name: providerName.trim(), specialty: providerSpecialty.trim() });
    setProviderName('');
    setProviderSpecialty('');
  };

  const handleDeleteProvider = (id: string) => {
    const isReferenced = data.medications.some(m => m.providerId === id);
    if (isReferenced) {
      toast({
        title: "Can't delete provider",
        description: "This provider is still linked to a medication. Remove the link first.",
        variant: "destructive",
      });
      return;
    }
    data.deleteProvider(id);
  };

  const totalEntries = data.checkIns.length + data.symptoms.length + data.medications.length;

  return (
    <div className="px-4 py-4 w-full max-w-lg mx-auto pb-[calc(6rem+env(safe-area-inset-bottom))] overflow-x-hidden">
      <h1 className="text-xl font-bold text-foreground mb-6">Settings</h1>

      {/* Data overview */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <h2 className="font-semibold text-foreground text-sm mb-3">Your Data</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{data.checkIns.length}</p>
            <p className="text-xs text-muted-foreground">Check-ins</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data.symptoms.length}</p>
            <p className="text-xs text-muted-foreground">Symptoms</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data.medications.length}</p>
            <p className="text-xs text-muted-foreground">Medications</p>
          </div>
        </div>
      </div>

      {/* Care Team */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <h2 className="font-semibold text-foreground text-sm mb-3">Care Team</h2>
        
        {data.providers.length > 0 && (
          <div className="space-y-2 mb-3">
            {data.providers.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: `hsl(${p.color})` }} />
                  <div>
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">{p.specialty}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteProvider(p.id)}
                  aria-label={`Delete provider ${p.name}`}
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddProvider} className="space-y-2">
          <div className="flex gap-2">
            <input
              value={providerName}
              onChange={e => setProviderName(e.target.value)}
              placeholder="Name"
              className="flex-1 min-w-0 bg-muted/50 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none"
            />
            <input
              value={providerSpecialty}
              onChange={e => setProviderSpecialty(e.target.value)}
              placeholder="Specialty"
              className="flex-1 min-w-0 bg-muted/50 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!providerName.trim() || !providerSpecialty.trim()}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-40"
            aria-label="Add provider"
          >
            <Plus className="w-4 h-4" /> Add provider
          </button>
        </form>
        {data.providers.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">Add your doctors and specialists to link them to medications.</p>
        )}
      </div>

      {/* PDF Export */}
      <div className="mb-4">
        <ExportPDF />
      </div>

      {/* Backup & Restore */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <h2 className="font-semibold text-foreground text-sm mb-3">Backup & Restore</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Your data is stored locally on this device. Export regularly to avoid losing it.
        </p>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium">
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-xl py-2.5 text-sm font-medium">
            <Upload className="w-4 h-4" /> Restore
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>

        {status !== 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-2 mt-3 text-xs ${status === 'success' ? 'text-secondary' : 'text-destructive'}`}>
            {status === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {status === 'success' ? 'Data restored successfully' : 'Invalid backup file'}
          </motion.div>
        )}
      </div>

      {/* About */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <h2 className="font-semibold text-foreground text-sm mb-2">About CareThread</h2>
        <p className="text-xs text-muted-foreground">
          A decision-support companion for autoimmune patients. Track symptoms, medications, and find patterns across multiple providers. All data stays on your device.
        </p>
      </div>

      {/* Sign Out */}
      <button
        onClick={async () => {
          await signOut();
          navigate('/');
        }}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive py-3 text-sm font-medium hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  );
}
