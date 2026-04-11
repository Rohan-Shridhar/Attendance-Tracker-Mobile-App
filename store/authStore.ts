import { create } from 'zustand';

export type Role = 'teacher' | 'student';

export interface User {
  name: string;
  role: Role;
  token: string;
  // Student fields
  usn?: string;
  gender?: string;
  // Teacher fields
  email?: string;
  subject_id?: string;
  subject?: string;
}

interface AuthState {
  user: User | null;
  role: Role | null;
  isLoggedIn: boolean;
  setAuth: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoggedIn: false,
  setAuth: (user: User) => {
    set({
      user,
      role: user.role,
      isLoggedIn: true,
    });
  },
  logout: () => set({ user: null, role: null, isLoggedIn: false }),
}));
