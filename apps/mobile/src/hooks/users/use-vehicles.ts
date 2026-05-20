import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { getVehicles, addVehicle, deleteVehicle, type AddVehiclePayload } from '@/api/users';
import { QUERY_KEYS } from '@/constants/query-keys';

async function assertOnline() {
  const state = await NetInfo.fetch();
  if (!state.isConnected) throw new Error('Brak połączenia z internetem');
}

export function useVehicles() {
  return useQuery({
    queryKey: QUERY_KEYS.vehicles.all,
    queryFn: getVehicles,
  });
}

export function useAddVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AddVehiclePayload) => {
      await assertOnline();
      return addVehicle(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await assertOnline();
      return deleteVehicle(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
