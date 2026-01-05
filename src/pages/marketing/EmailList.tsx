import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Users,
  TrendingUp,
  Download,
  Upload,
  Search,
  Plus,
  Send,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

const emailStats = {
  total: 4580,
  active: 4120,
  newThisMonth: 342,
  avgOpenRate: 45.2,
};

const subscribers = [
  { id: "1", email: "joao@example.com", name: "João Silva", source: "Pre-Save", date: "2024-02-15", status: "active" },
  { id: "2", email: "maria@example.com", name: "Maria Santos", source: "Landing Page", date: "2024-02-14", status: "active" },
  { id: "3", email: "pedro@example.com", name: "Pedro Costa", source: "Pre-Save", date: "2024-02-13", status: "active" },
  { id: "4", email: "ana@example.com", name: "Ana Beatriz", source: "Show", date: "2024-02-12", status: "active" },
  { id: "5", email: "lucas@example.com", name: "Lucas Lima", source: "Landing Page", date: "2024-02-11", status: "unsubscribed" },
  { id: "6", email: "julia@example.com", name: "Julia Ferreira", source: "Pre-Save", date: "2024-02-10", status: "active" },
];

const campaigns = [
  { id: "1", name: "Lançamento Sunset Dreams", sent: 4200, opened: 1890, clicked: 456, date: "2024-02-10" },
  { id: "2", name: "Newsletter Janeiro", sent: 4000, opened: 1720, clicked: 380, date: "2024-01-15" },
  { id: "3", name: "Feliz Ano Novo!", sent: 3800, opened: 2100, clicked: 520, date: "2024-01-01" },
];

export default function EmailList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === "all" || sub.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Lista de E-mails</h1>
            <p className="text-muted-foreground">
              Gerencie seus contatos e campanhas de e-mail
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar
            </Button>
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              Nova Campanha
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailStats.total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total de Contatos</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Mail className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailStats.active.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <UserPlus className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">+{emailStats.newThisMonth}</p>
                <p className="text-sm text-muted-foreground">Novos este Mês</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emailStats.avgOpenRate}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Abertura</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Campanhas Recentes</h2>
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </div>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{campaign.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(campaign.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold">{campaign.sent.toLocaleString()}</p>
                    <p className="text-muted-foreground">Enviados</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</p>
                    <p className="text-muted-foreground">Abertura</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{((campaign.clicked / campaign.sent) * 100).toFixed(1)}%</p>
                    <p className="text-muted-foreground">Cliques</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Subscribers Table */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold">Contatos</h2>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Pre-Save">Pre-Save</SelectItem>
                  <SelectItem value="Landing Page">Landing Page</SelectItem>
                  <SelectItem value="Show">Show</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="hidden md:table-cell">Fonte</TableHead>
                  <TableHead className="hidden sm:table-cell">Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>{sub.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{sub.source}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(sub.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={sub.status === "active" ? "default" : "secondary"}
                        className={sub.status === "active" ? "bg-green-500/10 text-green-500" : ""}
                      >
                        {sub.status === "active" ? "Ativo" : "Cancelado"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
