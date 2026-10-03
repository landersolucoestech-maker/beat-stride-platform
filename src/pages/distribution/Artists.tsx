import { Link } from "react-router-dom";
import { Plus, Search, UserRound, Users } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Artists() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Artistas</h1>
            <p className="text-muted-foreground">Gerencie identidades de artistas vinculadas à sua organização.</p>
          </div>
          <Button className="gradient-primary text-primary-foreground" disabled>
            <Plus className="mr-2 h-4 w-4" />
            Novo artista
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Identidades</p>
                <p className="text-xl font-semibold text-foreground">—</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Representações ativas</p>
                <p className="text-xl font-semibold text-foreground">—</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Autoridade verificada</p>
            <p className="mt-2 text-sm font-medium text-foreground">Sem dados conectados</p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Buscar artista..." disabled />
        </div>

        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <UserRound className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">Nenhuma identidade de artista disponível</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            O cadastro de Artist Identity será exibido aqui quando a API real de catálogo e autoridade estiver conectada ao portal.
          </p>
          <Link to="/distribution/music" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
            Voltar aos lançamentos
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
