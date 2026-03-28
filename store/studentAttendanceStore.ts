import { create } from 'zustand';

interface StudentAttendanceState {
  qrScanned: boolean;
  bluetoothEnabled: boolean;
  beaconFound: boolean;
  attendanceSaved: boolean;
  
  setQrScanned: (status: boolean) => void;
  setBluetoothEnabled: (status: boolean) => void;
  setBeaconFound: (status: boolean) => void;
  setAttendanceSaved: (status: boolean) => void;
  resetFlow: () => void;
}

export const useStudentAttendanceStore = create<StudentAttendanceState>((set) => ({
  qrScanned: false,
  bluetoothEnabled: false,
  beaconFound: false,
  attendanceSaved: false,
  
  setQrScanned: (status) => set({ qrScanned: status }),
  setBluetoothEnabled: (status) => set({ bluetoothEnabled: status }),
  setBeaconFound: (status) => set({ beaconFound: status }),
  setAttendanceSaved: (status) => set({ attendanceSaved: status }),
  resetFlow: () => set({ 
    qrScanned: false, 
    bluetoothEnabled: false, 
    beaconFound: false, 
    attendanceSaved: false 
  }),
}));
