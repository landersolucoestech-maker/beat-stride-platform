import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Music,
  Video,
  BarChart3,
  TrendingUp,
  Globe,
  Trophy,
  Target,
  Megaphone,
  Wrench,
  Mail,
  DollarSign,
  PieChart,
  Users,
  HelpCircle,
  MessageSquare,
  Settings,
  User,
  Shield,
  Languages,
  Wallet as WalletIcon,
  ShieldAlert,
  Link as LinkIcon,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  children?: { to: string; icon: React.ElementType; label: string }[];
}

function NavItem({ to, icon: Icon, label, children }: NavItemProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(
    children?.some((child) => location.pathname === child.to) || false
  );
  const isActive = location.pathname === to;
  const hasActiveChild = children?.some((child) => location.pathname === child.to);

  if (children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            hasActiveChild
              ? "bg-primary/10 text-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="flex-1 text-left">{label}</span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="ml-4 pl-4 border-l border-sidebar-border space-y-1">
            {children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <child.icon className="h-4 w-4" />
                <span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  );
}

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation: NavItemProps[] = [
    { to: "/", icon: LayoutDashboard, label: "Visão Geral" },
    {
      to: "/distribution",
      icon: Music,
      label: "Distribuição",
      children: [
        { to: "/distribution/music", icon: Music, label: "Gerenciar Músicas" },
        { to: "/distribution/videos", icon: Video, label: "Gerenciar Vídeos" },
        { to: "/distribution/fraud", icon: ShieldAlert, label: "Anti-Fraude" },
      ],
    },
    {
      to: "/statistics",
      icon: BarChart3,
      label: "Estatísticas",
      children: [
        { to: "/statistics/demographics", icon: Users, label: "Dados Demográficos" },
        { to: "/statistics/tiktok", icon: TrendingUp, label: "TikTok Stats" },
        { to: "/statistics/stores", icon: Globe, label: "Comparação de Lojas" },
        { to: "/statistics/charts", icon: Trophy, label: "Charts Musicais" },
        { to: "/statistics/trackers", icon: Target, label: "Rastreadores" },
      ],
    },
    {
      to: "/marketing",
      icon: Megaphone,
      label: "Marketing",
      children: [
        { to: "/marketing/start", icon: Megaphone, label: "Iniciar Marketing" },
        { to: "/marketing/smartlinks", icon: LinkIcon, label: "Smart Links" },
        { to: "/marketing/creators", icon: Users, label: "Lander Creators" },
        { to: "/marketing/tools", icon: Wrench, label: "Ferramentas Pro" },
        { to: "/marketing/emails", icon: Mail, label: "Lista de E-mails" },
      ],
    },
    {
      to: "/financial",
      icon: DollarSign,
      label: "Financeiro",
      children: [
        { to: "/financial/analytics", icon: PieChart, label: "Análises Mensais" },
        { to: "/financial/wallet", icon: WalletIcon, label: "Carteira" },
        { to: "/financial/royalties", icon: FileSpreadsheet, label: "Importar Royalties" },
        { to: "/financial/accounting", icon: DollarSign, label: "Contabilidade" },
        { to: "/financial/shares", icon: Users, label: "Gestão de Shares" },
      ],
    },
    {
      to: "/help",
      icon: HelpCircle,
      label: "Ajuda",
      children: [
        { to: "/help/support", icon: HelpCircle, label: "Central de Suporte" },
        { to: "/help/tickets", icon: MessageSquare, label: "Meus Tickets" },
      ],
    },
    {
      to: "/settings",
      icon: Settings,
      label: "Configurações",
      children: [
        { to: "/settings/profile", icon: User, label: "Meu Perfil" },
        { to: "/settings/security", icon: Shield, label: "Segurança" },
        { to: "/settings/language", icon: Languages, label: "Idioma" },
      ],
    },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>

      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Music className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground">MusicDist</h1>
              <p className="text-xs text-sidebar-foreground/60">Distribution Platform</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  Studio Demo
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  Plano Pro
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
