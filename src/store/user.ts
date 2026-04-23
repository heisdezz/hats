import type { ProfileRecord } from "pocketbase-types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PROFILE {
  profile: ProfileRecord | null;
  setProfile: (data: ProfileRecord) => void;
  clearProfile: () => void;
}

export const useProfile = create<PROFILE>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (data: ProfileRecord) => set({ profile: data }),
      clearProfile: () => set({ profile: null }),
    }),
    { name: "profile" },
  ),
);
