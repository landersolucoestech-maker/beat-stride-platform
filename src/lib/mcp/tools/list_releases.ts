import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { container } from "@/core/container";

export default defineTool({
  name: "list_releases",
  title: "Listar lançamentos",
  description: "Lista os lançamentos (singles, EPs, álbuns) do catálogo de demonstração.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const data = await container.useCases.listReleases.execute();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },
});
