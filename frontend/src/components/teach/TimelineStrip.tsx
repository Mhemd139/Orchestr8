import { TimelineStep } from '@/types/timeline';

interface TimelineStripProps {
  steps: TimelineStep[];
}

export const TimelineStrip = ({ steps }: TimelineStripProps) => {
  if (steps.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
        <p className="text-sm text-muted-foreground">Timeline will appear here as you record...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-foreground">Timeline</h4>
      <div className="flex flex-wrap gap-2">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-2">
            <div className="rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              {step.order}. {step.label}
            </div>
            {idx < steps.length - 1 && (
              <div className="h-px w-4 bg-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
