import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { container } from "@/core/container";

export default defineTool({
  name: "list_deliveries",
  title: "Listar entregas",
  description: "Lista o status de entrega dos lançamentos para as lojas digitais.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const data = await container.useCases.listDeliveries.execute();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },
});
