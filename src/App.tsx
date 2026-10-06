import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Artists from "./pages/distribution/Artists";
import ContentIdUgc from "./pages/distribution/ContentIdUgc";
import Fraud from "./pages/distribution/Fraud";
import ManageMusic from "./pages/distribution/ManageMusic";
import ManageVideos from "./pages/distribution/ManageVideos";
import NewRelease from "./pages/distribution/NewRelease";
import NewVideo from "./pages/distribution/NewVideo";
import ReleaseDetails from "./pages/distribution/ReleaseDetails";
import RightsProtection from "./pages/distribution/RightsProtection";
import FinancialAnalytics from "./pages/financial/Analytics";
import Payouts from "./pages/financial/Payouts";
import RoyaltyImport from "./pages/financial/RoyaltyImport";
import Shares from "./pages/financial/Shares";
import Wallet from "./pages/financial/Wallet";
import Support from "./pages/help/Support";
import Tickets from "./pages/help/Tickets";
import CampaignPlan from "./pages/marketing/CampaignPlan";
import ContentCampaign from "./pages/marketing/ContentCampaign";
import EmailList from "./pages/marketing/EmailList";
import ProTools from "./pages/marketing/ProTools";
import PublicSmartLink from "./pages/marketing/PublicSmartLink";
import SmartLinkAnalytics from "./pages/marketing/SmartLinkAnalytics";
import SmartLinks from "./pages/marketing/SmartLinks";
import StartMarketing from "./pages/marketing/StartMarketing";
import Integrations from "./pages/settings/Integrations";
import Language from "./pages/settings/Language";
import Profile from "./pages/settings/Profile";
import Security from "./pages/settings/Security";
import Demographics from "./pages/statistics/Demographics";
import MusicCharts from "./pages/statistics/MusicCharts";
import StoreComparison from "./pages/statistics/StoreComparison";
import TikTokStats from "./pages/statistics/TikTokStats";
import Trackers from "./pages/statistics/Trackers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/l/:linkId/:slug" element={<PublicSmartLink />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Index />} />
            <Route path="/artists" element={<Artists />} />

            <Route path="/distribution/artists" element={<Navigate to="/artists" replace />} />
            <Route path="/distribution/rights-protection" element={<RightsProtection />} />
            <Route path="/distribution/content-id" element={<ContentIdUgc />} />
            <Route path="/distribution/music" element={<ManageMusic />} />
            <Route path="/distribution/music/new" element={<NewRelease />} />
            <Route path="/distribution/music/:releaseId" element={<ReleaseDetails />} />
            <Route path="/distribution/videos" element={<ManageVideos />} />
            <Route path="/distribution/videos/new" element={<NewVideo />} />
            <Route path="/distribution/fraud" element={<Fraud />} />

            <Route path="/statistics/demographics" element={<Demographics />} />
            <Route path="/statistics/tiktok" element={<TikTokStats />} />
            <Route path="/statistics/stores" element={<StoreComparison />} />
            <Route path="/statistics/charts" element={<MusicCharts />} />
            <Route path="/statistics/trackers" element={<Trackers />} />

            <Route path="/marketing/start" element={<StartMarketing />} />
            <Route path="/marketing/campaigns/:campaignId/plan" element={<CampaignPlan />} />
            <Route path="/marketing/campaigns/:campaignId/content" element={<ContentCampaign />} />
            <Route path="/marketing/smartlinks" element={<SmartLinks />} />
            <Route path="/marketing/smartlinks/:smartLinkId/analytics" element={<SmartLinkAnalytics />} />
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
            <Route path="/settings/integrations" element={<Integrations />} />
            <Route path="/settings/language" element={<Language />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
