import { getNomadClient } from '../client';
import type { JobListStub, Job, JobSubmission, JobAction, JobScaleRequest, JobPlanRequest, JobPlanResponse, JobDispatchRequest, ParseRequest, ParseResponse } from '../types/job';
import type { AllocListStub } from '../types/allocation';
import type { Evaluation } from '../types/evaluation';
import type { Deployment } from '../types/deployment';
import { toParamsRecord, type QueryParams } from '../types/common';

export function getJobs(params?: QueryParams) {
  return getNomadClient().get<JobListStub[]>('/v1/jobs', toParamsRecord(params));
}

export function getJob(id: string, params?: QueryParams) {
  return getNomadClient().get<Job>(`/v1/job/${id}`, toParamsRecord(params));
}

export function createJob(job: Job, params?: QueryParams) {
  return getNomadClient().post<Job>('/v1/jobs', job, toParamsRecord(params));
}

export function updateJob(id: string, job: Job, params?: QueryParams) {
  return getNomadClient().post<Job>(`/v1/job/${id}`, job, toParamsRecord(params));
}

export function stopJob(id: string, params?: QueryParams) {
  return getNomadClient().delete<unknown>(`/v1/job/${id}`, toParamsRecord(params));
}

export function purgeJob(id: string, params?: QueryParams) {
  return getNomadClient().delete<unknown>(`/v1/job/${id}`, { ...toParamsRecord(params), purge: 'true' });
}

export function getJobAllocations(id: string, params?: QueryParams) {
  return getNomadClient().get<AllocListStub[]>(`/v1/job/${id}/allocations`, toParamsRecord(params));
}

export function getJobEvaluations(id: string, params?: QueryParams) {
  return getNomadClient().get<Evaluation[]>(`/v1/job/${id}/evaluations`, toParamsRecord(params));
}

export function getJobDeployments(id: string, params?: QueryParams) {
  return getNomadClient().get<Deployment[]>(`/v1/job/${id}/deployments`, toParamsRecord(params));
}

export function getJobVersions(id: string, params?: QueryParams) {
  return getNomadClient().get<{ Versions: Job[]; Diffs: unknown[] }>(`/v1/job/${id}/versions`, toParamsRecord(params));
}

export function getJobSummary(id: string, params?: QueryParams) {
  return getNomadClient().get<Job>(`/v1/job/${id}/summary`, toParamsRecord(params));
}

export function getJobLatestDeployment(id: string, params?: QueryParams) {
  return getNomadClient().get<Deployment>(`/v1/job/${id}/deployment`, toParamsRecord(params));
}

export function parseJob(request: ParseRequest, params?: QueryParams) {
  return getNomadClient().post<ParseResponse>('/v1/jobs/parse', request, toParamsRecord(params));
}

export function planJob(id: string, request: JobPlanRequest, params?: QueryParams) {
  return getNomadClient().post<JobPlanResponse>(`/v1/job/${id}/plan`, request, toParamsRecord(params));
}

export function dispatchJob(id: string, request: JobDispatchRequest, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/job/${id}/dispatch`, request, toParamsRecord(params));
}

export function revertJob(id: string, version: number, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/job/${id}/revert`, { JobID: id, JobVersion: version }, toParamsRecord(params));
}

export function scaleJob(id: string, request: JobScaleRequest, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/job/${id}/scale`, request, toParamsRecord(params));
}

export function forcePeriodicJob(id: string, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/job/${id}/periodic/force`, undefined, toParamsRecord(params));
}

export function evaluateJob(id: string, params?: QueryParams) {
  return getNomadClient().post<unknown>(`/v1/job/${id}/evaluate`, undefined, toParamsRecord(params));
}

export function getJobServices(id: string, params?: QueryParams) {
  return getNomadClient().get<unknown[]>(`/v1/job/${id}/services`, toParamsRecord(params));
}

export function getJobSubmission(id: string, params?: QueryParams) {
  return getNomadClient().get<JobSubmission>(`/v1/job/${id}/submission`, toParamsRecord(params));
}

export function getJobActions(id: string, params?: QueryParams) {
  return getNomadClient().get<JobAction[]>(`/v1/job/${id}/actions`, toParamsRecord(params));
}
