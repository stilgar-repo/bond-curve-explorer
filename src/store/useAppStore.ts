import { create } from "zustand";
import type { Bond, BqlSettings, HistoricalSpread } from "@/types/bond";
import { DEFAULT_BQL_SETTINGS } from "@/config/defaults";

export type FontScale = "compact" | "default" | "large";

interface AppState {
  settings: BqlSettings;
  setSettings: (s: Partial<BqlSettings>) => void;

  bonds: Bond[];
  setBonds: (b: Bond[]) => void;
  spreads: HistoricalSpread[];
  setSpreads: (s: HistoricalSpread[]) => void;

  selectedBondId: string | null;
  setSelectedBondId: (id: string | null) => void;

  hoveredBondId: string | null;
  setHoveredBondId: (id: string | null) => void;

  loading: boolean;
  setLoading: (l: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;

  bloombergConnected: boolean | null;
  setBloombergConnected: (c: boolean | null) => void;

  /** Font scaling: compact (14px), default (16px), large (18px) */
  fontScale: FontScale;
  setFontScale: (s: FontScale) => void;

  /** High contrast mode */
  highContrast: boolean;
  setHighContrast: (hc: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: { ...DEFAULT_BQL_SETTINGS },
  setSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

  bonds: [],
  setBonds: (bonds) => set({ bonds }),
  spreads: [],
  setSpreads: (spreads) => set({ spreads }),

  selectedBondId: null,
  setSelectedBondId: (selectedBondId) => set({ selectedBondId }),

  hoveredBondId: null,
  setHoveredBondId: (hoveredBondId) => set({ hoveredBondId }),

  loading: false,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),

  bloombergConnected: null,
  setBloombergConnected: (bloombergConnected) => set({ bloombergConnected }),

  fontScale: (localStorage.getItem("bond-font-scale") as FontScale) || "default",
  setFontScale: (fontScale) => {
    localStorage.setItem("bond-font-scale", fontScale);
    set({ fontScale });
  },

  highContrast: localStorage.getItem("bond-high-contrast") === "true",
  setHighContrast: (highContrast) => {
    localStorage.setItem("bond-high-contrast", String(highContrast));
    set({ highContrast });
  },
}));
