import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Music } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { sessionGateway } from "@/features/session/session.gateway";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await sessionGateway.login(email, password);
      const destination = typeof location.state === "object" && location.state && "from" in location.state
        ? String((location.state as { from?: string }).from || "/")
        : "/";
      navigate(destination, { replace: true });
    } catch {
      toast({
        title: "Não foi possível entrar",
        description: "Confira seu e-mail e senha ou tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary">
            <Music className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">MusicDist</p>
            <p className="text-xs text-muted-foreground">Distribution Platform</p>
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card p-7 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acesse sua organização e continue suas operações de distribuição.</p>
          </div>

          <form className="space-y-5" onSubmit={submit}>
            <div>
              <Label htmlFor="login-email">E-mail</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="login-password">Senha</Label>
              <div className="relative mt-1.5">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não possui conta? <Link to="/register" className="font-medium text-primary hover:underline">Criar conta</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
