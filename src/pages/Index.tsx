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
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Bem-vindo de volta</p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
              Painel <span className="text-gradient">geral</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">Aqui está um resumo do que aconteceu hoje no seu catálogo.</p>
        </div>

        {/* Top section - Wallet and Quick Links */}
        <div className="grid lg:grid-cols-2 gap-6">
          <WalletCard />
          <QuickLinks />
        </div>

        {/* Recent Releases */}
        <RecentReleases />

        {/* Statistics Section - Total Streams with Top Streams + Top Artists */}
        <div className="grid lg:grid-cols-3 gap-6">
          <TotalStreams />
          <TopStreams />
          <TopArtists />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <TopPlaylists />
          <StreamsChart />
        </div>

        {/* Top Territories - Full Width */}
        <TopCountries />
      </div>
    </MainLayout>
  );
};

export default Index;
