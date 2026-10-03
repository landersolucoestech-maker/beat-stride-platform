import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { container } from "@/core/container";

export default defineTool({
  name: "list_royalties",
  title: "Listar royalties",
  description: "Lista as linhas de royalties importadas dos relatórios das lojas.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const data = await container.useCases.listRoyalties.execute();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },
});
