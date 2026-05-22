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

const handleAuthChange = async (session: any) => {
  try {
    if (session?.user) {
      // Only set isLoading to true if not already logged in
      if (!useAuthStore.getState().isLoggedIn) {
        useAuthStore.setState({ isLoading: true });
      }
      
      console.log('useAuthStore: Starting user profile fetch...');
      // Enforce a 2-second timeout on the profile database query
      const selectPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const timeoutPromise = new Promise<{ data: null; error: { message: string; code: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: 'Database request timed out', code: 'TIMEOUT' } }), 2000)
      );

      let { data: profile, error } = (await Promise.race([selectPromise, timeoutPromise])) as any;

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error.message || error);
      }

      // If the profile does not exist, and it wasn't a timeout, attempt to create it
      if (error?.code !== 'TIMEOUT' && (!profile || error?.code === 'PGRST116')) {
        console.log('useAuthStore: Profile not found, attempting to create one...');
        const initialProfile = {
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Usuario de Trainly',
          email: session.user.email || '',
          weight: Number(session.user.user_metadata?.weight || 70),
          target: session.user.user_metadata?.target || 'Rendimiento',
          level: 1,
          xp: 100,
        };

        const insertPromise = supabase
          .from('profiles')
          .insert(initialProfile)
          .select()
          .single();

        const insertTimeoutPromise = new Promise<{ data: null; error: { message: string; code: string } }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'Insert request timed out', code: 'TIMEOUT' } }), 2000)
        );

        let { data: insertedProfile, error: insertError } = (await Promise.race([insertPromise, insertTimeoutPromise])) as any;

        if (insertError) {
          console.warn('Error inserting full initial profile, attempting basic fallback:', insertError.message || insertError);
          
          if (insertError.code !== 'TIMEOUT') {
            const basicProfile = {
              id: session.user.id,
              name: session.user.user_metadata?.name || 'Usuario de Trainly',
              email: session.user.email || '',
            };
            const fallbackPromise = supabase
              .from('profiles')
              .insert(basicProfile)
              .select()
              .single();

            const { data: fallbackProfile, error: fallbackError } = (await Promise.race([fallbackPromise, insertTimeoutPromise])) as any;

            if (fallbackError) {
              console.error('Failed to create user profile even with basic fallback:', fallbackError.message || fallbackError);
            } else {
              profile = fallbackProfile;
            }
          }
        } else {
          profile = insertedProfile;
        }
      } else if (error?.code === 'TIMEOUT') {
        console.warn('useAuthStore: Profile fetch timed out, bypassing to use local fallback metadata.');
      } else {
        console.log('useAuthStore: Profile loaded successfully.');
      }

      const email = session.user.email || '';

      // Load fallback onboarding state and height from local storage
      let hasCompletedOnboarding = false;
      let localHeight = 170;
      try {
        const localOnb = await AppStorage.getItem(`onboarding_${email}`);
        hasCompletedOnboarding = localOnb === 'true' || !!profile?.has_completed_onboarding;
        
        const localHStr = await AppStorage.getItem(`height_${email}`);
        if (localHStr) {
          localHeight = Number(localHStr);
        }
      } catch (e) {
        console.error('Error reading local storage auth values:', e);
        hasCompletedOnboarding = !!profile?.has_completed_onboarding;
      }

      const weightVal = profile?.weight ? Number(profile.weight) : Number(session.user.user_metadata?.weight || 70);
      const heightVal = profile?.height ? Number(profile.height) : (localHeight || 170);

      useAuthStore.setState({
        isLoggedIn: true,
        user: {
          name: profile?.name || session.user.user_metadata?.name || 'Usuario de Trainly',
          email,
          weight: weightVal,
          target: profile?.target || session.user.user_metadata?.target || 'Rendimiento',
          level: profile?.level ? Number(profile.level) : 1,
          xp: profile?.xp ? Number(profile.xp) : 100,
          hasCompletedOnboarding,
        },
        isLoading: false,
      });

      // Synchronize activity store weights and heights
      try {
        const { useActivityStore } = require('./useActivityStore');
        useActivityStore.setState({
          userWeight: weightVal,
          userHeight: heightVal,
        });
        await useActivityStore.getState().loadUserData(email);
      } catch (e) {
        // Ignore if useActivityStore is not ready yet
      }
    } else {
      useAuthStore.setState({
        isLoggedIn: false,
        user: null,
        isLoading: false,
      });
      try {
        const { useActivityStore } = require('./useActivityStore');
        useActivityStore.getState().clearUserData();
      } catch (e) {
        // Ignore if useActivityStore is not ready yet
      }
    }
  } catch (err) {
    console.error('Global error in auth change handler:', err);
    // CRITICAL: Ensure we clear loading status so the UI doesn't hang!
    useAuthStore.setState({ isLoading: false });
  }
};

// Safety fallback: if the app is still loading after 4.5 seconds, force loading to end.
// We do not cancel this timeout to make sure it always acts as an absolute guarantee.
const safetyTimeout = setTimeout(() => {
  if (useAuthStore.getState().isLoading) {
    console.warn('Global safety timeout triggered: loading took too long, forcing isLoading to false.');
    useAuthStore.setState({ isLoading: false });
  }
}, 4500);

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

