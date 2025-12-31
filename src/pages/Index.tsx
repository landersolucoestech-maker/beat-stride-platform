import { MainLayout } from "@/components/layout/MainLayout";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { StreamsChart } from "@/components/dashboard/StreamsChart";
import { RecentReleases } from "@/components/dashboard/RecentReleases";
import { TopStreams } from "@/components/dashboard/TopStreams";
import { TopArtists } from "@/components/dashboard/TopArtists";
import { TopPlaylists } from "@/components/dashboard/TopPlaylists";
import { TopCountries } from "@/components/dashboard/TopCountries";
import { TopCities } from "@/components/dashboard/TopCities";
import { TotalStreams } from "@/components/dashboard/TotalStreams";

const Index = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui está o resumo da sua conta.</p>
        </div>

        {/* Top section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <WalletCard />
          <div className="lg:col-span-2">
            <QuickLinks />
          </div>
        </div>

        {/* Recent Releases */}
        <RecentReleases />

        {/* Total Streams, Top Streams and Top Artists - 3 columns */}
        <div className="grid lg:grid-cols-3 gap-6">
          <TotalStreams />
          <TopStreams />
          <TopArtists />
        </div>

        {/* Top Playlists, Top Countries and Streams by Platform - 3 columns */}
        <div className="grid lg:grid-cols-3 gap-6">
          <TopPlaylists />
          <TopCountries />
          <StreamsChart />
        </div>

        {/* Top Cities */}
        <TopCities />
      </div>
    </MainLayout>
  );
};

export default Index;
