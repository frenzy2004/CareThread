import { Check, Circle, TrendingUp, TrendingDown, Minus, Trash2, Pause, ChevronRight } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Medication, MedEffectRating, MedCompliance } from '@/types/health';

interface MedicationCardProps {
  medication: Medication;
  ratings: MedEffectRating[];
  todayCompliance?: MedCompliance;
  onToggleCompliance: (taken: boolean) => void;
  onRate: (rating: MedEffectRating['rating']) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onDiscontinue?: () => void;
  showEffectRating?: boolean;
}

const RATING_ICON = {
  better: { icon: TrendingUp, label: 'Better', cls: 'text-secondary' },
  same: { icon: Minus, label: 'Same', cls: 'text-muted-foreground' },
  worse: { icon: TrendingDown, label: 'Worse', cls: 'text-primary' },
};

export function MedicationCard({
  medication, ratings, todayCompliance, onToggleCompliance, onRate, onDelete, onEdit, onDiscontinue, showEffectRating,
}: MedicationCardProps) {
  const latestRating = ratings.filter(r => r.medicationId === medication.id)[0];

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between mb-2">
        {/* Tappable name/details area — only interactive if onEdit exists */}
        {onEdit ? (
          <button
            onClick={onEdit}
            aria-label={`Edit ${medication.name}`}
            className="flex-1 min-w-0 text-left group"
            type="button"
          >
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-foreground text-sm">{medication.name}</h3>
              <ChevronRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground">{medication.dosage} · {medication.frequency}</p>
            {medication.drugClass && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">{medication.drugClass}</p>
            )}
          </button>
        ) : (
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">{medication.name}</h3>
            <p className="text-xs text-muted-foreground">{medication.dosage} · {medication.frequency}</p>
            {medication.drugClass && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">{medication.drugClass}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {/* Compliance toggle */}
          <button
            onClick={() => onToggleCompliance(!(todayCompliance?.taken))}
            aria-label={todayCompliance?.taken ? `Mark ${medication.name} as not taken` : `Mark ${medication.name} as taken`}
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
              todayCompliance?.taken
                ? 'bg-secondary/15 border-secondary/30 text-secondary'
                : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            {todayCompliance?.taken ? <Check className="w-4 h-4" /> : <Circle className="w-3.5 h-3.5 opacity-40" />}
          </button>

          {/* Discontinue */}
          {onDiscontinue && (
            <button
              onClick={onDiscontinue}
              aria-label={`Discontinue ${medication.name}`}
              className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete with confirmation */}
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  aria-label={`Delete ${medication.name}`}
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete medication?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This can't be undone. To preserve history, discontinue instead.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
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
                  aria-label={`Rate ${medication.name} as ${label}`}
                  aria-pressed={active}
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
