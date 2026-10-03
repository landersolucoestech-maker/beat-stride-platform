import { KeyRound, LockKeyhole, Shield, Smartphone } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSecuritySettings } from "@/features/settings/use-settings";

export default function Security() {
  const query = useSecuritySettings();
  const data = query.data;

  return <MainLayout><div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
    <div><h1 className="text-2xl font-bold text-foreground">Segurança</h1><p className="text-muted-foreground">Sessões e controles de autenticação da conta.</p></div>
    {!query.isLoading && data?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">O preview não possui autenticação real conectada. Senhas, sessões e MFA fictícios foram removidos.</div>}
    <div className="grid gap-4 sm:grid-cols-2"><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Autenticação em dois fatores</CardTitle><Shield className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="flex items-center justify-between"><p className="text-lg font-semibold">{data?.mfaEnabled === null || data?.mfaEnabled === undefined ? "—" : data.mfaEnabled ? "Ativada" : "Desativada"}</p>{data?.mfaEnabled !== null && data?.mfaEnabled !== undefined && <Badge variant="outline">{data.mfaEnabled ? "Protegida" : "Atenção"}</Badge>}</div></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Sessões ativas</CardTitle><Smartphone className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-2xl font-bold">{data?.activeSessions ?? "—"}</p></CardContent></Card></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" />Credenciais</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"><div><p className="font-medium">Última alteração de senha</p><p className="text-sm text-muted-foreground">{data?.lastPasswordChangeAt ? new Date(data.lastPasswordChangeAt).toLocaleString("pt-BR") : "—"}</p></div><Button variant="outline" disabled>Alterar senha</Button></div><div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"><div><p className="font-medium">Último acesso</p><p className="text-sm text-muted-foreground">{data?.lastLoginAt ? new Date(data.lastLoginAt).toLocaleString("pt-BR") : "—"}</p></div><LockKeyhole className="h-5 w-5 text-muted-foreground" /></div></CardContent></Card>
    <p className="text-sm text-muted-foreground">Ações críticas de segurança serão executadas pelo provedor real de autenticação e auditadas no backend; este frontend não simula rotação de senha ou MFA.</p>
  </div></MainLayout>;
}
