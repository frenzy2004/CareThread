import React, { createContext, useContext } from 'react';
import { useHealthData } from '@/hooks/useHealthData';

type HealthDataContextType = ReturnType<typeof useHealthData>;

const HealthDataContext = createContext<HealthDataContextType | null>(null);

export function HealthDataProvider({ children }: { children: React.ReactNode }) {
  const healthData = useHealthData();
  return (
    <HealthDataContext.Provider value={healthData}>
      {children}
    </HealthDataContext.Provider>
  );
}

export function useHealthDataContext(): HealthDataContextType {
  const ctx = useContext(HealthDataContext);
  if (!ctx) {
    throw new Error('useHealthDataContext must be used within a HealthDataProvider');
  }
  return ctx;
}
