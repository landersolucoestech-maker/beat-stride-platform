import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  DollarSign,
  FileCheck2,
  Globe,
  HelpCircle,
  Languages,
  LayoutDashboard,
  Link as LinkIcon,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Music,
  PieChart,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  User,
  Users,
  Video,
  Wallet as WalletIcon,
  Wrench,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSessionContext } from "@/features/session/use-session-context";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  children?: { to: string; icon: React.ElementType; label: string }[];
}

function NavItem({ to, icon: Icon, label, children }: NavItemProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(children?.some((child) => location.pathname === child.to) || false);
  const isActive = location.pathname === to;
  const hasActiveChild = children?.some((child) => location.pathname === child.to);

  if (children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen((value) => !value)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            hasActiveChild
              ? "bg-primary/10 text-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="flex-1 text-left">{label}</span>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {isOpen && (
          <div className="ml-4 space-y-1 border-l border-sidebar-border pl-4">
            {children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive: childIsActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                    childIsActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  );
}

const navigation: NavItemProps[] = [
  { to: "/", icon: LayoutDashboard, label: "Visão Geral" },
  {
    to: "/distribution",
    icon: Music,
    label: "Distribuição",
    children: [
      { to: "/distribution/music", icon: Music, label: "Gerenciar Músicas" },
      { to: "/distribution/videos", icon: Video, label: "Gerenciar Vídeos" },
      { to: "/distribution/rights-protection", icon: FileCheck2, label: "Direitos e Proteção" },
      { to: "/distribution/content-id", icon: ShieldCheck, label: "Content ID e UGC" },
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
      { to: "/settings/integrations", icon: LinkIcon, label: "Integrações" },
      { to: "/settings/language", icon: Languages, label: "Idioma" },
    ],
  },
];

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sessionQuery = useSessionContext();
  const session = sessionQuery.data;
  const organizationName = session?.activeOrganization?.displayName ?? null;
  const userLabel = session?.user?.displayName || session?.user?.email || null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsCollapsed((value) => !value)}
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>

      {!isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
            <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Music className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">MusicDist</h1>
              <p className="text-xs text-sidebar-foreground/60">Distribution Platform</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navigation.map((item) => <NavItem key={item.to} {...item} />)}
          </nav>

          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                {sessionQuery.isLoading ? (
                  <>
                    <div className="h-4 w-28 animate-pulse rounded bg-sidebar-accent" />
                    <div className="mt-1 h-3 w-20 animate-pulse rounded bg-sidebar-accent" />
                  </>
                ) : session?.authenticated && organizationName ? (
                  <>
                    <p className="truncate text-sm font-medium text-sidebar-foreground">{organizationName}</p>
                    <p className="truncate text-xs text-sidebar-foreground/60">{userLabel ?? "Usuário autenticado"}</p>
                  </>
                ) : (
                  <>
                    <p className="truncate text-sm font-medium text-sidebar-foreground">Sessão não conectada</p>
                    <p className="truncate text-xs text-sidebar-foreground/60">Preview visual</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
