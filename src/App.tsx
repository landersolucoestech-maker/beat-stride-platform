import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Artists from "./pages/distribution/Artists";
import RightsProtection from "./pages/distribution/RightsProtection";
import ManageMusic from "./pages/distribution/ManageMusic";
import NewRelease from "./pages/distribution/NewRelease";
import ManageVideos from "./pages/distribution/ManageVideos";
import NewVideo from "./pages/distribution/NewVideo";
import FinancialAnalytics from "./pages/financial/Analytics";
import Payouts from "./pages/financial/Payouts";
import Shares from "./pages/financial/Shares";
import RoyaltyImport from "./pages/financial/RoyaltyImport";
import Wallet from "./pages/financial/Wallet";
import SmartLinks from "./pages/marketing/SmartLinks";
import Fraud from "./pages/distribution/Fraud";
import Tickets from "./pages/help/Tickets";
import Support from "./pages/help/Support";
import Profile from "./pages/settings/Profile";
import Security from "./pages/settings/Security";
import Language from "./pages/settings/Language";
import Demographics from "./pages/statistics/Demographics";
import TikTokStats from "./pages/statistics/TikTokStats";
import StoreComparison from "./pages/statistics/StoreComparison";
import MusicCharts from "./pages/statistics/MusicCharts";
import Trackers from "./pages/statistics/Trackers";
import StartMarketing from "./pages/marketing/StartMarketing";
import ProTools from "./pages/marketing/ProTools";
import EmailList from "./pages/marketing/EmailList";
import CreatorsIntegration from "./pages/marketing/CreatorsIntegration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Index />} />

          <Route path="/distribution/artists" element={<Artists />} />
          <Route path="/distribution/rights-protection" element={<RightsProtection />} />
          <Route path="/distribution/music" element={<ManageMusic />} />
          <Route path="/distribution/music/new" element={<NewRelease />} />
          <Route path="/distribution/videos" element={<ManageVideos />} />
          <Route path="/distribution/videos/new" element={<NewVideo />} />
          <Route path="/distribution/fraud" element={<Fraud />} />

          <Route path="/statistics/demographics" element={<Demographics />} />
          <Route path="/statistics/tiktok" element={<TikTokStats />} />
          <Route path="/statistics/stores" element={<StoreComparison />} />
          <Route path="/statistics/charts" element={<MusicCharts />} />
          <Route path="/statistics/trackers" element={<Trackers />} />

          <Route path="/marketing/start" element={<StartMarketing />} />
          <Route path="/marketing/smartlinks" element={<SmartLinks />} />
          <Route path="/marketing/creators" element={<CreatorsIntegration />} />
          <Route path="/marketing/tools" element={<ProTools />} />
          <Route path="/marketing/emails" element={<EmailList />} />

          <Route path="/financial/analytics" element={<FinancialAnalytics />} />
          <Route path="/financial/accounting" element={<Payouts />} />
          <Route path="/financial/shares" element={<Shares />} />
          <Route path="/financial/royalties" element={<RoyaltyImport />} />
          <Route path="/financial/wallet" element={<Wallet />} />

          <Route path="/help/support" element={<Support />} />
          <Route path="/help/tickets" element={<Tickets />} />

          <Route path="/settings/profile" element={<Profile />} />
          <Route path="/settings/security" element={<Security />} />
          <Route path="/settings/language" element={<Language />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
