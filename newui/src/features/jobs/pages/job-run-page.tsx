import { useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateJob, useParseJob, usePlanJob } from '@/api/hooks';
import type { Job, ParseRequest, JobPlanRequest } from '@/api/types/job';
import { Button } from '@/components/ui/button';
import { JobEditor } from '@/components/job-editor/job-editor';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

const DEFAULT_JOB = `job "example" {
  datacenters = ["dc1"]
  type = "service"

  group "web" {
    count = 1

    network {
      port "http" {}
    }

    task "nginx" {
      driver = "exec"

      config {
        command = "/usr/bin/echo"
        args = ["hello"]
      }

      resources {
        cpu = 100
        memory = 64
      }
    }
  }
}`;

type Stage = 'edit' | 'review';

function SaveTemplateModal({
  definition,
  onClose,
}: {
  definition: string;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const key = `nomad/job-templates/${name.trim()}`;
      const body = JSON.stringify({
        Namespace: 'default',
        Path: key,
        Items: [{ Key: 'template', Value: definition }],
      });
      await fetch('/v1/v1/kv/' + encodeURIComponent(key), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      setSaved(true);
      setTimeout(() => onClose(), 1500);
    } catch {
      setSaving(false);
    }
  }, [name, definition, onClose]);

  return (
    <Modal open onOpenChange={(v) => !v && onClose()} title="Save as Template">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Template Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="my-template"
            disabled={saving || saved}
            autoFocus
            className={cn(
              'mt-1 w-full rounded-md border px-3 py-2 text-sm',
              'border-neutral-300 bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              'dark:border-neutral-600 dark:bg-neutral-900'
            )}
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Template will be saved to <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">nomad/job-templates/{name || '...'}</code>
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!name.trim() || saving || saved}
          >
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function JobRunPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [definition, setDefinition] = useState(() => {
    const content = searchParams.get('content');
    return content ? decodeURIComponent(content) : '';
  });
  const [variables, setVariables] = useState('');
  const [stage, setStage] = useState<Stage>('edit');
  const [error, setError] = useState<string | null>(null);
  const [parsedJob, setParsedJob] = useState<Job | null>(null);
  const [planResult, setPlanResult] = useState<{ diff?: string; warnings?: string; failedTGAllocs?: Record<string, unknown> } | null>(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  const createMutation = useCreateJob();
  const parseMutation = useParseJob();
  const planMutation = usePlanJob();

  const detectLanguage = useCallback((text: string): 'hcl' | 'json' => {
    try {
      JSON.parse(text);
      return 'json';
    } catch {
      return 'hcl';
    }
  }, []);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDefinition(reader.result as string);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handlePlan = useCallback(async () => {
    if (!definition.trim()) return;
    setError(null);
    setPlanResult(null);

    try {
      let jobJson: Job;

      try {
        jobJson = JSON.parse(definition);
        setParsedJob(jobJson);
      } catch {
        const parseReq: ParseRequest = {
          JobHCL: definition,
          Variables: variables ? JSON.parse(`{${variables}}`) : {},
          Canonicalize: true,
          SkipValidation: false,
        };
        const parseRes = await parseMutation.mutateAsync(parseReq);
        if (parseRes.data.Error) throw new Error(parseRes.data.Error);
        jobJson = parseRes.data.Job;
        setParsedJob(jobJson);
      }

      const planReq: JobPlanRequest = {
        Job: jobJson,
        Diff: true,
        Annotations: false,
      };

      const planRes = await planMutation.mutateAsync({ id: jobJson.ID || '', request: planReq });
      setPlanResult({
        diff: planRes.data.Diff || planRes.data.JobDiff ? JSON.stringify(planRes.data.JobDiff, null, 2) : '',
        warnings: planRes.data.Warnings,
        failedTGAllocs: planRes.data.FailedTGAllocs,
      });
      setStage('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [definition, variables, parseMutation, planMutation]);

  const handleRun = useCallback(async () => {
    if (!parsedJob) return;
    setError(null);

    try {
      await createMutation.mutateAsync(parsedJob);
      navigate('/jobs');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStage('edit');
    }
  }, [parsedJob, createMutation, navigate]);

  const handleSaveFile = useCallback(() => {
    const blob = new Blob([definition], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobspec.nomad.hcl';
    a.click();
    URL.revokeObjectURL(url);
  }, [definition]);

  const handleReset = useCallback(() => {
    setStage('edit');
    setPlanResult(null);
    setError(null);
  }, []);

  const isPlanning = parseMutation.isPending || planMutation.isPending;
  const isRunning = createMutation.isPending;

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Run a Job</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Paste or author HCL or JSON to submit to your cluster, or select from a list of templates.
            A plan will be requested before the job is submitted. You can also attach a job spec by
            uploading a job file or dragging &amp; dropping a file to the editor.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label
            className={cn(
              'inline-flex cursor-pointer items-center rounded-md border px-3 py-1.5 text-sm transition-colors',
              'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50',
              'dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
            )}
          >
            Upload File
            <input
              ref={fileInputRef}
              type="file"
              accept=".hcl,.json,.nomad"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
          <Button variant="secondary" onClick={() => navigate('/jobs/run/templates')}>
            Choose from template
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      <fieldset disabled={isPlanning || isRunning} className="space-y-4">
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
            Job Definition
          </div>
          <div className="h-[420px] w-full">
            <JobEditor
              value={definition}
              onChange={setDefinition}
              language={detectLanguage(definition)}
              readOnly={stage === 'review'}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
            HCL Variable Values
          </div>
          <div className="h-[180px] w-full">
            <JobEditor
              value={variables}
              onChange={setVariables}
              language="hcl"
              readOnly={stage === 'review'}
            />
          </div>
        </div>

        {stage === 'edit' && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handlePlan}
              disabled={!definition.trim() || isPlanning}
            >
              {isPlanning ? 'Planning...' : 'Plan'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowSaveTemplate(true)}
              disabled={!definition.trim()}
            >
              Save as template
            </Button>
            <Button
              variant="secondary"
              onClick={handleSaveFile}
              disabled={!definition.trim()}
            >
              Save as .nomad.hcl
            </Button>
          </div>
        )}

        {stage === 'review' && (
          <div className="space-y-4">
            {planResult?.diff && (
              <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-950 dark:border-neutral-700">
                <pre className="max-h-[300px] overflow-auto p-4 text-xs leading-relaxed text-neutral-300">{planResult.diff}</pre>
              </div>
            )}

            {planResult?.warnings && (
              <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-xs text-warning-800 dark:border-warning-800 dark:bg-warning-900/20 dark:text-warning-300 whitespace-pre-wrap">
                {planResult.warnings}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={handleRun} disabled={isRunning}>
                {isRunning ? 'Submitting...' : 'Run'}
              </Button>
              <Button variant="ghost" onClick={handleReset}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </fieldset>

      {!definition && stage === 'edit' && (
        <button
          type="button"
          onClick={() => setDefinition(DEFAULT_JOB)}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Load example job spec →
        </button>
      )}

      {showSaveTemplate && (
        <SaveTemplateModal
          definition={definition}
          onClose={() => setShowSaveTemplate(false)}
        />
      )}
    </div>
  );
}
