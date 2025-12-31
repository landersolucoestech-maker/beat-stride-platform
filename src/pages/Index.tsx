import { MainLayout } from "@/components/layout/MainLayout";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { StreamsChart } from "@/components/dashboard/StreamsChart";
import { RecentReleases } from "@/components/dashboard/RecentReleases";

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

        {/* Charts and releases */}
        <div className="grid lg:grid-cols-2 gap-6">
          <StreamsChart />
          <RecentReleases />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
