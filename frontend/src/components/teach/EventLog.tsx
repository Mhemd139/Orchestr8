import { useEffect, useRef } from 'react';

interface EventLogProps {
  events: string[];
}

export const EventLog = ({ events }: EventLogProps) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Event Log</h3>
      <div className="h-[400px] overflow-y-auto rounded-lg border border-border bg-background p-4 font-mono text-xs">
        {events.length === 0 ? (
          <p className="text-muted-foreground">No events recorded yet...</p>
        ) : (
          <div className="space-y-1">
            {events.map((event, idx) => (
              <div key={idx} className="text-foreground">
                {event}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};
