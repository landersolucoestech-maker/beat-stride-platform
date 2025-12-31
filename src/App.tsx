import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ManageMusic from "./pages/distribution/ManageMusic";
import NewRelease from "./pages/distribution/NewRelease";
import FinancialAnalytics from "./pages/financial/Analytics";
import Payouts from "./pages/financial/Payouts";
import Tickets from "./pages/help/Tickets";
import Profile from "./pages/settings/Profile";
import Demographics from "./pages/statistics/Demographics";
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Distribution */}
          <Route path="/distribution/music" element={<ManageMusic />} />
          <Route path="/distribution/music/new" element={<NewRelease />} />
          <Route path="/distribution/videos" element={<PlaceholderPage title="Gerenciar Vídeos" />} />
          <Route path="/distribution/videos/new" element={<PlaceholderPage title="Novo Vídeo" />} />
          
          {/* Statistics */}
          <Route path="/statistics/demographics" element={<Demographics />} />
          <Route path="/statistics/tiktok" element={<PlaceholderPage title="Estatísticas TikTok" />} />
          <Route path="/statistics/stores" element={<PlaceholderPage title="Comparação de Lojas" />} />
          <Route path="/statistics/charts" element={<PlaceholderPage title="Charts Musicais" />} />
          <Route path="/statistics/trackers" element={<PlaceholderPage title="Rastreadores" />} />
          
          {/* Marketing */}
          <Route path="/marketing/start" element={<PlaceholderPage title="Iniciar Marketing" />} />
          <Route path="/marketing/tools" element={<PlaceholderPage title="Ferramentas Profissionais" />} />
          <Route path="/marketing/emails" element={<PlaceholderPage title="Lista de E-mails" />} />
          
          {/* Financial */}
          <Route path="/financial/analytics" element={<FinancialAnalytics />} />
          <Route path="/financial/accounting" element={<Payouts />} />
          <Route path="/financial/shares" element={<PlaceholderPage title="Gestão de Shares" />} />
          
          {/* Help */}
          <Route path="/help/support" element={<PlaceholderPage title="Central de Suporte" />} />
          <Route path="/help/tickets" element={<Tickets />} />
          
          {/* Settings */}
          <Route path="/settings/profile" element={<Profile />} />
          <Route path="/settings/security" element={<PlaceholderPage title="Segurança" />} />
          <Route path="/settings/language" element={<PlaceholderPage title="Idioma" />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
