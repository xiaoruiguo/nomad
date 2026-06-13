import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getVariables } from '@/api/resources/variables';
import type { VariableListStub, Variable } from '@/api/types/variable';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DEFAULT_JOB_TEMPLATES, formatTemplateLabel } from '../lib/default-templates';
import { cn } from '@/lib/utils';

interface TemplateCard {
  id: string;
  name: string;
  description: string;
  template: string;
  isDefault: boolean;
}

export function TemplateSelectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('template') || null);
  const [templates, setTemplates] = useState<TemplateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getVariables({ prefix: 'nomad/job-templates', namespace: '*' });
        const userTemplates: TemplateCard[] = (res.data || [])
          .filter((v: VariableListStub) => !DEFAULT_JOB_TEMPLATES.some((d) => d.id === v.Path))
          .map((v: VariableListStub) => ({
            id: v.Path,
            name: formatTemplateLabel(v.Path),
            description: 'Custom job template',
            template: '',
            isDefault: false,
          }));

        setTemplates([...userTemplates, ...DEFAULT_JOB_TEMPLATES]);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setTemplates(DEFAULT_JOB_TEMPLATES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleApply = useCallback(async () => {
    if (!selectedId) return;

    let templateContent = '';

    const defaultTmpl = DEFAULT_JOB_TEMPLATES.find((t) => t.id === selectedId);
    if (defaultTmpl) {
      templateContent = defaultTmpl.template;
    } else {
      try {
        const res = await fetch(`/v1/var/${encodeURIComponent(selectedId)}`);
        if (!res.ok) throw new Error('Failed to load template');
        const data: Variable = await res.json();
        templateContent = data.Items?.template?.Value || '';
      } catch {
        return;
      }
    }

    navigate(`/jobs/run?template=${encodeURIComponent(selectedId)}&content=${encodeURIComponent(templateContent)}`);
  }, [selectedId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && templates.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-400">
          Failed to load templates: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Choose a Template</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Select a predefined job template to get started. Templates are stored as Nomad Variables under{' '}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-mono dark:bg-neutral-800">nomad/job-templates/</code>.
        </p>
      </div>

      <fieldset disabled={!selectedId} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tmpl) => (
            <label
              key={tmpl.id}
              onClick={() => handleSelect(tmpl.id)}
              className={cn(
                'relative flex cursor-pointer flex-col rounded-lg border-2 p-4 transition-all',
                selectedId === tmpl.id
                  ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 dark:bg-primary-900/20'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600'
              )}
            >
              <input
                type="radio"
                name="template"
                value={tmpl.id}
                checked={selectedId === tmpl.id}
                onChange={() => handleSelect(tmpl.id)}
                className="sr-only"
              />

              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    selectedId === tmpl.id
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-neutral-900 dark:text-neutral-100'
                  )}
                >
                  {tmpl.name}
                </span>
                {tmpl.isDefault && (
                  <span className="inline-flex shrink-0 items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                    Default
                  </span>
                )}
              </div>

              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {tmpl.description}
              </p>

              {selectedId === tmpl.id && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <Button variant="ghost" onClick={() => navigate('/jobs/run')}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApply} disabled={!selectedId}>
            Apply Template
          </Button>
        </div>
      </fieldset>
    </div>
  );
}
