import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Mail, Music, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { sessionGateway, type CompanySubtype, type OrganizationType } from "@/features/session/session.gateway";

const companySubtypeLabels: Record<CompanySubtype, string> = {
  LABEL: "Gravadora",
  PRODUCER: "Produtora",
  PUBLISHER: "Editora",
  MANAGEMENT: "Management",
  AGENCY: "Agência",
  OTHER: "Outra organização",
};

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationType, setOrganizationType] = useState<OrganizationType>("INDEPENDENT_ARTIST");
  const [organizationDisplayName, setOrganizationDisplayName] = useState("");
  const [companySubtype, setCompanySubtype] = useState<CompanySubtype>("LABEL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await sessionGateway.register({
        email,
        password,
        organizationType,
        organizationDisplayName,
        companySubtype: organizationType === "COMPANY" ? companySubtype : null,
      });
      navigate("/", { replace: true });
    } catch {
      toast({
        title: "Não foi possível criar a conta",
        description: "Revise os dados informados. A senha deve ter pelo menos 12 caracteres.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
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
            <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Escolha o tipo de cliente e crie a primeira organização responsável pelo catálogo.</p>
          </div>

          <form className="space-y-6" onSubmit={submit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setOrganizationType("INDEPENDENT_ARTIST")}
                className={`rounded-xl border p-4 text-left transition-colors ${organizationType === "INDEPENDENT_ARTIST" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <UserRound className="h-5 w-5 text-primary" />
                <p className="mt-3 font-medium text-foreground">Artista Independente</p>
                <p className="mt-1 text-xs text-muted-foreground">Conta para operar o próprio catálogo e lançamentos.</p>
              </button>
              <button
                type="button"
                onClick={() => setOrganizationType("COMPANY")}
                className={`rounded-xl border p-4 text-left transition-colors ${organizationType === "COMPANY" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <Building2 className="h-5 w-5 text-primary" />
                <p className="mt-3 font-medium text-foreground">Empresa / Organização</p>
                <p className="mt-1 text-xs text-muted-foreground">Conta para gravadora, produtora, editora, management ou agência.</p>
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="register-email">E-mail</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="register-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="pl-10" required />
                </div>
              </div>
              <div>
                <Label htmlFor="register-password">Senha</Label>
                <Input id="register-password" type="password" autoComplete="new-password" minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5" required />
                <p className="mt-1 text-xs text-muted-foreground">Mínimo de 12 caracteres.</p>
              </div>
            </div>

            <div>
              <Label htmlFor="organization-name">Nome de exibição da organização</Label>
              <Input id="organization-name" value={organizationDisplayName} onChange={(event) => setOrganizationDisplayName(event.target.value)} className="mt-1.5" required />
            </div>

            {organizationType === "COMPANY" && (
              <div>
                <Label>Tipo de organização</Label>
                <Select value={companySubtype} onValueChange={(value) => setCompanySubtype(value as CompanySubtype)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(companySubtypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já possui conta? <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
