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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {releases.slice(0, 4).map((release) => (
          <div
            key={release.id}
            className="rounded-lg border border-border bg-muted/30 overflow-hidden hover:bg-muted/50 transition-colors"
          >
            <img
              src={release.cover}
              alt={release.title}
              className="w-full aspect-square object-cover"
            />
            
            <div className="p-4 space-y-2">
              <div>
                <h4 className="font-medium text-foreground truncate">{release.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{release.artist}</p>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <span className="capitalize">{release.type}</span>
                </p>
                <p>
                  Lançamento: {new Date(release.releaseDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="text-sm space-y-1 pt-2 border-t border-border">
                {release.preSaveLink ? (
                  <p>
                    Pré-save:{" "}
                    <a
                      href={release.preSaveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors underline"
                    >
                      clique aqui
                    </a>
                  </p>
                ) : (
                  <p className="text-muted-foreground">Pré-save: não disponível</p>
                )}
                <p className="flex items-center gap-2">
                  Status: <StatusBadge status={release.status} />
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
