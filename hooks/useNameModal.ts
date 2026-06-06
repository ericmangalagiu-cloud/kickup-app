import { create } from 'zustand'

interface NameModalStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useNameModal = create<NameModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
