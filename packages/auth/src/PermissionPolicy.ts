export interface PermissionEvaluationInput {
  permissionKey: string;
  grantedPermissionKeys: ReadonlySet<string>;
  organizationMatches: boolean;
  resourceScopeMatches: boolean;
  domainAuthoritySatisfied: boolean;
  policySatisfied: boolean;
}

export type PermissionDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason:
        | "PERMISSION_NOT_GRANTED"
        | "ORGANIZATION_SCOPE_MISMATCH"
        | "RESOURCE_SCOPE_MISMATCH"
        | "DOMAIN_AUTHORITY_REQUIRED"
        | "POLICY_DENIED";
    };

export function evaluatePermission(input: PermissionEvaluationInput): PermissionDecision {
  if (!input.grantedPermissionKeys.has(input.permissionKey)) return { allowed: false, reason: "PERMISSION_NOT_GRANTED" };
  if (!input.organizationMatches) return { allowed: false, reason: "ORGANIZATION_SCOPE_MISMATCH" };
  if (!input.resourceScopeMatches) return { allowed: false, reason: "RESOURCE_SCOPE_MISMATCH" };
  if (!input.domainAuthoritySatisfied) return { allowed: false, reason: "DOMAIN_AUTHORITY_REQUIRED" };
  if (!input.policySatisfied) return { allowed: false, reason: "POLICY_DENIED" };
  return { allowed: true };
}
