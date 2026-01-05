import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const activeSessions = [
  {
    id: "1",
    device: "Chrome no Windows",
    location: "São Paulo, Brasil",
    lastActive: "Agora",
    current: true,
  },
  {
    id: "2",
    device: "Safari no iPhone",
    location: "São Paulo, Brasil",
    lastActive: "Há 2 horas",
    current: false,
  },
  {
    id: "3",
    device: "Firefox no MacOS",
    location: "Rio de Janeiro, Brasil",
    lastActive: "Há 3 dias",
    current: false,
  },
];

const loginHistory = [
  { date: "2024-02-15 14:30", device: "Chrome", location: "São Paulo", status: "success" },
  { date: "2024-02-14 09:15", device: "Safari", location: "São Paulo", status: "success" },
  { date: "2024-02-13 22:45", device: "Firefox", location: "Rio de Janeiro", status: "success" },
  { date: "2024-02-12 16:00", device: "Desconhecido", location: "Lisboa, Portugal", status: "blocked" },
];

export default function Security() {
  const { toast } = useToast();
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [suspiciousBlocking, setSuspiciousBlocking] = useState(true);

  const handlePasswordChange = () => {
    toast({
      title: "E-mail enviado",
      description: "Enviamos um link para redefinição de senha para seu e-mail.",
    });
  };

  const handleLogoutAll = () => {
    toast({
      title: "Sessões encerradas",
      description: "Todas as outras sessões foram encerradas.",
    });
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Segurança</h1>
          <p className="text-muted-foreground">
            Gerencie a segurança da sua conta
          </p>
        </div>

        {/* Security Score */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Nível de Segurança: Bom</h2>
              <p className="text-muted-foreground">
                Sua conta está protegida, mas você pode melhorar ativando a autenticação de dois fatores.
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-500">75%</p>
            </div>
          </div>
        </Card>

        {/* Password */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Senha</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground">Última alteração há 45 dias</p>
              <p className="text-sm text-yellow-500">
                Recomendamos alterar sua senha a cada 90 dias
              </p>
            </div>
            <Button onClick={handlePasswordChange}>Alterar Senha</Button>
          </div>
        </Card>

        {/* Two-Factor Auth */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Autenticação de Dois Fatores</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                Adicione uma camada extra de segurança à sua conta
              </p>
              {!twoFactor && (
                <p className="text-sm text-yellow-500 mt-1">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Recomendado para maior segurança
                </p>
              )}
            </div>
            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
          </div>
        </Card>

        {/* Security Preferences */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Preferências de Segurança</h2>
          
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium">Alertas de Login</p>
              <p className="text-sm text-muted-foreground">
                Receba notificações sobre novos acessos à sua conta
              </p>
            </div>
            <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} />
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Bloquear Acessos Suspeitos</p>
              <p className="text-sm text-muted-foreground">
                Bloquear automaticamente tentativas de login de locais incomuns
              </p>
            </div>
            <Switch checked={suspiciousBlocking} onCheckedChange={setSuspiciousBlocking} />
          </div>
        </Card>

        {/* Active Sessions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Sessões Ativas</h2>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogoutAll}>
              <LogOut className="h-4 w-4 mr-2" />
              Encerrar Outras
            </Button>
          </div>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="secondary" className="text-xs">
                          Atual
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      {session.lastActive}
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="ghost" size="sm">
                    Encerrar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Login History */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Histórico de Login</h2>
          <div className="space-y-3">
            {loginHistory.map((login, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {login.status === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{login.device}</p>
                    <p className="text-sm text-muted-foreground">
                      {login.location} • {login.date}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={login.status === "success" ? "secondary" : "destructive"}
                >
                  {login.status === "success" ? "Sucesso" : "Bloqueado"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
