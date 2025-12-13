type BadgeVariant = 'idle' | 'recording' | 'processing' | 'ready' | 'draft';

interface StatusBadgeProps {
  status: BadgeVariant;
  label?: string;
  showDot?: boolean;
}

export const StatusBadge = ({ status, label, showDot = true }: StatusBadgeProps) => {
  const variants = {
    idle: 'bg-muted text-muted-foreground border-border',
    recording: 'bg-recording/10 text-recording border-recording/30',
    processing: 'bg-processing/10 text-processing border-processing/30',
    ready: 'bg-success/10 text-success border-success/30',
    draft: 'bg-warning/10 text-warning border-warning/30',
  };

  const dotVariants = {
    idle: 'bg-muted-foreground',
    recording: 'bg-recording animate-pulse',
    processing: 'bg-processing',
    ready: 'bg-success',
    draft: 'bg-warning',
  };

  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${variants[status]}`}>
      {showDot && <span className={`h-2 w-2 rounded-full ${dotVariants[status]}`} />}
      {displayLabel}
    </span>
  );
};
