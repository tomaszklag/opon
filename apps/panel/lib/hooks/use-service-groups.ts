'use client';

import { useEffect, useState } from 'react';
import { serviceGroupsApi, type ServiceGroupResponse } from '../../api-data-access/service-groups';

export function useServiceGroups() {
  const [groups, setGroups] = useState<ServiceGroupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    serviceGroupsApi
      .list()
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { groups, isLoading };
}
