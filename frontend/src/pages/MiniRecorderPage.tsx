import { useState, useEffect } from 'react';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useBridge } from '@/hooks/useBridge';

type MiniState = 'idle' | 'recording' | 'processing';

export default function MiniRecorderPage() {
  const [state, setState] = useState<MiniState>('idle');
  const [duration, setDuration] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [lastAction, setLastAction] = useState('Ready to start recording.');
  const { sendMessage } = useBridge();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let eventInterval: NodeJS.Timeout;

    if (state === 'recording') {
      interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      eventInterval = setInterval(() => {
        setEventsCount((c) => c + 1);
        const actions = [
          'Clicked ERP - Invoices',
          'Typed invoice number',
          'Selected dropdown option',
          'Clicked Save button',
        ];
        setLastAction(actions[Math.floor(Math.random() * actions.length)]);
      }, 4000);
    }

    return () => {
      clearInterval(interval);
      clearInterval(eventInterval);
    };
  }, [state]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleRecording = () => {
    if (state === 'idle') {
      setState('recording');
      setLastAction('Recording started...');
      sendMessage({ type: 'startRecording', payload: {} });
    } else if (state === 'recording') {
      setState('processing');
      setLastAction('Stopping recording...');
      sendMessage({ type: 'stopRecording' });
      
      setTimeout(() => {
        setState('idle');
        setDuration(0);
        setEventsCount(0);
        setLastAction('Ready to start recording.');
      }, 2000);
    }
  };

  const handleOpenConsole = () => {
    console.log('Open console clicked');
  };

  const stateConfig = {
    idle: {
      dotColor: 'bg-muted-foreground',
      label: 'Idle',
      buttonLabel: 'Start Teaching',
      buttonVariant: 'primary' as const,
    },
    recording: {
      dotColor: 'bg-recording animate-pulse',
      label: 'Recording...',
      buttonLabel: 'Stop Teaching',
      buttonVariant: 'danger' as const,
    },
    processing: {
      dotColor: 'bg-processing',
      label: 'Processing...',
      buttonLabel: 'Saving...',
      buttonVariant: 'primary' as const,
    },
  };

  const config = stateConfig[state];

  return (
    <div className="flex h-screen w-[260px] flex-col gap-3 bg-background p-4">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
        <div className={`h-3 w-3 rounded-full ${config.dotColor}`} />
        <span className="text-sm font-medium text-foreground">{config.label}</span>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-mono text-lg font-semibold text-foreground">
              {formatDuration(duration)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Events</p>
            <p className="font-mono text-lg font-semibold text-foreground">{eventsCount}</p>
          </div>
        </div>
      </div>

      <PrimaryButton
        onClick={handleToggleRecording}
        variant={config.buttonVariant}
        disabled={state === 'processing'}
        className="w-full"
      >
        {config.buttonLabel}
      </PrimaryButton>

      <div className="flex-1 rounded-lg border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground">Last action:</p>
        <p className="mt-1 text-xs text-foreground">{lastAction}</p>
      </div>

      <button
        onClick={handleOpenConsole}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        ⟵ Open Console
      </button>
    </div>
  );
}
