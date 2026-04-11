import { create } from 'zustand';

interface StudentAttendanceState {
  qrScanned: boolean;
  attendanceSaved: boolean;
  
  setQrScanned: (status: boolean) => void;
  setAttendanceSaved: (status: boolean) => void;
  resetFlow: () => void;
}

export const useStudentAttendanceStore = create<StudentAttendanceState>((set) => ({
  qrScanned: false,
  attendanceSaved: false,
  
  setQrScanned: (status) => set({ qrScanned: status }),
  setAttendanceSaved: (status) => set({ attendanceSaved: status }),
  resetFlow: () => set({ 
    qrScanned: false, 
    attendanceSaved: false 
  }),
}));
