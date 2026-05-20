import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVehicles, addVehicle, deleteVehicle, type AddVehiclePayload } from '@/api/users';
import { QUERY_KEYS } from '@/constants/query-keys';

export function useVehicles() {
  return useQuery({
    queryKey: QUERY_KEYS.vehicles.all,
    queryFn: getVehicles,
  });
}

export function useAddVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddVehiclePayload) => addVehicle(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
