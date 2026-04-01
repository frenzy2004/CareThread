import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, AlertCircle, Check } from 'lucide-react';
import { useHealthData } from '@/hooks/useHealthData';

export default function SettingsPage() {
  const data = useHealthData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const totalEntries = data.checkIns.length + data.symptoms.length + data.medications.length;

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
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
      <div className="bg-card rounded-2xl border border-border p-4">
        <h2 className="font-semibold text-foreground text-sm mb-2">About CareThread</h2>
        <p className="text-xs text-muted-foreground">
          A decision-support companion for autoimmune patients. Track symptoms, medications, and find patterns across multiple providers. All data stays on your device.
        </p>
      </div>
    </div>
  );
}
