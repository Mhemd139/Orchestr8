import { StatsCard } from '@/components/common/StatsCard';
import { Clock, Camera, Activity } from 'lucide-react';

interface RecordingOverviewProps {
  eventsCount: number;
  screenshotsCount: number;
  duration: number;
}

export const RecordingOverview = ({ eventsCount, screenshotsCount, duration }: RecordingOverviewProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Recording Overview</h3>
      <div className="grid grid-cols-1 gap-4">
        <StatsCard label="Events recorded" value={eventsCount} icon={Activity} />
        <StatsCard label="Screenshots captured" value={screenshotsCount} icon={Camera} />
        <StatsCard label="Duration" value={formatDuration(duration)} icon={Clock} />
      </div>
    </div>
  );
};
