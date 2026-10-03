import { MainLayout } from "@/components/layout/MainLayout";
import { ProductionStateNotice } from "@/components/dashboard/ProductionStateNotice";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { RecentReleases } from "@/components/dashboard/RecentReleases";
import { StreamsChart } from "@/components/dashboard/StreamsChart";
import { TopArtists } from "@/components/dashboard/TopArtists";
import { TopCountries } from "@/components/dashboard/TopCountries";
import { TopPlaylists } from "@/components/dashboard/TopPlaylists";
import { TopStreams } from "@/components/dashboard/TopStreams";
import { TotalStreams } from "@/components/dashboard/TotalStreams";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { useDashboardSummary } from "@/features/dashboard/use-dashboard-summary";

const Index = () => {
  const { data } = useDashboardSummary();
  const summary = data ?? {
    wallet: { availableAmount: null, currency: "BRL" },
    recentReleases: [],
    streams: { total: null, currentMonth: null, previousMonth: null },
    topTracks: [],
    topArtists: [],
    topPlaylists: [],
    topTerritories: [],
    platforms: [],
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div><h1 className="text-2xl font-bold text-foreground">Painel geral</h1></div>
        <ProductionStateNotice />
        <div className="grid lg:grid-cols-2 gap-6"><WalletCard {...summary.wallet} /><QuickLinks /></div>
        <RecentReleases releases={summary.recentReleases} />
        <div className="grid lg:grid-cols-3 gap-6"><TotalStreams {...summary.streams} /><TopStreams tracks={summary.topTracks} /><TopArtists artists={summary.topArtists} /></div>
        <div className="grid lg:grid-cols-2 gap-6"><TopPlaylists playlists={summary.topPlaylists} /><StreamsChart platforms={summary.platforms} /></div>
        <TopCountries territories={summary.topTerritories} />
      </div>
    </MainLayout>
  );
};

export default Index;
