import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  Video,
  FileText,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Headphones,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const categories = [
  {
    title: "Distribuição",
    icon: FileText,
    articles: 24,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Royalties",
    icon: BookOpen,
    articles: 18,
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Conta e Perfil",
    icon: HelpCircle,
    articles: 15,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Marketing",
    icon: Headphones,
    articles: 12,
    color: "bg-orange-500/10 text-orange-500",
  },
];

const popularArticles = [
  { id: "1", title: "Como distribuir minha primeira música?", views: 12500 },
  { id: "2", title: "Quanto tempo leva para receber os royalties?", views: 9800 },
  { id: "3", title: "Como editar informações de um lançamento?", views: 7600 },
  { id: "4", title: "Requisitos para arte de capa", views: 6400 },
  { id: "5", title: "Como funciona o split de royalties?", views: 5200 },
];

const contactOptions = [
  {
    title: "Chat ao Vivo",
    description: "Fale com nossa equipe em tempo real",
    icon: MessageCircle,
    available: true,
    action: "Iniciar Chat",
  },
  {
    title: "E-mail",
    description: "Resposta em até 24 horas",
    icon: Mail,
    available: true,
    action: "Enviar E-mail",
  },
  {
    title: "Telefone",
    description: "Seg-Sex, 9h às 18h",
    icon: Phone,
    available: false,
    action: "Ligar Agora",
  },
  {
    title: "Videochamada",
    description: "Agende uma reunião",
    icon: Video,
    available: true,
    action: "Agendar",
  },
];

export default function Support() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-2">Como podemos ajudar?</h1>
          <p className="text-muted-foreground mb-6">
            Encontre respostas rápidas ou entre em contato com nossa equipe
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar artigos, tutoriais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Categorias</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card
                key={category.title}
                className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{category.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.articles} artigos
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Articles & Contact */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Popular Articles */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Artigos Populares</h2>
              <Button variant="link" className="gap-1">
                Ver todos <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {popularArticles.map((article, idx) => (
                <div
                  key={article.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{article.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {article.views.toLocaleString()} visualizações
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </Card>

          {/* Contact Options */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Entre em Contato</h2>
            <div className="grid grid-cols-2 gap-4">
              {contactOptions.map((option) => (
                <div
                  key={option.title}
                  className={`p-4 rounded-lg border ${
                    option.available
                      ? "border-border hover:border-primary/50"
                      : "border-border/50 opacity-50"
                  } transition-colors`}
                >
                  <option.icon className="h-6 w-6 mb-2 text-primary" />
                  <p className="font-medium">{option.title}</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {option.description}
                  </p>
                  <Button
                    size="sm"
                    variant={option.available ? "default" : "secondary"}
                    disabled={!option.available}
                    className="w-full"
                  >
                    {option.action}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Ticket CTA */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Não encontrou o que procura?
              </h3>
              <p className="text-muted-foreground">
                Abra um ticket de suporte e nossa equipe irá ajudá-lo
              </p>
            </div>
            <Link to="/help/tickets">
              <Button className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Abrir Ticket
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
