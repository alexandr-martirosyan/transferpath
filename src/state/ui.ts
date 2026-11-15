import { create } from 'zustand'

/** Non-persisted UI state. */
export const useUI = create<{ setupOpen: boolean; openSetup: () => void; closeSetup: () => void }>((set) => ({
  setupOpen: false,
  openSetup: () => set({ setupOpen: true }),
  closeSetup: () => set({ setupOpen: false }),
}))
