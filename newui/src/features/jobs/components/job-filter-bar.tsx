import { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { JobFilters as JobFiltersType } from '../hooks/use-job-filters';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'dead', label: 'Dead' },
];

const TYPE_OPTIONS = [
  { value: 'batch', label: 'Batch' },
  { value: 'service', label: 'Service' },
  { value: 'system', label: 'System' },
  { value: 'sysbatch', label: 'Sysbatch' },
];

interface JobFilterBarProps {
  filters: JobFiltersType;
  onSearchChange: (search: string) => void;
  onToggleStatus: (status: string) => void;
  onToggleType: (type: string) => void;
  onNamespaceChange: (ns: string) => void;
  onNodePoolChange: (pool: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  namespaces: { Name: string }[];
  nodePools: string[];
}

function FilterDropdown({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedCount = selected.length;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm transition-colors',
          open ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-300' : 'border-neutral-300 bg-white hover:bg-neutral-50',
          'text-neutral-700 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800',
          open && 'dark:border-primary-500 dark:bg-primary-900/20'
        )}
      >
        <span>{label}</span>
        <svg className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {selectedCount > 0 && (
          <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-medium text-white">
            {selectedCount}
          </span>
        )}
      </button>
      {open && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'absolute left-0 top-full z-50 mt-1 min-w-[140px] max-h-[300px] overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg',
            'dark:border-neutral-700 dark:bg-neutral-900'
          )}
        >
          <div className="px-1 py-0.5">
            {options.map((opt) => {
              const isActive = selected.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelect(opt.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-3.5 w-3.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-600"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterableDropdown({
  label,
  options,
  selected,
  onSelect,
  placeholder,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onSelect: (value: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedCount = selected.length;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!filter) return options;
    const q = filter.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, filter]);

  function handleToggle(value: string) {
    if (selected.includes(value)) {
      onSelect(selected.filter((v) => v !== value).join(','));
    } else {
      onSelect([...selected, value].join(','));
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm transition-colors',
          open ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-300' : 'border-neutral-300 bg-white hover:bg-neutral-50',
          'text-neutral-700 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800',
          open && 'dark:border-primary-500 dark:bg-primary-900/20'
        )}
      >
        <span>{label}</span>
        <svg className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {selectedCount > 0 && (
          <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-medium text-white">
            {selectedCount}
          </span>
        )}
      </button>
      {open && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-lg border border-neutral-200 bg-white shadow-lg',
            'dark:border-neutral-700 dark:bg-neutral-900'
          )}
        >
          <div className="border-b border-neutral-100 p-2 dark:border-neutral-700">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={placeholder}
                className={cn(
                  'w-full rounded border py-1 pl-8 pr-2 text-xs leading-tight transition-colors',
                  'border-neutral-200 bg-white placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
                  'dark:border-neutral-600 dark:bg-neutral-900 dark:placeholder:text-neutral-500'
                )}
              />
            </div>
          </div>
          <div className="max-h-[280px] overflow-y-auto p-1 py-0.5">
            {filteredOptions.map((opt) => {
              const isActive = selected.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggle(opt.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-3.5 w-3.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-600"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
            {filteredOptions.length === 0 && options.length > 0 && (
              <div className="px-2 py-3 text-xs text-neutral-400">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function JobFilterBar({
  filters,
  onSearchChange,
  onToggleStatus,
  onToggleType,
  onNodePoolChange,
  onClearAll,
  hasActiveFilters,
  namespaces,
  nodePools,
}: JobFilterBarProps) {
  const namespaceOptions = useMemo(() =>
    namespaces.map((n) => ({ value: n.Name, label: n.Name })),
    [namespaces]
  );

  const nodePoolSelected = filters.nodePool ? filters.nodePool.split(',').filter(Boolean) : [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-[300px]">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Name contains myJob'
            className={cn(
              'w-full rounded border py-1.5 pl-9 pr-3 text-sm leading-tight transition-colors',
              'border-neutral-300 bg-white placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              'dark:border-neutral-600 dark:bg-neutral-900 dark:placeholder:text-neutral-500 dark:focus:border-primary-400'
            )}
          />
        </div>
      </div>

      <FilterDropdown
        label="Status"
        options={STATUS_OPTIONS}
        selected={filters.statuses}
        onSelect={(v) => onToggleStatus(v)}
      />

      <FilterDropdown
        label="Type"
        options={TYPE_OPTIONS}
        selected={filters.types}
        onSelect={(v) => onToggleType(v)}
      />

      <FilterableDropdown
        label="NodePool"
        options={nodePools.map((p) => ({ value: p, label: p || 'default' }))}
        selected={nodePoolSelected}
        onSelect={(v) => onNodePoolChange(v)}
        placeholder="Filter NodePool"
      />

      {namespaceOptions.length > 1 && (
        <FilterableDropdown
          label="Namespace"
          options={namespaceOptions}
          selected={filters.namespace ? [filters.namespace] : []}
          onSelect={() => {}}
          placeholder="Filter Namespace"
        />
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className={cn(
            'inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm font-medium transition-colors',
            'border-danger-600 bg-danger-600 text-white hover:bg-danger-700',
            'dark:border-danger-500 dark:bg-danger-500 dark:hover:bg-danger-600'
          )}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Reset Filters
        </button>
      )}
    </div>
  );
}
