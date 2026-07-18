import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { queryClient } from '@/lib/queryClient';
import { repo } from '@/lib/repo';
import type { Session, UserRole } from '@/lib/types';

type SessionState = {
  ready: boolean;          // initial session restore finished
  session: Session | null;
  locked: boolean;         // app-lock gate
  lockEnabled: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<Session>;
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<Session>;
  signOut: () => Promise<void>;
  setLockEnabled: (on: boolean) => Promise<void>;
  unlock: () => Promise<boolean>;
};

const LOCK_KEY = 'keel-app-lock-enabled';

export const useSession = create<SessionState>((set, get) => ({
  ready: false,
  session: null,
  locked: false,
  lockEnabled: false,

  async init() {
    const [session, lockPref] = await Promise.all([repo.getSession(), AsyncStorage.getItem(LOCK_KEY)]);
    const lockEnabled = lockPref === '1' && Platform.OS !== 'web';
    set({ session, lockEnabled, locked: lockEnabled && !!session, ready: true });
  },

  async signIn(email, password) {
    const session = await repo.signIn(email, password);
    queryClient.clear(); // never show a previous account's cached data
    set({ session });
    return session;
  },

  async signUp(email, password, role, displayName) {
    const session = await repo.signUp(email, password, role, displayName);
    queryClient.clear();
    set({ session });
    return session;
  },

  async signOut() {
    await repo.signOut();
    queryClient.clear();
    set({ session: null, locked: false });
  },

  async setLockEnabled(on) {
    if (on && Platform.OS !== 'web') {
      const ok =
        (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
      if (!ok) return; // no biometrics available — leave off
    }
    await AsyncStorage.setItem(LOCK_KEY, on ? '1' : '0');
    set({ lockEnabled: on });
  },

  async unlock() {
    if (Platform.OS === 'web') {
      set({ locked: false });
      return true;
    }
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock Keel' });
    if (res.success) set({ locked: false });
    return res.success;
  },
}));
