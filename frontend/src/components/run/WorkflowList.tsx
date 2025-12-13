import { WorkflowSummary } from '@/types/workflows';
import { StatusBadge } from '@/components/common/StatusBadge';

interface WorkflowListProps {
  workflows: WorkflowSummary[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const WorkflowList = ({ workflows, selectedId, onSelect }: WorkflowListProps) => {
  return (
    <div className="space-y-3">
      {workflows.map((workflow) => (
        <button
          key={workflow.id}
          onClick={() => onSelect(workflow.id)}
          className={`w-full rounded-lg border p-4 text-left transition-colors ${
            selectedId === workflow.id
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{workflow.name}</h3>
              {workflow.lastRun && (
                <p className="mt-1 text-sm text-muted-foreground">Last run: {workflow.lastRun}</p>
              )}
            </div>
            <StatusBadge status={workflow.status === 'Ready' ? 'ready' : 'draft'} />
          </div>
        </button>
      ))}
    </div>
  );
};
