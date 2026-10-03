import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { container } from "@/core/container";

export default defineTool({
  name: "list_fraud_alerts",
  title: "Listar alertas de fraude",
  description: "Lista os alertas de streams artificiais detectados.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const data = await container.useCases.listFraudAlerts.execute();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },
});
