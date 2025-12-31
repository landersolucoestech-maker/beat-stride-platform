import { Link } from "react-router-dom";
import { ExternalLink, Music } from "lucide-react";
import { releases } from "@/data/mockData";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export function RecentReleases() {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">Lançamentos Recentes</h3>
          <p className="text-sm text-muted-foreground">Seus últimos lançamentos</p>
        </div>
        <Link to="/distribution/music">
          <Button variant="ghost" size="sm">
            Ver todos
          </Button>
        </Link>
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
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{release.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{release.artist}</p>
            </div>
            
            <div className="hidden sm:block text-sm text-muted-foreground">
              <span className="capitalize">{release.type}</span>
            </div>
            
            <div className="hidden md:block text-sm text-muted-foreground">
              {new Date(release.releaseDate).toLocaleDateString('pt-BR')}
            </div>
            
            <div className="hidden lg:block text-sm">
              {release.preSaveLink ? (
                <a
                  href={release.preSaveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors underline"
                >
                  Pré-save
                </a>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
            
            <StatusBadge status={release.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
