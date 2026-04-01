import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type {
  CheckIn, Symptom, Medication, MedEffectRating,
  MedCompliance, Provider, PROVIDER_COLORS,
} from '@/types/health';
import { PROVIDER_COLORS as COLORS } from '@/types/health';

const genId = () => crypto.randomUUID();
const today = () => new Date().toISOString().split('T')[0];

export function useHealthData() {
  const [checkIns, setCheckIns] = useLocalStorage<CheckIn[]>('ct_checkins', []);
  const [symptoms, setSymptoms] = useLocalStorage<Symptom[]>('ct_symptoms', []);
  const [medications, setMedications] = useLocalStorage<Medication[]>('ct_medications', []);
  const [effectRatings, setEffectRatings] = useLocalStorage<MedEffectRating[]>('ct_effect_ratings', []);
  const [compliance, setCompliance] = useLocalStorage<MedCompliance[]>('ct_compliance', []);
  const [providers, setProviders] = useLocalStorage<Provider[]>('ct_providers', []);

  // Check-ins
  const addCheckIn = useCallback((mood: CheckIn['mood'], note?: string, sameAsYesterday?: boolean) => {
    const entry: CheckIn = { id: genId(), date: today(), mood, note, timestamp: Date.now(), sameAsYesterday };
    setCheckIns(prev => [entry, ...prev]);
    return entry;
  }, [setCheckIns]);

  const todayCheckIn = useMemo(() => {
    const d = today();
    return checkIns.find(c => c.date === d);
  }, [checkIns]);

  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = d.toISOString().split('T')[0];
      if (checkIns.some(c => c.date === dateStr)) {
        count++;
      } else if (i > 0) break; // allow today to be missing
      else continue;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [checkIns]);

  // Symptoms
  const addSymptom = useCallback((data: Omit<Symptom, 'id' | 'timestamp'>) => {
    const entry: Symptom = { ...data, id: genId(), timestamp: Date.now() };
    setSymptoms(prev => [entry, ...prev]);
    return entry;
  }, [setSymptoms]);

  const deleteSymptom = useCallback((id: string) => {
    setSymptoms(prev => prev.filter(s => s.id !== id));
  }, [setSymptoms]);

  const lastSymptom = useMemo(() => symptoms[0] || null, [symptoms]);

  // Medications
  const addMedication = useCallback((data: Omit<Medication, 'id' | 'status'>) => {
    const entry: Medication = { ...data, id: genId(), status: 'active' };
    setMedications(prev => [entry, ...prev]);
    return entry;
  }, [setMedications]);

  const updateMedication = useCallback((id: string, updates: Partial<Medication>) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, [setMedications]);

  const discontinueMedication = useCallback((id: string, reason?: string) => {
    setMedications(prev => prev.map(m =>
      m.id === id
        ? { ...m, status: 'discontinued' as const, endDate: today(), discontinuationReason: reason }
        : m
    ));
  }, [setMedications]);

  const deleteMedication = useCallback((id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  }, [setMedications]);

  const activeMedications = useMemo(() => medications.filter(m => m.status === 'active'), [medications]);

  // Effect ratings
  const addEffectRating = useCallback((medicationId: string, rating: MedEffectRating['rating']) => {
    const entry: MedEffectRating = { id: genId(), medicationId, rating, timestamp: Date.now() };
    setEffectRatings(prev => [entry, ...prev]);
    return entry;
  }, [setEffectRatings]);

  // Compliance
  const toggleCompliance = useCallback((medicationId: string, taken: boolean) => {
    const d = today();
    setCompliance(prev => {
      const existing = prev.findIndex(c => c.medicationId === medicationId && c.date === d);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], taken };
        return updated;
      }
      return [{ id: genId(), medicationId, date: d, taken }, ...prev];
    });
  }, [setCompliance]);

  const todayCompliance = useMemo(() => {
    const d = today();
    return compliance.filter(c => c.date === d);
  }, [compliance]);

  // Providers
  const addProvider = useCallback((data: Omit<Provider, 'id' | 'color'>) => {
    const colorIndex = providers.length % COLORS.length;
    const entry: Provider = { ...data, id: genId(), color: COLORS[colorIndex] };
    setProviders(prev => [...prev, entry]);
    return entry;
  }, [setProviders, providers.length]);

  // Backup / Restore
  const exportData = useCallback(() => {
    return JSON.stringify({
      checkIns, symptoms, medications, effectRatings, compliance, providers,
      exportedAt: Date.now(), version: 1,
    }, null, 2);
  }, [checkIns, symptoms, medications, effectRatings, compliance, providers]);

  const importData = useCallback((json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.checkIns) setCheckIns(data.checkIns);
      if (data.symptoms) setSymptoms(data.symptoms);
      if (data.medications) setMedications(data.medications);
      if (data.effectRatings) setEffectRatings(data.effectRatings);
      if (data.compliance) setCompliance(data.compliance);
      if (data.providers) setProviders(data.providers);
      return true;
    } catch {
      return false;
    }
  }, [setCheckIns, setSymptoms, setMedications, setEffectRatings, setCompliance, setProviders]);

  return {
    checkIns, addCheckIn, todayCheckIn, streak,
    symptoms, addSymptom, deleteSymptom, lastSymptom,
    medications, activeMedications, addMedication, updateMedication, deleteMedication,
    effectRatings, addEffectRating,
    compliance, toggleCompliance, todayCompliance,
    providers, addProvider,
    exportData, importData,
  };
}
