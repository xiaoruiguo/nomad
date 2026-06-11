import { useQuery } from '@tanstack/react-query';
import { listDirectory, statFile, catFile } from '@/api/resources/filesystem';

export function useDirectoryListing(allocId: string, path?: string) {
  return useQuery({
    queryKey: ['filesystem', 'ls', allocId, path],
    queryFn: () => listDirectory(allocId, path),
  });
}

export function useFileStat(allocId: string, path?: string) {
  return useQuery({
    queryKey: ['filesystem', 'stat', allocId, path],
    queryFn: () => statFile(allocId, path),
  });
}

export function useFileContent(allocId: string, path: string) {
  return useQuery({
    queryKey: ['filesystem', 'cat', allocId, path],
    queryFn: () => catFile(allocId, path),
  });
}
