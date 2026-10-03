export type AuthenticationMethod = "SESSION" | "BEARER_TOKEN" | "SERVICE_CREDENTIAL";

export interface AuthenticatedPrincipal {
  userId: string;
  sessionId: string | null;
  authenticationMethod: AuthenticationMethod;
  authenticatedAt: Date;
}

export interface AuthenticationInput {
  authorizationHeader: string | null;
  sessionCookie: string | null;
  correlationId: string;
}

export interface AuthenticationProvider {
  authenticate(input: AuthenticationInput): Promise<AuthenticatedPrincipal | null>;
}
