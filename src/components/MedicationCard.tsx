import { Check, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Medication, MedEffectRating, MedCompliance } from '@/types/health';

interface MedicationCardProps {
  medication: Medication;
  ratings: MedEffectRating[];
  todayCompliance?: MedCompliance;
  onToggleCompliance: (taken: boolean) => void;
  onRate: (rating: MedEffectRating['rating']) => void;
  showEffectRating?: boolean;
}

const RATING_ICON = {
  better: { icon: TrendingUp, label: 'Better', cls: 'text-secondary' },
  same: { icon: Minus, label: 'Same', cls: 'text-muted-foreground' },
  worse: { icon: TrendingDown, label: 'Worse', cls: 'text-primary' },
};

export function MedicationCard({
  medication, ratings, todayCompliance, onToggleCompliance, onRate, showEffectRating,
}: MedicationCardProps) {
  const latestRating = ratings.filter(r => r.medicationId === medication.id)[0];

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-foreground text-sm">{medication.name}</h3>
          <p className="text-xs text-muted-foreground">{medication.dosage} · {medication.frequency}</p>
          {medication.drugClass && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">{medication.drugClass}</p>
          )}
        </div>
        <button
          onClick={() => onToggleCompliance(!(todayCompliance?.taken))}
          className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
            todayCompliance?.taken
              ? 'bg-secondary/15 border-secondary/30 text-secondary'
              : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/30'
          }`}
        >
          {todayCompliance?.taken ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5 opacity-40" />}
        </button>
      </div>

      {showEffectRating && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">How is this working?</p>
          <div className="flex gap-2">
            {(['better', 'same', 'worse'] as const).map(r => {
              const { icon: Icon, label, cls } = RATING_ICON[r];
              const active = latestRating?.rating === r;
              return (
                <button
                  key={r}
                  onClick={() => onRate(r)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    active ? `${cls} bg-accent` : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-3 h-3" /> {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
