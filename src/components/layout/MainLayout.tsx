import type { ReactNode } from "react";
import { Bell, Search } from "lucide-react";

import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionContext } from "@/features/session/use-session-context";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const sessionQuery = useSessionContext();
  const session = sessionQuery.data;
  const searchEnabled = session?.authenticated === true && session?.available === true;
  const unreadNotifications = session?.unreadNotifications ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="ml-12 max-w-md flex-1 lg:ml-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={searchEnabled ? "Buscar músicas, artistas..." : "Busca disponível após conectar a sessão"}
                  className="border-0 bg-muted/50 pl-10 focus-visible:ring-1"
                  disabled={!searchEnabled}
                  aria-label="Busca global"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                disabled={!searchEnabled}
                aria-label={unreadNotifications > 0 ? `${unreadNotifications} notificações não lidas` : "Notificações"}
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />}
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
