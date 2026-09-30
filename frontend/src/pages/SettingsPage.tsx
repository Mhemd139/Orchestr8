import { useState } from 'react';
import { TextInput } from '@/components/common/TextInput';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [startWithWindows, setStartWithWindows] = useState(true);
  const [showMiniRecorder, setShowMiniRecorder] = useState(true);

  const handleTestConnection = async () => {
    try {
      const res = await fetch(`${apiUrl}/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { status } = await res.json();
      if (status === 'healthy') toast.success('Connected: Bedrock is reachable.');
      else toast.error('API is up, but Bedrock is not connected. Check your AWS credentials.');
    } catch (err) {
      toast.error(`Cannot reach ${apiUrl}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Settings</h1>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Connection Settings</h2>
        <div className="space-y-4">
          <TextInput
            label="Backend API URL"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000"
          />
          <PrimaryButton onClick={handleTestConnection} variant="secondary">
            Test connection
          </PrimaryButton>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Agent Settings</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={startWithWindows}
              onChange={(e) => setStartWithWindows(e.target.checked)}
              className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-foreground">Start agent with Windows</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={showMiniRecorder}
              onChange={(e) => setShowMiniRecorder(e.target.checked)}
              className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-foreground">Show mini recorder on teaching start</span>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Diagnostics</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Input capture</p>
              <p className="text-xs text-muted-foreground">Status: OK</p>
            </div>
            <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
              OK
            </span>
          </div>
          
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Screen capture</p>
              <p className="text-xs text-muted-foreground">Status: OK</p>
            </div>
            <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
              OK
            </span>
          </div>
          
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            <AlertCircle className="h-5 w-5 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">OS permissions</p>
              <p className="text-xs text-muted-foreground">Some permissions need attention</p>
            </div>
            <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
              Needs attention
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
