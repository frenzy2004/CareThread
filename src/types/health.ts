export interface CheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  mood: 1 | 2 | 3 | 4 | 5;
  note?: string;
  timestamp: number;
  sameAsYesterday?: boolean;
}

export interface Symptom {
  id: string;
  name: string;
  severity: 1 | 2 | 3 | 4 | 5;
  bodyArea?: string;
  notes?: string;
  timestamp: number;
}

export interface Medication {
  id: string;
  name: string;
  drugClass?: string;
  dosage: string;
  frequency: string;
  providerId?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'discontinued';
  discontinuationReason?: string;
}

export interface MedEffectRating {
  id: string;
  medicationId: string;
  rating: 'better' | 'same' | 'worse';
  timestamp: number;
}

export interface MedCompliance {
  id: string;
  medicationId: string;
  date: string; // YYYY-MM-DD
  taken: boolean;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  color: string; // HSL string
}

export interface Insight {
  id: string;
  type: 'medication_effect' | 'missed_dose' | 'temporal_pattern' | 'provider_correlation';
  message: string;
  confidence: 'low' | 'moderate' | 'high';
  relatedMedId?: string;
  relatedSymptomId?: string;
  generatedAt: number;
}

export type MoodEmoji = { value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string };

export const MOOD_EMOJIS: MoodEmoji[] = [
  { value: 1, emoji: '😔', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Not great' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' },
];

export const BODY_AREAS = [
  'Head', 'Chest', 'Abdomen', 'Joints', 'Skin', 'Back',
  'Hands', 'Feet', 'Eyes', 'Throat', 'Whole body', 'Other',
];

export const COMMON_SYMPTOMS = [
  'Fatigue', 'Joint pain', 'Brain fog', 'Bloating', 'Nausea',
  'Headache', 'Skin rash', 'Muscle aches', 'Dizziness',
  'Heart palpitations', 'Abdominal pain', 'Insomnia',
  'Anxiety', 'Swelling', 'Numbness', 'Dry eyes',
];

export const PROVIDER_COLORS = [
  '18 52% 53%',   // terracotta
  '140 15% 55%',  // sage
  '220 50% 55%',  // blue
  '280 40% 55%',  // purple
  '45 70% 50%',   // gold
  '340 45% 55%',  // rose
];
