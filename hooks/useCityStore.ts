import { create } from 'zustand'

export const ROMANIAN_CITIES = [
  'București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța',
  'Craiova', 'Brașov', 'Galați', 'Ploiești', 'Oradea',
  'Brăila', 'Arad', 'Pitești', 'Sibiu', 'Bacău',
  'Târgu Mureș', 'Baia Mare', 'Buzău', 'Satu Mare', 'Râmnicu Vâlcea',
]

interface CityStore {
  selectedCity: string
  setCity: (city: string) => void
}

export const useCityStore = create<CityStore>((set) => ({
  selectedCity: '',
  setCity: (city) => set({ selectedCity: city }),
}))
