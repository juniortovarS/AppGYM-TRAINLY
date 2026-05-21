import { create } from 'zustand';

export interface User {
  name: string;
  email: string;
  weight: number;      // in kg
  target: string;      // e.g. "Fat Loss", "Strength", "Endurance", "Performance"
  level: number;       // gamification level
  xp: number;          // gamification XP
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, weight: number, target: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    name: 'Alex Rivera',
    email: 'alex@trainly.io',
    weight: 78,
    target: 'Performance',
    level: 12,
    xp: 4250,
  },
  isLoggedIn: false, // Start at auth gate to demonstrate transition
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Default mock user is Alex
    set({
      isLoggedIn: true,
      isLoading: false,
      user: {
        name: 'Alex Rivera',
        email: email,
        weight: 78,
        target: 'Performance',
        level: 12,
        xp: 4250,
      },
    });
    return true;
  },

  register: async (name, email, weight, target) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    set({
      isLoggedIn: true,
      isLoading: false,
      user: {
        name,
        email,
        weight,
        target,
        level: 1,
        xp: 100,
      },
    });
    return true;
  },

  logout: () => {
    set({ isLoggedIn: false, user: null });
  },

  updateProfile: (data) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },
}));
