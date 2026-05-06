import { Link } from "react-router-dom";
import { Megaphone, Disc3, Video, BarChart3, ArrowUpRight, Zap } from "lucide-react";

const links = [
  { title: "Iniciar marketing", desc: "Campanhas e ads", icon: Megaphone, to: "/marketing/start", tone: "from-primary/20 to-primary/5", iconColor: "text-primary" },
  { title: "Distribuir música", desc: "Novo lançamento", icon: Disc3, to: "/distribution/music/new", tone: "from-accent/20 to-accent/5", iconColor: "text-accent" },
  { title: "Distribuir vídeo", desc: "YouTube, Vevo, etc", icon: Video, to: "/distribution/videos/new", tone: "from-warning/20 to-warning/5", iconColor: "text-warning" },
  { title: "Ver performance", desc: "Estatísticas em tempo real", icon: BarChart3, to: "/statistics/demographics", tone: "from-chart-5/20 to-chart-5/5", iconColor: "text-chart-5" },
];

export function QuickLinks() {
  return (
    <div className="surface p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-foreground">Ações rápidas</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {links.map((link) => (
          <Link
            key={link.to + link.title}
            to={link.to}
            className={`group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br ${link.tone} p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-elegant hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-card flex items-center justify-center ${link.iconColor} shadow-soft`}>
                <link.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="font-medium text-sm text-foreground leading-tight">{link.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
