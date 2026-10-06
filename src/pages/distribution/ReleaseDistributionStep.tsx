import { CalendarDays, Clock3, Globe2, Info, Store } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface PrototypeDistributionPreferences {
  distributor: string;
  territory: string;
  releaseDate: string;
  releaseTime: string;
  timezone: string;
  preOrder: boolean;
  disablePreviews: boolean;
  pricing: string;
  notes: string;
}

const CONNECTED_DISTRIBUTORS = [
  { value: "onerpm", label: "ONErpm" },
  { value: "symphonic", label: "Symphonic" },
  { value: "soundon", label: "SoundOn" },
] as const;

const TERRITORIES = [
  { value: "worldwide", label: "Mundo / Global" },
  { value: "brazil", label: "Brasil" },
  { value: "united-states", label: "Estados Unidos" },
  { value: "latin-america", label: "América Latina" },
  { value: "europe", label: "Europa" },
] as const;

const TIMEZONES = [
  "America/Sao_Paulo",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
] as const;

interface ReleaseDistributionStepProps {
  value: PrototypeDistributionPreferences;
  onChange: (value: PrototypeDistributionPreferences) => void;
}

export function ReleaseDistributionStep({
  value,
  onChange,
}: ReleaseDistributionStepProps) {
  const patch = (updates: Partial<PrototypeDistributionPreferences>) => {
    onChange({ ...value, ...updates });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Preferências de distribuição
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina para onde e quando este lançamento deve ser preparado.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex items-start gap-3">
          <Store className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h4 className="font-semibold text-foreground">Distribuidora</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Somente distribuidoras já conectadas aparecem no protótipo.
            </p>
          </div>
        </div>

        <Select
          value={value.distributor || "internal-only"}
          onValueChange={(selected) =>
            patch({ distributor: selected === "internal-only" ? "" : selected })
          }
        >
          <SelectTrigger className="max-w-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="internal-only">
              Somente controle interno
            </SelectItem>
            {CONNECTED_DISTRIBUTORS.map((distributor) => (
              <SelectItem key={distributor.value} value={distributor.value}>
                {distributor.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!value.distributor && (
          <div className="mt-3 flex gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Sem distribuidora selecionada, o lançamento continua salvo apenas para controle interno.
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex items-start gap-3">
          <Globe2 className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h4 className="font-semibold text-foreground">Território</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecione a disponibilidade territorial do lançamento.
            </p>
          </div>
        </div>

        <Select value={value.territory} onValueChange={(territory) => patch({ territory })}>
          <SelectTrigger className="max-w-xl">
            <SelectValue placeholder="Selecionar território" />
          </SelectTrigger>
          <SelectContent>
            {TERRITORIES.map((territory) => (
              <SelectItem key={territory.value} value={territory.value}>
                {territory.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h4 className="font-semibold text-foreground">Data e horário</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              O arquivo recomenda planejar a data com pelo menos 21 dias de antecedência.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="distribution-release-date">Data de lançamento</Label>
            <Input
              id="distribution-release-date"
              type="date"
              className="mt-1.5"
              value={value.releaseDate}
              onChange={(event) => patch({ releaseDate: event.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="distribution-release-time">Hora de lançamento</Label>
            <Input
              id="distribution-release-time"
              type="time"
              className="mt-1.5"
              value={value.releaseTime}
              onChange={(event) => patch({ releaseTime: event.target.value })}
            />
            <p className="mt-1 text-xs text-muted-foreground">Opcional.</p>
          </div>

          <div>
            <Label>Fuso horário</Label>
            <Select value={value.timezone} onValueChange={(timezone) => patch({ timezone })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((timezone) => (
                  <SelectItem key={timezone} value={timezone}>
                    {timezone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex items-start gap-3">
          <Clock3 className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h4 className="font-semibold text-foreground">Pré-venda</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure o comportamento anterior à data oficial de lançamento.
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={value.preOrder}
            onCheckedChange={(checked) => patch({ preOrder: checked === true })}
          />
          <span>
            <span className="block text-sm font-medium text-foreground">Pré-venda</span>
            <span className="block text-xs text-muted-foreground">
              Disponibiliza a opção de pré-venda antes do lançamento.
            </span>
          </span>
        </label>

        {value.preOrder && (
          <label className="mt-4 flex cursor-pointer items-start gap-3 pl-7">
            <Checkbox
              checked={value.disablePreviews}
              onCheckedChange={(checked) =>
                patch({ disablePreviews: checked === true })
              }
            />
            <span>
              <span className="block text-sm font-medium text-foreground">
                Sem prévias durante o pré-lançamento
              </span>
              <span className="block text-xs text-muted-foreground">
                Oculta trechos de áudio enquanto o lançamento estiver em pré-venda.
              </span>
            </span>
          </label>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label>Precificação</Label>
            <Select value={value.pricing} onValueChange={(pricing) => patch({ pricing })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Personalizado</SelectItem>
                <SelectItem value="standard">Padrão</SelectItem>
                <SelectItem value="free">Gratuito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="distribution-notes">Notas de distribuição</Label>
            <Textarea
              id="distribution-notes"
              className="mt-1.5 min-h-32"
              value={value.notes}
              onChange={(event) => patch({ notes: event.target.value })}
              placeholder="Data preferencial, territórios, exclusividades ou outras instruções"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
