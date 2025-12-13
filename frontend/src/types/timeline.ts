export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
}

export interface SessionTimeline {
  sessionId: string;
  goal: string;
  startedAt: string;
  endedAt: string;
  events: TimelineEvent[];
}

export interface TimelineStep {
  id: string;
  label: string;
  order: number;
}
