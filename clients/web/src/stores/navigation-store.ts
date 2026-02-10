import { create } from 'zustand'

interface NavigationStore {
  canNavigate: boolean
  setCanNavigate: (canNavigate: boolean) => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  canNavigate: true,
  setCanNavigate: (canNavigate) => set({ canNavigate }),
}))

