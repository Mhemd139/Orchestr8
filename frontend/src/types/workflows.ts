export interface WorkflowSummary {
  id: string;
  name: string;
  status: "Draft" | "Ready";
  lastRun?: string;
}

export interface WorkflowVariable {
  name: string;
  type: "string" | "number" | "enum";
  label: string;
  options?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  variables: WorkflowVariable[];
  status: "Draft" | "Ready";
}
