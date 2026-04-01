import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Star } from 'lucide-react';
import { MOOD_EMOJIS, type CheckIn } from '@/types/health';

interface DailyCheckInProps {
  todayCheckIn: CheckIn | undefined;
  streak: number;
  onCheckIn: (mood: CheckIn['mood'], note?: string, sameAsYesterday?: boolean) => void;
  lastCheckIn?: CheckIn | null;
}

const ENCOURAGEMENT = {
  streak: [
    { min: 1, max: 3, msg: "Every check-in counts 💛" },
    { min: 4, max: 6, msg: "You're building a picture — keep going 💛" },
    { min: 7, max: 13, msg: "7 days strong — your data is getting powerful ✨" },
    { min: 14, max: 29, msg: "Two weeks of consistency — amazing 🌟" },
    { min: 30, max: Infinity, msg: "A whole month! You're incredible 🌿" },
  ],
  lowMood: [
    "Tough days matter too — tracking helps 💛",
    "It's okay to not be okay. You're still here 🌿",
    "Your honesty makes your data stronger 💛",
  ],
  highMood: [
    "Great to see a good day! 🌟",
    "Love seeing you feel well ✨",
    "What a win — celebrate this 💛",
  ],
};

function getEncouragement(mood: number, streak: number): string {
  if (mood <= 2) {
    return ENCOURAGEMENT.lowMood[Math.floor(Math.random() * ENCOURAGEMENT.lowMood.length)];
  }
  if (mood >= 4) {
    return ENCOURAGEMENT.highMood[Math.floor(Math.random() * ENCOURAGEMENT.highMood.length)];
  }
  const s = ENCOURAGEMENT.streak.find(r => streak >= r.min && streak <= r.max);
  return s?.msg || "Nice job staying consistent 💛";
}

export function DailyCheckIn({ todayCheckIn, streak, onCheckIn, lastCheckIn }: DailyCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<CheckIn['mood'] | null>(null);
  const [note, setNote] = useState('');
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMsg, setEncouragementMsg] = useState('');
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const handleSubmit = (sameAsYesterday = false) => {
    const mood = sameAsYesterday && lastCheckIn ? lastCheckIn.mood : selectedMood;
    if (!mood) return;
    const n = sameAsYesterday && lastCheckIn?.note ? lastCheckIn.note : (note || undefined);
    onCheckIn(mood, n, sameAsYesterday);
    setEncouragementMsg(getEncouragement(mood, streak + 1));
    setShowEncouragement(true);
    setJustCheckedIn(true);
    setTimeout(() => setShowEncouragement(false), 3500);
  };

  if (todayCheckIn && !justCheckedIn) {
    return (
      <div className="bg-sage-light rounded-2xl p-5 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{greeting}</p>
            <p className="font-semibold text-foreground">Today's check-in complete</p>
          </div>
          <div className="text-3xl">{MOOD_EMOJIS.find(m => m.value === todayCheckIn.mood)?.emoji}</div>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {streak} day streak
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 border border-border shadow-sm relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-muted-foreground">{greeting}</p>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-xs text-primary font-medium">
            <Sparkles className="w-3.5 h-3.5" /> {streak} day streak
          </div>
        )}
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-4">How are you feeling today?</h2>

      <div className="flex justify-between mb-4">
        {MOOD_EMOJIS.map(({ value, emoji, label }) => (
          <button
            key={value}
            onClick={() => setSelectedMood(value)}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
              selectedMood === value
                ? 'bg-primary/10 scale-110 ring-2 ring-primary/30'
                : 'hover:bg-accent'
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Any notes? (optional)"
        className="w-full bg-muted/50 border-0 rounded-xl p-3 text-sm resize-none h-16 placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary/30 focus:outline-none mb-3"
      />

      <div className="flex gap-2">
        <button
          onClick={() => handleSubmit(false)}
          disabled={!selectedMood}
          className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          Check in
        </button>
        {lastCheckIn && (
          <button
            onClick={() => handleSubmit(true)}
            className="px-3 bg-accent text-accent-foreground rounded-xl py-2.5 text-xs font-medium hover:bg-accent/80 transition-colors"
          >
            Same as yesterday
          </button>
        )}
      </div>

      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute inset-x-0 bottom-0 bg-sage-light border-t border-secondary/20 px-5 py-3 flex items-center gap-2"
          >
            <Heart className="w-4 h-4 text-secondary fill-secondary" />
            <span className="text-sm font-medium text-foreground">{encouragementMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
