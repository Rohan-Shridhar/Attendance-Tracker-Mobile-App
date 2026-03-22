import { create } from 'zustand';

interface StudentsState {
  sortType: 'name' | 'attendance';
  setSortType: (type: 'name' | 'attendance') => void;
}

export const useStudentsStore = create<StudentsState>((set) => ({
  sortType: 'name',
  setSortType: (type) => set({ sortType: type }),
}));
