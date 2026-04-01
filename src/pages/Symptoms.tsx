import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Repeat, BarChart3, List } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useHealthData } from '@/hooks/useHealthData';
import { EmptyState } from '@/components/EmptyState';
import { COMMON_SYMPTOMS, BODY_AREAS } from '@/types/health';

export default function Symptoms() {
  const { symptoms, addSymptom, lastSymptom } = useHealthData();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState<1|2|3|4|5>(3);
  const [bodyArea, setBodyArea] = useState('');
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<'list' | 'trends'>('list');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addSymptom({ name: name.trim(), severity, bodyArea: bodyArea || undefined, notes: notes || undefined });
    setName(''); setSeverity(3); setBodyArea(''); setNotes('');
    setShowForm(false);
  };

  const repeatLast = () => {
    if (!lastSymptom) return;
    addSymptom({ name: lastSymptom.name, severity: lastSymptom.severity, bodyArea: lastSymptom.bodyArea, notes: lastSymptom.notes });
  };

  const filtered = filter
    ? symptoms.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()))
    : symptoms;

  // Trend data: average severity per day over last 14 days
  const severityTrend = useMemo(() => {
    const days: Record<string, { total: number; count: number }> = {};
    const now = Date.now();
    const cutoff = now - 14 * 24 * 60 * 60 * 1000;
    symptoms.filter(s => s.timestamp >= cutoff).forEach(s => {
      const day = new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!days[day]) days[day] = { total: 0, count: 0 };
      days[day].total += s.severity;
      days[day].count++;
    });
    return Object.entries(days).map(([day, d]) => ({
      day,
      avg: Math.round((d.total / d.count) * 10) / 10,
      count: d.count,
    })).reverse();
  }, [symptoms]);

  // Top 5 symptoms by frequency
  const frequencyData = useMemo(() => {
    const counts: Record<string, number> = {};
    symptoms.forEach(s => { counts[s.name] = (counts[s.name] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [symptoms]);

  const hasTrendData = symptoms.length >= 3;

  if (symptoms.length === 0 && !showForm) {
    return (
      <div className="p-4 max-w-lg mx-auto pb-24">
        <EmptyState
          icon="🌡️"
          title="Log your first symptom"
          description="Start tracking symptoms to uncover patterns across your care journey."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-medium"
            >
              Log a symptom
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">Symptoms</h1>
        <div className="flex gap-2">
          {hasTrendData && (
            <div className="flex bg-muted rounded-xl p-0.5">
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${view === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                <List className="w-3 h-3" /> List
              </button>
              <button
                onClick={() => setView('trends')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${view === 'trends' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                <BarChart3 className="w-3 h-3" /> Trends
              </button>
            </div>
          )}
          {lastSymptom && (
            <button onClick={repeatLast} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent text-xs font-medium text-accent-foreground hover:bg-accent/80">
              <Repeat className="w-3 h-3" /> Repeat last
            </button>
          )}
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium">
            <Plus className="w-3 h-3" /> Log
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground text-sm">Log Symptom</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Symptom name"
                className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_SYMPTOMS.slice(0, 8).map(s => (
                  <button key={s} type="button" onClick={() => setName(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${name === s ? 'bg-primary/15 text-primary font-medium' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Severity</label>
              <div className="flex gap-2">
                {([1,2,3,4,5] as const).map(v => (
                  <button key={v} type="button" onClick={() => setSeverity(v)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${severity === v ? `severity-${v} text-white` : 'bg-muted text-muted-foreground'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Body area</label>
              <div className="flex flex-wrap gap-1.5">
                {BODY_AREAS.map(a => (
                  <button key={a} type="button" onClick={() => setBodyArea(bodyArea === a ? '' : a)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${bodyArea === a ? 'bg-primary/15 text-primary font-medium' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)"
              className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm resize-none h-14 focus:ring-1 focus:ring-primary/30 focus:outline-none" />
            <button type="submit" disabled={!name.trim()} className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium disabled:opacity-40">
              Save symptom
            </button>
          </form>
        </motion.div>
      )}

      {/* Trends View */}
      {view === 'trends' && hasTrendData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mb-4">
          {/* Severity over time */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Avg Severity (14 days)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={severityTrend}>
                <defs>
                  <linearGradient id="severityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(18, 52%, 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(18, 52%, 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(28, 35%, 85%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(10, 10%, 45%)' }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: 'hsl(10, 10%, 45%)' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(28, 35%, 85%)', fontSize: '12px' }}
                  formatter={(value: number) => [value, 'Avg severity']}
                />
                <Area type="monotone" dataKey="avg" stroke="hsl(18, 52%, 53%)" fill="url(#severityGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top symptoms frequency */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Most Logged Symptoms</h3>
            <ResponsiveContainer width="100%" height={frequencyData.length * 36 + 10}>
              <BarChart data={frequencyData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(10, 10%, 45%)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(10, 20%, 18%)' }} width={100} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(28, 35%, 85%)', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="hsl(140, 15%, 55%)" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Search (list view only) */}
      {view === 'list' && symptoms.length > 3 && (
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter symptoms..."
          className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm mb-3 focus:ring-1 focus:ring-primary/30 focus:outline-none"
        />
      )}

      {/* List */}
      {view === 'list' && (
        <div className="space-y-2">
          {filtered.map(s => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                  {s.bodyArea && <span className="text-xs text-muted-foreground ml-2">{s.bodyArea}</span>}
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < s.severity ? `severity-${s.severity}` : 'bg-muted'}`} />
                  ))}
                </div>
              </div>
              {s.notes && <p className="text-xs text-muted-foreground mt-1">{s.notes}</p>}
              <time className="text-[10px] text-muted-foreground/60 mt-1 block">
                {new Date(s.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </time>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
