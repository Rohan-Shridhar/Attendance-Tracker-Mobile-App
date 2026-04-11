import { create } from 'zustand';

interface AttendanceState {
  qrPhase: boolean;
  scannedCount: number;
  
  setQrPhase: (phase: boolean) => void;
  setScannedCount: (count: number) => void;
  incrementScannedCount: () => void;
  resetFlow: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  qrPhase: true,
  scannedCount: 0,
  
  setQrPhase: (phase) => set({ qrPhase: phase }),
  setScannedCount: (count) => set({ scannedCount: count }),
  incrementScannedCount: () => set((state) => ({ scannedCount: state.scannedCount + 1 })),
  resetFlow: () => set({ 
    qrPhase: true, 
    scannedCount: 0, 
  }),
}));
