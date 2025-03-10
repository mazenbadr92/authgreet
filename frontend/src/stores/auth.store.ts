import { create } from "zustand";

interface AuthStore {
  accessToken: string;
  setAccessToken: (accessToken: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: "",
  setAccessToken: (accessToken) => {
    set({ accessToken: accessToken });
  },
}));
