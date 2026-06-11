import { useBlockingQuery } from '@/hooks/use-blocking-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getJobVersions,
  getJobServices,
  getJobSubmission,
  getJobActions,
  createJob,
  updateJob,
  stopJob,
  purgeJob,
  parseJob,
  planJob,
  dispatchJob,
  revertJob,
  scaleJob,
  forcePeriodicJob,
  evaluateJob,
} from '@/api/resources/jobs';
import { toParamsRecord, type QueryParams } from '@/api/types/common';
import type { Job, JobListStub, JobPlanRequest, JobScaleRequest, JobDispatchRequest, ParseRequest } from '@/api/types/job';

export function useJobList(params?: QueryParams) {
  return useBlockingQuery<JobListStub[]>(
    ['jobs', 'list', JSON.stringify(params)],
    '/v1/jobs',
    { params: toParamsRecord(params) }
  );
}

export function useJob(id: string) {
  return useBlockingQuery<Job>(
    ['jobs', 'detail', id],
    `/v1/job/${id}`,
    { throttleMs: 1000 }
  );
}

export function useJobAllocations(id: string, params?: QueryParams) {
  return useBlockingQuery(
    ['jobs', 'allocations', id, JSON.stringify(params)],
    `/v1/job/${id}/allocations`,
    { params: toParamsRecord(params) }
  );
}

export function useJobEvaluations(id: string, params?: QueryParams) {
  return useBlockingQuery(
    ['jobs', 'evaluations', id, JSON.stringify(params)],
    `/v1/job/${id}/evaluations`,
    { params: toParamsRecord(params) }
  );
}

export function useJobDeployments(id: string, params?: QueryParams) {
  return useBlockingQuery(
    ['jobs', 'deployments', id, JSON.stringify(params)],
    `/v1/job/${id}/deployments`,
    { params: toParamsRecord(params) }
  );
}

export function useJobVersions(id: string, params?: QueryParams) {
  return useQuery({
    queryKey: ['jobs', 'versions', id, JSON.stringify(params)],
    queryFn: () => getJobVersions(id, params),
  });
}

export function useJobSummary(id: string) {
  return useBlockingQuery(
    ['jobs', 'summary', id],
    `/v1/job/${id}/summary`,
  );
}

export function useJobLatestDeployment(id: string) {
  return useBlockingQuery(
    ['jobs', 'latest-deployment', id],
    `/v1/job/${id}/deployment`,
  );
}

export function useJobServices(id: string) {
  return useQuery({
    queryKey: ['jobs', 'services', id],
    queryFn: () => getJobServices(id),
  });
}

export function useJobSubmission(id: string) {
  return useQuery({
    queryKey: ['jobs', 'submission', id],
    queryFn: () => getJobSubmission(id),
  });
}

export function useJobActions(id: string) {
  return useQuery({
    queryKey: ['jobs', 'actions', id],
    queryFn: () => getJobActions(id),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (job: Job) => createJob(job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, job }: { id: string; job: Job }) => updateJob(id, job),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'detail', variables.id] });
    },
  });
}

export function useStopJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stopJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function usePurgeJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purgeJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useParseJob() {
  return useMutation({
    mutationFn: (request: ParseRequest) => parseJob(request),
  });
}

export function usePlanJob() {
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: JobPlanRequest }) => planJob(id, request),
  });
}

export function useDispatchJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: JobDispatchRequest }) => dispatchJob(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useRevertJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => revertJob(id, version),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'detail', variables.id] });
    },
  });
}

export function useScaleJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: JobScaleRequest }) => scaleJob(id, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'detail', variables.id] });
    },
  });
}

export function useForcePeriodicJob() {
  return useMutation({
    mutationFn: (id: string) => forcePeriodicJob(id),
  });
}

export function useEvaluateJob() {
  return useMutation({
    mutationFn: (id: string) => evaluateJob(id),
  });
}
