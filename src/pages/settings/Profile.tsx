import { useEffect, useState } from "react";
import { Save, User } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfileSettings, useUpdateProfileSettings } from "@/features/settings/use-settings";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const profileQuery = useProfileSettings();
  const updateProfile = useUpdateProfileSettings();
  const { toast } = useToast();
  const profile = profileQuery.data;
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("");

  useEffect(() => {
    if (!profile?.available) return;
    setDisplayName(profile.displayName ?? "");
    setPhone(profile.phone ?? "");
    setCurrency(profile.preferredCurrency ?? "");
  }, [profile]);

  const save = async () => {
    try {
      await updateProfile.mutateAsync({ displayName: displayName.trim(), phone: phone.trim() || null, preferredCurrency: currency || null });
      toast({ title: "Perfil atualizado", description: "As preferências foram salvas no backend." });
    } catch {
      toast({ title: "Não foi possível salvar", description: "Nenhuma alteração fictícia foi aplicada.", variant: "destructive" });
    }
  };

  return <MainLayout><div className="mx-auto max-w-3xl space-y-8 animate-fade-in">
    <div><h1 className="text-2xl font-bold text-foreground">Configurações</h1><p className="text-muted-foreground">Gerencie seu perfil e as preferências pessoais disponíveis.</p></div>
    {!profileQuery.isLoading && profile?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">O preview não possui perfil autenticado conectado. Dados pessoais de demonstração foram removidos.</div>}
    <div className="rounded-xl border border-border bg-card p-6"><h2 className="mb-6 text-lg font-semibold">Meu Perfil</h2><div className="flex flex-col items-start gap-6 sm:flex-row"><div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20"><User className="h-10 w-10 text-primary" /></div><div className="grid w-full flex-1 gap-4 sm:grid-cols-2"><div><Label htmlFor="name">Nome</Label><Input id="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1" disabled={!profile?.available} /></div><div><Label htmlFor="email">E-mail</Label><Input id="email" value={profile?.email ?? ""} className="mt-1" disabled /></div><div className="sm:col-span-2"><Label htmlFor="phone">Telefone</Label><Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1" disabled={!profile?.available} /></div></div></div></div>
    <div className="rounded-xl border border-border bg-card p-6"><h2 className="mb-6 text-lg font-semibold">Preferências</h2><div className="grid gap-6 sm:grid-cols-2"><div><Label>Idioma</Label><Select value="pt-BR" disabled><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pt-BR">Português (Brasil)</SelectItem></SelectContent></Select><p className="mt-1 text-xs text-muted-foreground">pt-BR é o único locale de frontend habilitado nesta fase.</p></div><div><Label>Moeda de apresentação</Label><Select value={currency} onValueChange={setCurrency} disabled={!profile?.available}><SelectTrigger className="mt-1"><SelectValue placeholder="Definida pela conta" /></SelectTrigger><SelectContent><SelectItem value="BRL">BRL</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select><p className="mt-1 text-xs text-muted-foreground">A moeda contábil de cada transação continua sendo preservada no dado original.</p></div></div></div>
    <div className="rounded-xl border border-border bg-card p-6"><h2 className="mb-4 text-lg font-semibold">Organização ativa</h2><p className="font-medium text-foreground">{profile?.organizationName ?? "—"}</p><p className="mt-1 text-sm text-muted-foreground">{profile?.organizationType === "INDEPENDENT_ARTIST" ? "Artista Independente" : profile?.organizationType === "COMPANY" ? "Empresa / Organização" : "Sessão não conectada"}</p></div>
    <div className="flex justify-end"><Button onClick={() => void save()} disabled={!profile?.available || updateProfile.isPending} className="gradient-primary text-primary-foreground"><Save className="mr-2 h-4 w-4" />{updateProfile.isPending ? "Salvando..." : "Salvar Alterações"}</Button></div>
  </div></MainLayout>;
}
