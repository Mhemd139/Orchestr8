import { ReactNode, useState } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { RightPanel } from '@/components/rightpanel/RightPanel';
import { MessageSquare } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="fixed bottom-6 right-6 rounded-full bg-primary p-4 text-primary-foreground shadow-lg hover:bg-primary/90"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      <RightPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </div>
  );
};
