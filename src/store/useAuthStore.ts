import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';
import AppStorage from '../lib/storage';

export interface User {
  name: string;
  email: string;
  weight: number;      // in kg
  target: string;      // e.g. "Pérdida de Grasa", "Fuerza & Hipertrofia", "Resistencia", "Rendimiento"
  level: number;       // gamification level
  xp: number;          // gamification XP
  hasCompletedOnboarding?: boolean;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string, weight: number, target: string) => Promise<{ success: boolean; sessionCreated: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  completeOnboarding: (weight: number, height: number, target: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true, // Start loading until session is checked

  login: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false });
      throw error;
    }

    set({ isLoading: false });
    return !!data.user;
  },

  loginWithGoogle: async () => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: Platform.OS === 'web' ? window.location.origin : 'trainly://',
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      set({ isLoading: false });
      throw error;
    }

    set({ isLoading: false });
    return true;
  },

  register: async (name, email, password, weight, target) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          weight,
          target,
        },
      },
    });

    if (error) {
      set({ isLoading: false });
      throw error;
    }

    const sessionCreated = !!data.session;
    set({ isLoading: false });

    return {
      success: !!data.user,
      sessionCreated,
    };
  },

  logout: async () => {
    // Clear local auth state immediately so user sees the login screen without delay
    set({ isLoggedIn: false, user: null, isLoading: false });
    try {
      const { useActivityStore } = require('./useActivityStore');
      useActivityStore.getState().clearUserData();
    } catch (e) {
      // Ignore if useActivityStore is not ready yet
    }
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during signOut:', error);
    }
  },

  updateProfile: async (data) => {
    const currentUser = get().user;
    if (!currentUser) return;

    // Update local state first
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));

    // Update in database
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (userId) {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          weight: data.weight,
          target: data.target,
          level: data.level,
          xp: data.xp,
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating profiles in database:', error);
      }
    }
  },

  completeOnboarding: async (weight, height, target) => {
    const currentUser = get().user;
    if (!currentUser) return;

    // Update local state first
    set((state) => ({
      user: state.user ? { ...state.user, weight, target, hasCompletedOnboarding: true } : null,
    }));

    // Persist state in AppStorage
    try {
      await AppStorage.setItem(`onboarding_${currentUser.email}`, 'true');
      await AppStorage.setItem(`height_${currentUser.email}`, String(height));
    } catch (e) {
      console.error('Error storing local onboarding state:', e);
    }

    // Sync to useActivityStore if available
    try {
      const { useActivityStore } = require('./useActivityStore');
      useActivityStore.setState({
        userWeight: weight,
        userHeight: height,
      });
    } catch (e) {
      console.error('Error syncing to ActivityStore:', e);
    }

    // Sync to Supabase Database
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (userId) {
      const { error } = await supabase
        .from('profiles')
        .update({
          weight,
          target,
          has_completed_onboarding: true,
        })
        .eq('id', userId);

      if (error) {
        console.warn('Error saving onboarding data to profiles DB (possibly missing column):', error.message);
        // Fallback: update weight and target which are always available
        await supabase
          .from('profiles')
          .update({ weight, target })
          .eq('id', userId);
      }
    }
  },
}));

let hasProcessedInitial = false;
let isProcessingAuth = false;

const handleAuthChange = async (session: any) => {
  if (isProcessingAuth) {
    console.log('useAuthStore: handleAuthChange skipped to prevent concurrent execution.');
    return;
  }
  isProcessingAuth = true;
  try {
    if (session?.user) {
      if (!useAuthStore.getState().isLoggedIn) {
        useAuthStore.setState({ isLoading: true });
      }

      const email = session.user.email || '';
      const meta = session.user.user_metadata || {};

      // --- STEP 1: Log in IMMEDIATELY using session metadata (never blocks on DB) ---
      let hasCompletedOnboarding = false;
      try {
        const localOnb = await AppStorage.getItem(`onboarding_${email}`);
        hasCompletedOnboarding = localOnb === 'true';
      } catch (e) { /* ignore */ }

      useAuthStore.setState({
        isLoggedIn: true,
        isLoading: false,
        user: {
          name: meta.name || meta.full_name || 'Usuario de Trainly',
          email,
          weight: Number(meta.weight || 70),
          target: meta.target || 'Rendimiento',
          level: 1,
          xp: 100,
          hasCompletedOnboarding,
        },
      });

      // Load activity data in background
      try {
        const { useActivityStore } = require('./useActivityStore');
        useActivityStore.setState({ userWeight: Number(meta.weight || 70) });
        useActivityStore.getState().loadUserData(email);
      } catch (e) { /* ignore */ }

      // --- STEP 2: Sync with DB in background (non-blocking) ---
      (async () => {
        try {
          // Try to fetch profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error?.code === 'PGRST116' || (!profile && !error)) {
            // New user - create profile in background
            console.log('useAuthStore: Creating profile for new user in background...');
            const initialProfile = {
              id: session.user.id,
              name: meta.name || meta.full_name || 'Usuario de Trainly',
              email,
              weight: Number(meta.weight || 70),
              target: meta.target || 'Rendimiento',
              level: 1,
              xp: 100,
            };
            const { data: inserted, error: insertErr } = await supabase
              .from('profiles')
              .insert(initialProfile)
              .select()
              .single();

            if (insertErr) {
              console.warn('useAuthStore: Could not create profile:', insertErr.message);
            } else if (inserted) {
              // Update state with freshly created profile (non-breaking update)
              useAuthStore.setState((s) => ({
                user: s.user ? {
                  ...s.user,
                  level: Number(inserted.level || 1),
                  xp: Number(inserted.xp || 100),
                } : s.user,
              }));
            }
          } else if (profile) {
            // Existing user - update state with real DB values
            console.log('useAuthStore: Profile loaded from DB.');
            let hasCompletedOnboardingDB = false;
            try {
              const localOnb = await AppStorage.getItem(`onboarding_${email}`);
              hasCompletedOnboardingDB = localOnb === 'true' || !!profile.has_completed_onboarding;
            } catch (e) {
              hasCompletedOnboardingDB = !!profile.has_completed_onboarding;
            }

            useAuthStore.setState((s) => ({
              user: s.user ? {
                ...s.user,
                name: profile.name || s.user.name,
                weight: Number(profile.weight || s.user.weight),
                target: profile.target || s.user.target,
                level: Number(profile.level || 1),
                xp: Number(profile.xp || 100),
                hasCompletedOnboarding: hasCompletedOnboardingDB,
              } : s.user,
            }));

            // Reload activity data with correct profile info
            try {
              const { useActivityStore } = require('./useActivityStore');
              useActivityStore.setState({
                userWeight: Number(profile.weight || 70),
                userHeight: Number(profile.height || 170),
              });
            } catch (e) { /* ignore */ }
          }
        } catch (dbErr) {
          console.warn('useAuthStore: Background DB sync failed (non-critical):', dbErr);
        }
      })();

    } else {
      useAuthStore.setState({
        isLoggedIn: false,
        user: null,
        isLoading: false,
      });
      try {
        const { useActivityStore } = require('./useActivityStore');
        useActivityStore.getState().clearUserData();
      } catch (e) { /* ignore */ }
    }

  } catch (err) {
    console.error('Global error in auth change handler:', err);
    // CRITICAL: Ensure we clear loading status so the UI doesn't hang!
    useAuthStore.setState({ isLoading: false });
  } finally {
    isProcessingAuth = false;
  }
};

// Safety fallback: if the app is still loading after 15 seconds, force loading to end.
// We do not cancel this timeout to make sure it always acts as an absolute guarantee.
const safetyTimeout = setTimeout(() => {
  if (useAuthStore.getState().isLoading) {
    console.warn('Global safety timeout triggered: loading took too long, forcing isLoading to false.');
    useAuthStore.setState({ isLoading: false });
  }
}, 15000);

// Setup active session listener on auth status changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'INITIAL_SESSION' && hasProcessedInitial) {
    return;
  }
  console.log(`useAuthStore: onAuthStateChange triggered with event: ${event}`);
  hasProcessedInitial = true;
  await handleAuthChange(session);
});

// Run immediate check for initial load in case onAuthStateChange is not fired or delayed
supabase.auth.getSession().then(({ data: { session } }) => {
  if (!hasProcessedInitial) {
    console.log('useAuthStore: getSession resolved before auth listener');
    hasProcessedInitial = true;
    handleAuthChange(session);
  }
}).catch((err) => {
  console.error('Error during initial session check:', err);
  useAuthStore.setState({ isLoading: false });
});

