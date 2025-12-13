import { CheckCircle, Loader2 } from 'lucide-react';

interface RunStep {
  step: number;
  total: number;
  description: string;
  completed: boolean;
}

interface RunStatusPanelProps {
  steps: RunStep[];
  isRunning: boolean;
}

export const RunStatusPanel = ({ steps, isRunning }: RunStatusPanelProps) => {
  if (steps.length === 0 && !isRunning) {
    return null;
  }

  return (
    <div className="mt-6 rounded-lg border border-border bg-background p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Run Status</h3>
      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3">
            {step.completed ? (
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
            ) : (
              <Loader2 className="mt-0.5 h-4 w-4 flex-shrink-0 animate-spin text-processing" />
            )}
            <span className="text-sm text-foreground">
              Step {step.step}/{step.total}: {step.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
