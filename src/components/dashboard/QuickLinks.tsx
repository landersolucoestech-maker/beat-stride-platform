import { Link } from "react-router-dom";
import { Music, Disc, Building2, BarChart3, ChevronRight, ArrowUpRight } from "lucide-react";

const links = [
  {
    title: "Iniciar marketing",
    icon: Music,
    to: "/marketing/start",
    color: "text-primary",
  },
  {
    title: "Distribuir música",
    icon: Disc,
    to: "/distribution/music/new",
    color: "text-destructive",
  },
  {
    title: "Distribuir vídeo",
    icon: Building2,
    to: "/distribution/videos/new",
    color: "text-warning",
  },
  {
    title: "Ver performance",
    icon: BarChart3,
    to: "/statistics/demographics",
    color: "text-destructive",
  },
];

export function QuickLinks() {
  return (
    <div className="rounded-xl bg-card border border-border p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <ArrowUpRight className="h-5 w-5 text-foreground" />
        <h3 className="font-semibold text-foreground">Links rápidos</h3>
      </div>
      
      <div className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.to + link.title}
            to={link.to}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <link.icon className={`h-5 w-5 ${link.color}`} />
              <span className="text-sm text-foreground">{link.title}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
