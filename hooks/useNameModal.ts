import { create } from 'zustand'

interface NameModalStore {
  isOpen: boolean
  redirectTo: string | null
  open: (redirectTo?: string) => void
  close: () => void
}

export const useNameModal = create<NameModalStore>((set) => ({
  isOpen: false,
  redirectTo: null,
  open: (redirectTo?: string) => set({ isOpen: true, redirectTo: redirectTo ?? null }),
  close: () => set({ isOpen: false, redirectTo: null }),
}))
