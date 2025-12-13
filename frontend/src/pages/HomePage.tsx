import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { WorkflowSummary } from '@/types/workflows';
import { BookOpen, Play, CheckCircle, Activity, Square, Terminal, StopCircle } from 'lucide-react';
import { toast } from 'sonner';

const mockWorkflows: WorkflowSummary[] = [
  { id: '1', name: 'Update ERP Invoice Status', status: 'Ready', lastRun: '2 hours ago' },
  { id: '2', name: 'Daily Report Generation', status: 'Ready', lastRun: 'Yesterday' },
  { id: '3', name: 'Customer Data Sync', status: 'Draft', lastRun: undefined },
];

export default function HomePage() {
  const navigate = useNavigate();

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [serverConnected, setServerConnected] = useState(false);
  const [isProcessingNova, setIsProcessingNova] = useState(false);
  const [novaStatus, setNovaStatus] = useState('');
  const [latestWorkflow, setLatestWorkflow] = useState('');
  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [execEvents, setExecEvents] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<string[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const execEventsEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of events
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  useEffect(() => {
    execEventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [execEvents]);

  // Poll server status and events
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('http://localhost:5000/status');
        if (res.ok) {
          setServerConnected(true);
          const data = await res.json();
          setIsRecording(data.running);
          setIsProcessingNova(data.processing_nova || false);
          setNovaStatus(data.nova_status || '');
          if (data.latest_workflow) {
            setLatestWorkflow(data.latest_workflow);
          }

          // Fetch recording events
          const eventsRes = await fetch('http://localhost:5000/events');
          const eventsData = await eventsRes.json();
          setEvents(eventsData.events);

          // Fetch execution status
          const execStatusRes = await fetch('http://localhost:5000/execute/status');
          const execStatusData = await execStatusRes.json();
          setIsExecuting(execStatusData.running);

          // Fetch execution events
          const execEventsRes = await fetch('http://localhost:5000/execute/events');
          const execEventsData = await execEventsRes.json();
          setExecEvents(execEventsData.events);
        } else {
          setServerConnected(false);
        }
      } catch (error) {
        setServerConnected(false);
      }
    };

    const interval = setInterval(checkStatus, 2000); // Poll every 2 seconds instead of 1
    return () => clearInterval(interval);
  }, []);

  // Fetch workflow list on mount
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const res = await fetch('http://localhost:5000/list-workflows');
        if (res.ok) {
          const data = await res.json();
          const newWorkflows = data.workflows;

          // Only update if workflows list changed
          if (JSON.stringify(newWorkflows) !== JSON.stringify(workflows)) {
            setWorkflows(newWorkflows);

            // Only auto-select if no workflow is selected
            if (newWorkflows.length > 0 && !selectedWorkflow) {
              setSelectedWorkflow(newWorkflows[0]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
      }
    };

    fetchWorkflows();
    const interval = setInterval(fetchWorkflows, 5000); // Refresh list every 5 seconds
    return () => clearInterval(interval);
  }, [selectedWorkflow, workflows]);

  const handleToggleRecording = async () => {
    if (!serverConnected) {
      toast.error("Cannot connect to backend server. Please run 'python scripts/server.py'");
      return;
    }

    try {
      if (isRecording) {
        await fetch('http://localhost:5000/stop', { method: 'POST' });
        toast.success("Stopping recording...");
      } else {
        await fetch('http://localhost:5000/start', { method: 'POST' });
        setEvents([]); // Clear previous events
        toast.success("Recording started");
      }
    } catch (error) {
      toast.error("Failed to communicate with server");
    }
  };

  const handleStartExecution = async () => {
    if (!serverConnected) {
      toast.error("Cannot connect to backend server. Please run 'python scripts/server.py'");
      return;
    }

    if (!selectedWorkflow) {
      toast.error("Please select a workflow to execute");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/execute/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow_file: selectedWorkflow })
      });

      if (res.ok) {
        setExecEvents([]); // Clear previous events
        toast.success("Execution started");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to start execution");
      }
    } catch (error) {
      toast.error("Failed to communicate with server");
    }
  };

  const handleStopExecution = async () => {
    try {
      await fetch('http://localhost:5000/execute/stop', { method: 'POST' });
      toast.success("Stopping execution...");
    } catch (error) {
      toast.error("Failed to communicate with server");
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-card to-background p-8">
        <h1 className="mb-2 text-4xl font-bold text-foreground">Orchestr8</h1>
        <p className="text-lg text-muted-foreground">
          Teach your PC once, let it work for you forever.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Quick Actions</h2>

        {/* Recording Controls */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <PrimaryButton
              onClick={handleToggleRecording}
              variant={isRecording ? "danger" : "primary"}
              size="lg"
              className="flex items-center gap-2"
              disabled={isExecuting}
            >
              {isRecording ? (
                <>
                  <Square className="h-5 w-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <BookOpen className="h-5 w-5" />
                  Teach new workflow
                </>
              )}
            </PrimaryButton>

            <PrimaryButton
              onClick={() => navigate('/run')}
              variant="secondary"
              size="lg"
              className="flex items-center gap-2"
              disabled={isRecording || isExecuting}
            >
              <Play className="h-5 w-5" />
              Run a workflow
            </PrimaryButton>
          </div>

          {/* Recording Status Indicator */}
          {isRecording && (
            <div className="flex items-center gap-2 text-amber-500 animate-pulse">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="font-medium">Recording in progress... Press 'Esc' to stop.</span>
            </div>
          )}

          {/* Nova API Processing Indicator */}
          {isProcessingNova && (
            <div className="flex items-center gap-2 text-purple-500 animate-pulse">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span className="font-medium">🤖 {novaStatus}</span>
            </div>
          )}

          {/* Workflow Generated Success */}
          {!isProcessingNova && latestWorkflow && (
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">✓ Latest workflow ready: {latestWorkflow}</span>
            </div>
          )}

          {/* Execution Controls */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center gap-4">
              <select
                value={selectedWorkflow}
                onChange={(e) => setSelectedWorkflow(e.target.value)}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isExecuting || isRecording}
              >
                {workflows.length === 0 ? (
                  <option value="">No workflows available</option>
                ) : (
                  workflows.map((workflow) => (
                    <option key={workflow} value={workflow}>
                      {workflow}
                    </option>
                  ))
                )}
              </select>

              <PrimaryButton
                onClick={handleStartExecution}
                variant="primary"
                size="lg"
                className="flex items-center gap-2"
                disabled={isExecuting || isRecording || workflows.length === 0}
              >
                <Play className="h-5 w-5" />
                Start Execute
              </PrimaryButton>

              <PrimaryButton
                onClick={handleStopExecution}
                variant="danger"
                size="lg"
                className="flex items-center gap-2"
                disabled={!isExecuting}
              >
                <StopCircle className="h-5 w-5" />
                Force Stop Execute
              </PrimaryButton>
            </div>

            {/* Execution Status Indicator */}
            {isExecuting && (
              <div className="flex items-center gap-2 text-blue-500 animate-pulse">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="font-medium">Executing workflow... Press 'Esc' to stop.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recording Events Log Section */}
      {(isRecording || events.length > 0) && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">Recording Events</h2>
          </div>
          <div className="h-64 overflow-y-auto rounded-md border border-border bg-black/90 p-4 font-mono text-sm text-green-400 shadow-inner">
            {events.length === 0 ? (
              <span className="text-gray-500 opacity-50">Waiting for events...</span>
            ) : (
              events.map((event, index) => (
                <div key={index} className="mb-1 break-all">
                  <span className="text-gray-500">[{event.timestamp}]</span> {event.message}
                </div>
              ))
            )}
            <div ref={eventsEndRef} />
          </div>
        </div>
      )}

      {/* Execution Events Log Section */}
      {(isExecuting || execEvents.length > 0) && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">Execution Events</h2>
          </div>
          <div className="h-64 overflow-y-auto rounded-md border border-border bg-black/90 p-4 font-mono text-sm text-blue-400 shadow-inner">
            {execEvents.length === 0 ? (
              <span className="text-gray-500 opacity-50">Waiting for execution events...</span>
            ) : (
              execEvents.map((event, index) => (
                <div key={index} className="mb-1 break-all">
                  <span className="text-gray-500">[{event.timestamp}]</span> {event.message}
                </div>
              ))
            )}
            <div ref={execEventsEndRef} />
          </div>
        </div>
      )}

      {/* Agent Status */}
      <div className={`rounded-lg border p-6 ${serverConnected ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
        <div className="mb-4 flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${serverConnected ? 'bg-success' : 'bg-destructive'}`} />
          <h2 className="text-xl font-semibold text-foreground">
            {serverConnected ? 'Agent Connected' : 'Agent Disconnected'}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex items-center gap-2 text-sm">
            <Activity className={`h-4 w-4 ${serverConnected ? 'text-success' : 'text-destructive'}`} />
            <span className="text-foreground">
              Backend: {serverConnected ? 'Connected' : 'Not Found (Run scripts/server.py)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
