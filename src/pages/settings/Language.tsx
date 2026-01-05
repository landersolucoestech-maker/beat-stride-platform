import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Calendar, Clock, DollarSign, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "es-ES", name: "Español", flag: "🇪🇸" },
  { code: "fr-FR", name: "Français", flag: "🇫🇷" },
  { code: "de-DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "it-IT", name: "Italiano", flag: "🇮🇹" },
  { code: "ja-JP", name: "日本語", flag: "🇯🇵" },
  { code: "ko-KR", name: "한국어", flag: "🇰🇷" },
];

const timezones = [
  { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
  { value: "America/New_York", label: "New York (GMT-5)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
  { value: "Europe/London", label: "Londres (GMT+0)" },
  { value: "Europe/Paris", label: "Paris (GMT+1)" },
  { value: "Asia/Tokyo", label: "Tóquio (GMT+9)" },
];

const currencies = [
  { code: "BRL", symbol: "R$", name: "Real Brasileiro" },
  { code: "USD", symbol: "$", name: "Dólar Americano" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "Libra Esterlina" },
];

const dateFormats = [
  { value: "DD/MM/YYYY", example: "15/02/2024" },
  { value: "MM/DD/YYYY", example: "02/15/2024" },
  { value: "YYYY-MM-DD", example: "2024-02-15" },
];

export default function Language() {
  const { toast } = useToast();
  const [language, setLanguage] = useState("pt-BR");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [currency, setCurrency] = useState("BRL");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  const handleSave = () => {
    toast({
      title: "Preferências salvas",
      description: "Suas preferências de idioma e região foram atualizadas.",
    });
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Idioma e Região</h1>
          <p className="text-muted-foreground">
            Configure suas preferências de idioma, fuso horário e formatos
          </p>
        </div>

        {/* Language Selection */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Idioma</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Selecione o idioma da interface
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  language === lang.code
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lang.flag}</span>
                  {language === lang.code && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </div>
                <p className="font-medium mt-2 text-sm">{lang.name}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Timezone */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Fuso Horário</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Defina seu fuso horário para exibição correta de datas e horários
          </p>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Date Format */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Formato de Data</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Escolha como as datas serão exibidas
          </p>
          <RadioGroup value={dateFormat} onValueChange={setDateFormat}>
            {dateFormats.map((format) => (
              <div
                key={format.value}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={format.value} id={format.value} />
                  <Label htmlFor={format.value} className="cursor-pointer">
                    {format.value}
                  </Label>
                </div>
                <span className="text-muted-foreground">{format.example}</span>
              </div>
            ))}
          </RadioGroup>
        </Card>

        {/* Currency */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Moeda</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Selecione a moeda para exibição de valores
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currencies.map((cur) => (
              <button
                key={cur.code}
                onClick={() => setCurrency(cur.code)}
                className={`p-4 rounded-lg border text-center transition-colors ${
                  currency === cur.code
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="text-2xl font-bold">{cur.symbol}</p>
                <p className="text-sm font-medium">{cur.code}</p>
                <p className="text-xs text-muted-foreground">{cur.name}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Salvar Preferências
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
