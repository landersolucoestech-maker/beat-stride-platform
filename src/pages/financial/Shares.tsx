import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Users, Percent, Music, Trash2, Edit2 } from "lucide-react";
import { releases } from "@/data/mockData";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  percentage: number;
}

interface ShareAgreement {
  id: string;
  releaseName: string;
  releaseId: string;
  collaborators: Collaborator[];
  totalPercentage: number;
  createdAt: string;
}

const mockShareAgreements: ShareAgreement[] = [
  {
    id: "1",
    releaseName: "Midnight Dreams",
    releaseId: "rel1",
    collaborators: [
      { id: "c1", name: "João Silva", email: "joao@email.com", role: "Compositor", percentage: 40 },
      { id: "c2", name: "Maria Santos", email: "maria@email.com", role: "Produtor", percentage: 30 },
      { id: "c3", name: "Carlos Lima", email: "carlos@email.com", role: "Artista", percentage: 30 },
    ],
    totalPercentage: 100,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    releaseName: "Summer Vibes EP",
    releaseId: "rel2",
    collaborators: [
      { id: "c4", name: "Ana Costa", email: "ana@email.com", role: "Compositor", percentage: 50 },
      { id: "c5", name: "Pedro Oliveira", email: "pedro@email.com", role: "Artista", percentage: 50 },
    ],
    totalPercentage: 100,
    createdAt: "2024-02-20",
  },
];

const roles = ["Compositor", "Produtor", "Artista", "Letrista", "Mixer", "Masterizador", "Outro"];

export default function Shares() {
  const [agreements, setAgreements] = useState<ShareAgreement[]>(mockShareAgreements);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: "new-1", name: "", email: "", role: "", percentage: 0 },
  ]);

  const addCollaborator = () => {
    setCollaborators([
      ...collaborators,
      { id: `new-${Date.now()}`, name: "", email: "", role: "", percentage: 0 },
    ]);
  };

  const removeCollaborator = (id: string) => {
    if (collaborators.length > 1) {
      setCollaborators(collaborators.filter((c) => c.id !== id));
    }
  };

  const updateCollaborator = (id: string, field: keyof Collaborator, value: string | number) => {
    setCollaborators(
      collaborators.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const totalPercentage = collaborators.reduce((sum, c) => sum + (c.percentage || 0), 0);

  const handleCreateAgreement = () => {
    if (!selectedRelease) {
      toast({
        title: "Erro",
        description: "Selecione um lançamento.",
        variant: "destructive",
      });
      return;
    }

    if (totalPercentage !== 100) {
      toast({
        title: "Erro",
        description: "A soma das porcentagens deve ser 100%.",
        variant: "destructive",
      });
      return;
    }

    const invalidCollaborators = collaborators.some((c) => !c.name || !c.email || !c.role);
    if (invalidCollaborators) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos dos colaboradores.",
        variant: "destructive",
      });
      return;
    }

    const release = releases.find((r) => r.id === selectedRelease);
    const newAgreement: ShareAgreement = {
      id: `agreement-${Date.now()}`,
      releaseName: release?.title || "",
      releaseId: selectedRelease,
      collaborators: collaborators,
      totalPercentage: 100,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setAgreements([newAgreement, ...agreements]);
    setIsDialogOpen(false);
    setSelectedRelease("");
    setCollaborators([{ id: "new-1", name: "", email: "", role: "", percentage: 0 }]);

    toast({
      title: "Acordo criado!",
      description: "O acordo de divisão de royalties foi criado com sucesso.",
    });
  };

  const handleDeleteAgreement = (id: string) => {
    setAgreements(agreements.filter((a) => a.id !== id));
    toast({
      title: "Acordo removido",
      description: "O acordo de divisão foi removido com sucesso.",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Shares</h1>
            <p className="text-muted-foreground">
              Gerencie a divisão de royalties entre colaboradores
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Novo Acordo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Acordo de Divisão</DialogTitle>
                <DialogDescription>
                  Defina como os royalties serão divididos entre os colaboradores.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Select Release */}
                <div>
                  <Label>Lançamento</Label>
                  <Select value={selectedRelease} onValueChange={setSelectedRelease}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione um lançamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {releases.map((release) => (
                        <SelectItem key={release.id} value={release.id}>
                          {release.title} - {release.artist}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Collaborators */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Colaboradores</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCollaborator}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {collaborators.map((collaborator, index) => (
                      <div
                        key={collaborator.id}
                        className="p-4 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-foreground">
                            Colaborador {index + 1}
                          </span>
                          {collaborators.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCollaborator(collaborator.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Nome</Label>
                            <Input
                              value={collaborator.name}
                              onChange={(e) =>
                                updateCollaborator(collaborator.id, "name", e.target.value)
                              }
                              placeholder="Nome completo"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">E-mail</Label>
                            <Input
                              type="email"
                              value={collaborator.email}
                              onChange={(e) =>
                                updateCollaborator(collaborator.id, "email", e.target.value)
                              }
                              placeholder="email@exemplo.com"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Função</Label>
                            <Select
                              value={collaborator.role}
                              onValueChange={(value) =>
                                updateCollaborator(collaborator.id, "role", value)
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Porcentagem (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={collaborator.percentage || ""}
                              onChange={(e) =>
                                updateCollaborator(
                                  collaborator.id,
                                  "percentage",
                                  Number(e.target.value)
                                )
                              }
                              placeholder="0"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Percentage */}
                  <div
                    className={`mt-4 p-3 rounded-lg flex items-center justify-between ${
                      totalPercentage === 100
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-destructive/10 border border-destructive/20"
                    }`}
                  >
                    <span className="text-sm font-medium">Total</span>
                    <span
                      className={`text-lg font-bold ${
                        totalPercentage === 100 ? "text-green-500" : "text-destructive"
                      }`}
                    >
                      {totalPercentage}%
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCreateAgreement}
                  className="w-full gradient-primary text-primary-foreground"
                  disabled={totalPercentage !== 100}
                >
                  Criar Acordo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-card border border-border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{agreements.length}</p>
                <p className="text-sm text-muted-foreground">Acordos Ativos</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card border border-border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {agreements.reduce((sum, a) => sum + a.collaborators.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Colaboradores</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card border border-border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Percent className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">100%</p>
                <p className="text-sm text-muted-foreground">Média de Divisão</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agreements List */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Acordos de Divisão</h2>
          </div>

          {agreements.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum acordo encontrado.</p>
              <p className="text-sm text-muted-foreground">
                Crie seu primeiro acordo de divisão de royalties.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {agreements.map((agreement) => (
                <div key={agreement.id} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{agreement.releaseName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Criado em {new Date(agreement.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAgreement(agreement.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead className="text-right">Porcentagem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agreement.collaborators.map((collaborator) => (
                        <TableRow key={collaborator.id}>
                          <TableCell className="font-medium">{collaborator.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {collaborator.email}
                          </TableCell>
                          <TableCell>{collaborator.role}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {collaborator.percentage}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
