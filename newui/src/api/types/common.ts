export interface QueryParams {
  region?: string;
  namespace?: string;
  prefix?: string;
  filter?: string;
  per_page?: number;
  next_token?: string;
  reverse?: boolean;
  wait?: string;
  index?: number;
  stale?: boolean;
  pretty?: boolean;
  task?: string;
}

export function toParamsRecord(params?: QueryParams): Record<string, string> | undefined {
  if (!params) return undefined;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      result[key] = String(value);
    }
  }
  return result;
}

export interface ApiResponse<T> {
  data: T;
  index: number;
  nextToken?: string;
}

export interface PaginationInfo {
  nextToken: string;
}

export interface NomadError {
  statusCode: number;
  message: string;
  errors: string[];
}
