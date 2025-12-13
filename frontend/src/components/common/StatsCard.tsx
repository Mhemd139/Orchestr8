import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'recording' | 'processing';
}

export const StatsCard = ({ label, value, icon: Icon, variant = 'default' }: StatsCardProps) => {
  const variantStyles = {
    default: 'border-border',
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    recording: 'border-recording/30 bg-recording/5',
    processing: 'border-processing/30 bg-processing/5',
  };

  return (
    <div className={`rounded-lg border ${variantStyles[variant]} bg-card p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        {Icon && (
          <Icon className="h-8 w-8 text-muted-foreground opacity-50" />
        )}
      </div>
    </div>
  );
};
