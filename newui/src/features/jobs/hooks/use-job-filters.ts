import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom';
import type { QueryParams } from '@/api/types/common';

const JOB_STATUSES = ['running', 'pending', 'failed', 'dead'] as const;
const JOB_TYPES = ['service', 'batch', 'system', 'sysbatch'] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];
export type JobType = (typeof JOB_TYPES)[number];

export interface JobFilters {
  search: string;
  statuses: JobStatus[];
  types: JobType[];
  namespace: string;
  nodePool: string;
}

function parseFilterExpression(search: string): { prefix: string; value: string }[] {
  const filters: { prefix: string; value: string }[] = [];
  const regex = /(\w+):("[^"]*"|\S+)/g;
  let match;
  while ((match = regex.exec(search)) !== null) {
    const value = match[2]!.replace(/^"|"$/g, '');
    filters.push({ prefix: match[1]!.toLowerCase(), value });
  }
  return filters;
}

export function useJobFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: JobFilters = useMemo(() => {
    const search = searchParams.get('search') ?? '';
    const statusParam = searchParams.get('status') ?? '';
    const typeParam = searchParams.get('type') ?? '';
    const namespace = searchParams.get('namespace') ?? '';
    const nodePool = searchParams.get('nodePool') ?? '';

    return {
      search,
      statuses: statusParam ? (statusParam.split(',') as JobStatus[]) : [],
      types: typeParam ? (typeParam.split(',') as JobType[]) : [],
      namespace,
      nodePool,
    };
  }, [searchParams]);

  const setSearch = useCallback(
    (search: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (search) next.set('search', search);
        else next.delete('search');
        return next;
      });
    },
    [setSearchParams]
  );

  const setStatuses = useCallback(
    (statuses: JobStatus[]) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (statuses.length > 0) next.set('status', statuses.join(','));
        else next.delete('status');
        return next;
      });
    },
    [setSearchParams]
  );

  const setTypes = useCallback(
    (types: JobType[]) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (types.length > 0) next.set('type', types.join(','));
        else next.delete('type');
        return next;
      });
    },
    [setSearchParams]
  );

  const setNamespace = useCallback(
    (namespace: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (namespace) next.set('namespace', namespace);
        else next.delete('namespace');
        return next;
      });
    },
    [setSearchParams]
  );

  const setNodePool = useCallback(
    (nodePool: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (nodePool) next.set('nodePool', nodePool);
        else next.delete('nodePool');
        return next;
      });
    },
    [setSearchParams]
  );

  const toggleStatus = useCallback(
    (status: string) => {
      const s = status as JobStatus;
      const next = filters.statuses.includes(s)
        ? filters.statuses.filter((x) => x !== s)
        : [...filters.statuses, s];
      setStatuses(next);
    },
    [filters.statuses, setStatuses]
  );

  const toggleType = useCallback(
    (type: string) => {
      const t = type as JobType;
      const next = filters.types.includes(t)
        ? filters.types.filter((x) => x !== t)
        : [...filters.types, t];
      setTypes(next);
    },
    [filters.types, setTypes]
  );

  const clearAll = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const apiParams = useMemo((): QueryParams => {
    const params: QueryParams = {};
    const filterParts: string[] = [];

    if (filters.search && !filters.search.includes(':')) {
      params.prefix = filters.search;
    }

    const parsed = parseFilterExpression(filters.search);
    for (const { prefix, value } of parsed) {
      if (prefix === 'status' || prefix === 'type' || prefix === 'namespace' || prefix === 'nodepool') continue;
      filterParts.push(`${prefix} == "${value}"`);
    }

    if (filters.statuses.length > 0) {
      const statusFilter = filters.statuses.map((s) => `Status == "${s}"`).join(' or ');
      filterParts.push(`(${statusFilter})`);
    }

    if (filters.types.length > 0) {
      const typeFilter = filters.types.map((t) => `Type == "${t}"`).join(' or ');
      filterParts.push(`(${typeFilter})`);
    }

    if (filters.namespace) {
      params.namespace = filters.namespace;
    }

    if (filters.nodePool) {
      filterParts.push(`NodePool == "${filters.nodePool}"`);
    }

    if (filterParts.length > 0) {
      params.filter = filterParts.join(' and ');
    }

    return params;
  }, [filters]);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.statuses.length > 0 ||
    filters.types.length > 0 ||
    filters.namespace !== '' ||
    filters.nodePool !== '';

  return {
    filters,
    setSearch,
    setStatuses,
    setTypes,
    setNamespace,
    setNodePool,
    toggleStatus,
    toggleType,
    clearAll,
    apiParams,
    hasActiveFilters,
  };
}
