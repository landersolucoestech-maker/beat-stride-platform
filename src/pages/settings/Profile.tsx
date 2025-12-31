import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { User, Camera, Save } from "lucide-react";
import { supportedDSPs, languages } from "@/data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Profile() {
  const [name, setName] = useState("Studio Demo");
  const [email, setEmail] = useState("demo@musicdist.com");
  const [phone, setPhone] = useState("+55 11 99999-9999");
  const [language, setLanguage] = useState("pt");
  const [currency, setCurrency] = useState("BRL");
  const [distributionFee, setDistributionFee] = useState("15");
  const [dsps, setDsps] = useState(supportedDSPs);

  const handleSave = () => {
    toast({
      title: "Configurações salvas!",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  const toggleDsp = (name: string) => {
    setDsps(dsps.map(d => d.name === name ? { ...d, enabled: !d.enabled } : d));
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie seu perfil e preferências</p>
        </div>

        {/* Profile section */}
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Meu Perfil</h2>
          
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 grid sm:grid-cols-2 gap-4 w-full">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences section */}
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Preferências</h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <Label>Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Moeda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (BRL)</SelectItem>
                  <SelectItem value="USD">Dólar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="sm:col-span-2">
              <Label>Taxa de Distribuição (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={distributionFee}
                onChange={(e) => setDistributionFee(e.target.value)}
                className="mt-1 max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentual retido sobre os royalties
              </p>
            </div>
          </div>
        </div>

        {/* DSPs section */}
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Plataformas Suportadas</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {dsps.map((dsp) => (
              <div
                key={dsp.name}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{dsp.icon}</span>
                  <span className="font-medium text-foreground">{dsp.name}</span>
                </div>
                <Switch
                  checked={dsp.enabled}
                  onCheckedChange={() => toggleDsp(dsp.name)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
