import { useState, useEffect } from 'react';
import { TextInput } from '@/components/common/TextInput';
import { TextArea } from '@/components/common/TextArea';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RecordingOverview } from '@/components/teach/RecordingOverview';
import { EventLog } from '@/components/teach/EventLog';
import { TimelineStrip } from '@/components/teach/TimelineStrip';
import { SessionTimeline, TimelineStep } from '@/types/timeline';
import { useBridge } from '@/hooks/useBridge';
import { toast } from 'sonner';

type RecordingState = 'idle' | 'recording' | 'finished';

const mockSteps: TimelineStep[] = [
  { id: '1', label: 'Open ERP', order: 1 },
  { id: '2', label: 'Search invoice', order: 2 },
  { id: '3', label: 'Update status', order: 3 },
  { id: '4', label: 'Save', order: 4 },
];

export default function TeachPage() {
  const [workflowName, setWorkflowName] = useState('');
  const [goal, setGoal] = useState('');
  const [state, setState] = useState<RecordingState>('idle');
  const [eventsCount, setEventsCount] = useState(0);
  const [screenshotsCount, setScreenshotsCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<SessionTimeline | null>(null);
  const { sendMessage } = useBridge();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let eventInterval: NodeJS.Timeout;

    if (state === 'recording') {
      interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      eventInterval = setInterval(() => {
        const mockEvents = [
          `[${new Date().toLocaleTimeString()}] WindowChanged: chrome.exe (ERP - Dashboard)`,
          `[${new Date().toLocaleTimeString()}] MouseClick: (${Math.floor(Math.random() * 800)}, ${Math.floor(Math.random() * 600)})`,
          `[${new Date().toLocaleTimeString()}] KeyInput: "${Math.floor(Math.random() * 100000)}"`,
        ];
        const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
        setEvents((prev) => [...prev, randomEvent]);
        setEventsCount((c) => c + 1);
        
        if (Math.random() > 0.7) {
          setScreenshotsCount((c) => c + 1);
        }
      }, 2000);
    }

    return () => {
      clearInterval(interval);
      clearInterval(eventInterval);
    };
  }, [state]);

  const handleStartTeaching = () => {
    if (!workflowName || !goal) {
      toast.error('Please enter workflow name and goal');
      return;
    }

    setState('recording');
    sendMessage({
      type: 'startRecording',
      payload: { workflowName, goal },
    });
    toast.success('Recording started');
  };

  const handleStopTeaching = () => {
    setState('finished');
    sendMessage({ type: 'stopRecording' });
    
    const mockTimeline: SessionTimeline = {
      sessionId: `session-${Date.now()}`,
      goal,
      startedAt: new Date(Date.now() - duration * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      events: events.map((e, idx) => ({
        id: `evt-${idx}`,
        timestamp: new Date().toISOString(),
        type: e.includes('WindowChanged') ? 'window' : e.includes('MouseClick') ? 'mouse' : 'keyboard',
        description: e,
      })),
    };
    setTimeline(mockTimeline);
    toast.success('Recording stopped');
  };

  const handleSendToCloud = () => {
    toast.success('Timeline uploaded – workflow will be generated (mock)');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Teach Workflow</h1>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-4">
          <TextInput
            label="Workflow name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="e.g., Update invoice status"
          />
          <TextArea
            label="What do you want this workflow to do?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Describe the goal..."
            rows={3}
          />
          <div className="flex items-center gap-4">
            <PrimaryButton
              onClick={handleStartTeaching}
              disabled={state === 'recording'}
              variant="primary"
            >
              Start teaching
            </PrimaryButton>
            <PrimaryButton
              onClick={handleStopTeaching}
              disabled={state !== 'recording'}
              variant="danger"
            >
              Stop teaching
            </PrimaryButton>
            <StatusBadge status={state === 'recording' ? 'recording' : state === 'finished' ? 'ready' : 'idle'} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <RecordingOverview
            eventsCount={eventsCount}
            screenshotsCount={screenshotsCount}
            duration={duration}
          />
          <div className="mt-6">
            <TimelineStrip steps={state !== 'idle' ? mockSteps : []} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <EventLog events={events} />
        </div>
      </div>

      {state === 'finished' && timeline && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Session Timeline (JSON Preview)</h3>
          <pre className="overflow-x-auto rounded-lg bg-background p-4 font-mono text-xs text-foreground">
            {JSON.stringify(timeline, null, 2)}
          </pre>
          <div className="mt-4">
            <PrimaryButton onClick={handleSendToCloud} variant="primary">
              Send to cloud (mock)
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
