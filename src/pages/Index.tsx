import { MainLayout } from "@/components/layout/MainLayout";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { RecentReleases } from "@/components/dashboard/RecentReleases";
import { TotalStreams } from "@/components/dashboard/TotalStreams";
import { TopStreams } from "@/components/dashboard/TopStreams";
import { TopArtists } from "@/components/dashboard/TopArtists";
import { TopPlaylists } from "@/components/dashboard/TopPlaylists";
import { TopCountries } from "@/components/dashboard/TopCountries";
import { StreamsChart } from "@/components/dashboard/StreamsChart";

const Index = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel geral</h1>
        </div>

        {/* Top section - Wallet and Quick Links */}
        <div className="grid lg:grid-cols-2 gap-6">
          <WalletCard />
          <QuickLinks />
        </div>

        {/* Recent Releases */}
        <RecentReleases />

        {/* Statistics Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <TotalStreams />
          <TopStreams />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <TopArtists />
          <TopPlaylists />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <TopCountries />
          <StreamsChart />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
