import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { container } from "@/core/container";

export default defineTool({
  name: "get_wallet",
  title: "Ver carteira do artista",
  description: "Mostra o saldo da carteira de um artista pelo ID (ex.: artist-1).",
  inputSchema: { artistId: z.string().min(1).describe("ID do artista, ex.: artist-1") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ artistId }) => {
    const data = await container.useCases.getWallet.execute(artistId);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },
});
