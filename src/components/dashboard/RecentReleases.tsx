import { Music, ArrowUpRight } from "lucide-react";
import { releases } from "@/data/mockData";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "react-router-dom";

export function RecentReleases() {
  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Music className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-foreground">Lançamentos recentes</h3>
        </div>
        <Link to="/distribution/music" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          Ver tudo <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-border/60">
        {releases.slice(0, 4).map((release) => (
          <div
            key={release.id}
            className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/40 transition-colors"
          >
            <div className="relative">
              <img
                src={release.cover}
                alt={release.title}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0 ring-1 ring-border/60"
              />
              <div className="absolute -inset-1 rounded-xl gradient-primary blur opacity-0 group-hover:opacity-30 transition-opacity -z-10" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{release.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{release.artist}</p>
            </div>

            <div className="hidden md:flex flex-col items-end text-xs text-muted-foreground">
              <span>{new Date(release.releaseDate).toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}</span>
              {release.preSaveLink && (
                <a href={release.preSaveLink} target="_blank" rel="noopener noreferrer"
                  className="text-primary hover:underline mt-0.5">Pré-save ativo</a>
              )}
            </div>

            <StatusBadge status={release.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
