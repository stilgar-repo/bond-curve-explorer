import { create } from "zustand";
import type { Bond, BqlSettings, HistoricalSpread } from "@/types/bond";
import { DEFAULT_BQL_SETTINGS } from "@/config/defaults";

interface AppState {
  /** BQL configuration */
  settings: BqlSettings;
  setSettings: (s: Partial<BqlSettings>) => void;

  /** Loaded data */
  bonds: Bond[];
  setBonds: (b: Bond[]) => void;
  spreads: HistoricalSpread[];
  setSpreads: (s: HistoricalSpread[]) => void;

  /** Currently selected bond — syncs all widgets */
  selectedBondId: string | null;
  setSelectedBondId: (id: string | null) => void;

  /** Currently hovered bond — cross-widget highlight */
  hoveredBondId: string | null;
  setHoveredBondId: (id: string | null) => void;

  /** Loading / error state */
  loading: boolean;
  setLoading: (l: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;

  /** Bloomberg connectivity */
  bloombergConnected: boolean | null;
  setBloombergConnected: (c: boolean | null) => void;
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
}));
