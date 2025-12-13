import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import HomePage from "./pages/HomePage";
import TeachPage from "./pages/TeachPage";
import RunPage from "./pages/RunPage";
import SettingsPage from "./pages/SettingsPage";
import MiniRecorderPage from "./pages/MiniRecorderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/mini" element={<MiniRecorderPage />} />
          <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
          <Route path="/teach" element={<AppLayout><TeachPage /></AppLayout>} />
          <Route path="/run" element={<AppLayout><RunPage /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
