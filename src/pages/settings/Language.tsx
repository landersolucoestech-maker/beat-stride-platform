import { CheckCircle2, Languages } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Language() {
  return <MainLayout><div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
    <div><h1 className="text-2xl font-bold text-foreground">Idioma</h1><p className="text-muted-foreground">Preferências de localização da experiência do usuário.</p></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Languages className="h-5 w-5 text-primary" />Idioma do aplicativo</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-4"><div><p className="font-medium text-foreground">Português (Brasil)</p><p className="mt-1 text-sm text-muted-foreground">pt-BR · idioma inicial da interface</p></div><CheckCircle2 className="h-5 w-5 text-primary" /></div><p className="mt-4 text-sm text-muted-foreground">Outros idiomas não estão habilitados nesta fase. Contratos de API, estados de domínio e dados persistidos permanecem independentes do locale para permitir localização futura sem alterar as regras de negócio.</p></CardContent></Card>
    <Card><CardHeader><CardTitle>Formatação regional</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div className="rounded-lg bg-muted/40 p-4"><p className="text-sm text-muted-foreground">Datas</p><p className="mt-1 font-medium">DD/MM/AAAA</p></div><div className="rounded-lg bg-muted/40 p-4"><p className="text-sm text-muted-foreground">Números e moeda</p><p className="mt-1 font-medium">Padrão pt-BR de apresentação</p></div></CardContent></Card>
  </div></MainLayout>;
}
