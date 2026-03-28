import { create } from 'zustand';

interface AttendanceState {
  qrPhase: boolean;
  bluetoothPhase: boolean;
  scannedCount: number;
  connectedCount: number;
  
  setQrPhase: (phase: boolean) => void;
  setBluetoothPhase: (phase: boolean) => void;
  setScannedCount: (count: number) => void;
  setConnectedCount: (count: number) => void;
  incrementScannedCount: () => void;
  incrementConnectedCount: () => void;
  resetFlow: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  qrPhase: true,
  bluetoothPhase: false,
  scannedCount: 0,
  connectedCount: 0,
  
  setQrPhase: (phase) => set({ qrPhase: phase }),
  setBluetoothPhase: (phase) => set({ bluetoothPhase: phase }),
  setScannedCount: (count) => set({ scannedCount: count }),
  setConnectedCount: (count) => set({ connectedCount: count }),
  incrementScannedCount: () => set((state) => ({ scannedCount: state.scannedCount + 1 })),
  incrementConnectedCount: () => set((state) => ({ connectedCount: state.connectedCount + 1 })),
  resetFlow: () => set({ 
    qrPhase: true, 
    bluetoothPhase: false, 
    scannedCount: 0, 
    connectedCount: 0 
  }),
}));
