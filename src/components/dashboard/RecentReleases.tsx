import { Disc3, Music } from "lucide-react";

import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import type { DashboardRelease } from "@/features/dashboard/dashboard.types";

interface RecentReleasesProps {
  releases: DashboardRelease[];
}

export function RecentReleases({ releases }: RecentReleasesProps) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="flex items-center gap-2 p-6 pb-4">
        <Music className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Lançamentos mais recentes</h3>
      </div>

      {releases.length === 0 ? (
        <DashboardEmptyState title="Nenhum lançamento disponível" description="Seus lançamentos aparecerão aqui quando o catálogo real estiver conectado." compact />
      ) : (
        <div className="divide-y divide-border">
          {releases.slice(0, 4).map((release) => (
            <div key={release.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
              {release.coverUrl ? (
                <img src={release.coverUrl} alt={release.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Disc3 className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-primary truncate">{release.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{release.artistName}</p>
              </div>
              <div className="hidden md:block text-sm text-muted-foreground">
                {new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${release.releaseDate}T00:00:00Z`))}
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{release.statusLabel}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
