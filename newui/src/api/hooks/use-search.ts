import { useQuery } from '@tanstack/react-query';
import { search, fuzzySearch } from '@/api/resources/search';

export function useSearch(prefix: string, context?: string[]) {
  return useQuery({
    queryKey: ['search', prefix, context],
    queryFn: () => search(prefix, context),
    enabled: !!prefix,
  });
}

export function useFuzzySearch(text: string, context?: string[]) {
  return useQuery({
    queryKey: ['search', 'fuzzy', text, context],
    queryFn: () => fuzzySearch(text, context),
    enabled: !!text,
  });
}
