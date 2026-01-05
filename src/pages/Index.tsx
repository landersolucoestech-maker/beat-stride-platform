import { MainLayout } from "@/components/layout/MainLayout";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { RecentReleases } from "@/components/dashboard/RecentReleases";

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
      </div>
    </MainLayout>
  );
};

export default Index;
