import { Link } from "react-router-dom";
import { Megaphone, Music, Video, BarChart3, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    title: "Iniciar Marketing",
    description: "Promova sua música",
    icon: Megaphone,
    to: "/marketing/start",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    title: "Distribuir Música",
    description: "Novo lançamento",
    icon: Music,
    to: "/distribution/music/new",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Distribuir Vídeo",
    description: "Upload de vídeo",
    icon: Video,
    to: "/distribution/videos/new",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    title: "Ver Performance",
    description: "Dados e estatísticas",
    icon: BarChart3,
    to: "/statistics/demographics",
    color: "bg-chart-4/10 text-chart-4",
  },
];

export function QuickLinks() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="group relative overflow-hidden rounded-xl bg-card border border-border p-4 hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
        >
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", link.color)}>
            <link.icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1">{link.title}</h3>
          <p className="text-xs text-muted-foreground">{link.description}</p>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}
    </div>
  );
}
