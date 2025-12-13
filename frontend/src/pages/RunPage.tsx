import { useState, useEffect } from 'react';
import { WorkflowList } from '@/components/run/WorkflowList';
import { VariableForm } from '@/components/run/VariableForm';
import { RunStatusPanel } from '@/components/run/RunStatusPanel';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { WorkflowSummary, Workflow, WorkflowVariable } from '@/types/workflows';
import { toast } from 'sonner';

const mockWorkflows: WorkflowSummary[] = [
  { id: '1', name: 'Update ERP Invoice Status', status: 'Ready', lastRun: '2 hours ago' },
  { id: '2', name: 'Daily Report Generation', status: 'Ready', lastRun: 'Yesterday' },
  { id: '3', name: 'Customer Data Sync', status: 'Draft' },
];

const mockVariables: Record<string, WorkflowVariable[]> = {
  '1': [
    { name: 'InvoiceNumber', type: 'string', label: 'Invoice Number' },
    { name: 'NewStatus', type: 'enum', label: 'New Status', options: ['Approved', 'Rejected', 'Pending'] },
    { name: 'InternalNote', type: 'string', label: 'Internal Note' },
  ],
  '2': [
    { name: 'ReportDate', type: 'string', label: 'Report Date' },
    { name: 'Department', type: 'enum', label: 'Department', options: ['Sales', 'Marketing', 'Engineering'] },
  ],
  '3': [
    { name: 'CustomerID', type: 'string', label: 'Customer ID' },
  ],
};

interface RunStep {
  step: number;
  total: number;
  description: string;
  completed: boolean;
}

export default function RunPage() {
  const [selectedId, setSelectedId] = useState<string>();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [runSteps, setRunSteps] = useState<RunStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const selectedWorkflow = mockWorkflows.find((w) => w.id === selectedId);
  const variables = selectedId ? mockVariables[selectedId] || [] : [];

  useEffect(() => {
    if (!isRunning) return;

    const mockSteps = [
      'Launching ERP...',
      'Opening invoice list...',
      'Typing invoice number...',
      'Selecting new status...',
      'Adding internal note...',
      'Clicking save button...',
      'Verifying update...',
    ];

    const steps: RunStep[] = mockSteps.map((desc, idx) => ({
      step: idx + 1,
      total: mockSteps.length,
      description: desc,
      completed: false,
    }));

    setRunSteps(steps);

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setRunSteps((prev) =>
          prev.map((s, idx) =>
            idx === currentStep ? { ...s, completed: true } : s
          )
        );
        currentStep++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
        toast.success('Workflow completed successfully!');
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleRun = () => {
    if (!selectedWorkflow) return;
    
    toast.info('Starting workflow execution...');
    setIsRunning(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Run Workflow</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Workflows</h2>
          <WorkflowList
            workflows={mockWorkflows}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        <div className="lg:col-span-2">
          {!selectedWorkflow ? (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-12">
              <p className="text-center text-muted-foreground">
                Select a workflow to run
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                {selectedWorkflow.name}
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                {selectedId === '1' && 'Update invoice status in the ERP system'}
                {selectedId === '2' && 'Generate and email daily performance report'}
                {selectedId === '3' && 'Sync customer data from CRM to database'}
              </p>

              {variables.length > 0 && (
                <>
                  <h3 className="mb-4 text-sm font-semibold text-foreground">Variables</h3>
                  <VariableForm
                    variables={variables}
                    onValuesChange={setFormValues}
                  />
                </>
              )}

              <div className="mt-6">
                <PrimaryButton
                  onClick={handleRun}
                  disabled={isRunning}
                  variant="primary"
                >
                  {isRunning ? 'Running...' : 'Run on this PC (mock)'}
                </PrimaryButton>
              </div>

              <RunStatusPanel steps={runSteps} isRunning={isRunning} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
