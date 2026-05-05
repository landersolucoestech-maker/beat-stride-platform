# Arquitetura DDD / Clean Architecture

Este projeto segue uma arquitetura em camadas inspirada em DDD + Clean Architecture,
adaptada para o frontend React+Vite enquanto o protótipo usa repositórios in-memory.

## Camadas

```
src/core/<bounded-context>/
├── domain/         # Entidades, Value Objects, Ports (Repositories), regras puras
├── application/    # Use Cases, Mappers (DTO ↔ Domain), DTOs
└── infra/          # Adapters concretos (in-memory hoje, HTTP/PG amanhã)
```

A UI (`src/pages`, `src/components`) NUNCA importa diretamente do `domain` —
sempre passa por `application` (DTOs e Use Cases) através do **container**
(`src/core/container.ts`) ou dos hooks em `src/hooks/useCore.ts`.

## Bounded Contexts

| Contexto | Aggregate Root | Responsabilidade |
|----------|----------------|------------------|
| `catalog` | Release | Artistas, releases, faixas, metadados |
| `distribution` | Delivery | Envio para DSPs, status de entrega |
| `royalties` | RoyaltyLine | Importação de relatórios DSP, cálculo de líquido |
| `wallet` | Wallet | Saldo do artista, retiradas (Withdrawal) |
| `smartlinks` | SmartLink | Links unificados com métricas |
| `fraud` | FraudAlert | Detecção de streams artificiais |

## Regras

1. **Domain puro**: nenhuma referência a React, fetch, banco ou HTTP.
2. **Mappers obrigatórios**: dados que entram/saem do domínio passam por um mapper.
3. **Repositories como ports**: interface no `domain`, implementação no `infra`.
4. **Use Cases orquestram**: regra de negócio mora no domínio, orquestração no use case.
5. **Composition Root** (`container.ts`) é o ÚNICO lugar que junta tudo.

## Trocando in-memory por backend real

Basta criar `infra/HttpReleaseRepository.ts` que implemente `ReleaseRepository`
e trocar a instância no `container.ts`. Nada mais muda.

## Exemplo de fluxo (Importar Royalty Report)

```
UI (RoyaltyImport.tsx)
  → container.useCases.importRoyalties.execute(input)
    → ImportRoyaltyReportUseCase
      → cria entidades RoyaltyLine (regras de domínio)
      → InMemoryRoyaltyRepository.saveBatch(lines)
    ← retorna ImportRoyaltyReportOutput (DTO)
  ← exibe toast + recarrega lista via hook
```
