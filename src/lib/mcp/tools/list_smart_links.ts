import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { container } from "@/core/container";

export default defineTool({
  name: "list_smart_links",
  title: "Listar smart links",
  description: "Lista os smart links de divulgação e suas métricas.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const data = await container.useCases.listSmartLinks.execute();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },
});
