import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { container } from "@/core/container";

export default defineTool({
  name: "list_artists",
  title: "Listar artistas",
  description: "Lista os artistas do catálogo de demonstração.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const data = await container.useCases.listArtists.execute();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },
});
