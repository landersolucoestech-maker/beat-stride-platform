import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      {/* aurora background */}
      <div className="pointer-events-none fixed inset-0 -z-10 gradient-aurora opacity-70" />
      <AppSidebar />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-xl border-b border-border/60">
          <div className="flex items-center justify-between gap-4 px-6 py-3">
            <div className="flex-1 max-w-md ml-12 lg:ml-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar músicas, artistas, releases..."
                  className="pl-10 h-10 bg-muted/40 border-border/50 rounded-full focus-visible:ring-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Pro
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
