import { Music } from "lucide-react";
import { releases } from "@/data/mockData";
import { StatusBadge } from "@/components/ui/status-badge";

export function RecentReleases() {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="flex items-center gap-2 p-6 pb-4">
        <Music className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Lançamentos mais recentes</h3>
      </div>
      
      <div className="divide-y divide-border">
        {releases.slice(0, 4).map((release) => (
          <div
            key={release.id}
            className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
          >
            <img
              src={release.cover}
              alt={release.title}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-primary truncate">{release.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{release.artist}</p>
            </div>
            
            <div className="hidden md:flex flex-col items-end text-sm text-muted-foreground">
              <span>Lançamento: {new Date(release.releaseDate).toLocaleDateString('pt-BR', { 
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</span>
              {release.preSaveLink ? (
                <span>
                  Pré-save: <a
                    href={release.preSaveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Clique aqui
                  </a>
                </span>
              ) : (
                <span>Pré-save: -</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Status:</span>
              <StatusBadge status={release.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
