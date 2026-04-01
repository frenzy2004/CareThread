import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import { useHealthData } from '@/hooks/useHealthData';
import { generatePDF } from '@/lib/pdf-export';

const RANGE_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

export function ExportPDF() {
  const data = useHealthData();
  const [mode, setMode] = useState<'patient' | 'doctor'>('patient');
  const [days, setDays] = useState(14);
  const [generating, setGenerating] = useState(false);

  const hasData = useMemo(() => {
    return (
      data.checkIns.length > 0 ||
      data.symptoms.length > 0 ||
      data.medications.length > 0 ||
      data.providers.length > 0
    );
  }, [data.checkIns, data.symptoms, data.medications, data.providers]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      generatePDF(
        {
          checkIns: data.checkIns,
          symptoms: data.symptoms,
          medications: data.medications,
          compliance: data.compliance,
          effectRatings: data.effectRatings,
          providers: data.providers,
        },
        mode,
        days
      );
      setGenerating(false);
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-foreground text-sm">Share with Doctor</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Generate a PDF summary to share with your healthcare provider.
      </p>

      {/* Mode toggle */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground mb-1.5 block">View mode</label>
        <div className="flex bg-muted rounded-xl p-0.5">
          <button
            onClick={() => setMode('patient')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${mode === 'patient' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            🩵 Patient View
          </button>
          <button
            onClick={() => setMode('doctor')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${mode === 'doctor' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            🩺 Doctor View
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          {mode === 'patient' ? 'Friendly language with mood emojis and insights' : 'Clinical tables, no emojis, concise stats'}
        </p>
      </div>

      {/* Date range */}
      <div className="mb-4">
        <label className="text-xs text-muted-foreground mb-1.5 block">Date range</label>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${days === opt.value ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData && (
        <p className="text-xs text-muted-foreground text-center mb-3">
          Start logging check-ins, symptoms, or medications to generate a report.
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={generating || !hasData}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {generating ? 'Generating...' : 'Download PDF'}
      </button>
    </motion.div>
  );
}
