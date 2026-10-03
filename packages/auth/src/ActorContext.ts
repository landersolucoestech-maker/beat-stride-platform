export type ActorType = "USER" | "SERVICE" | "SYSTEM";

export interface ActorContext {
  actorType: ActorType;
  actorId: string;
  organizationId?: string;
  correlationId: string;
}

export function requireOrganizationActor(actor: ActorContext): ActorContext & { organizationId: string } {
  if (!actor.organizationId) {
    throw new Error("ORGANIZATION_CONTEXT_REQUIRED");
  }

  return actor as ActorContext & { organizationId: string };
}
