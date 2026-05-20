import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '../lib/secure-storage';

interface VehicleState {
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set) => ({
      selectedVehicleId: null,
      setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
    }),
    {
      name: 'opony_vehicle',
      storage: createJSONStorage(() => secureStorage.zustandAdapter),
    },
  ),
);
