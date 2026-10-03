import { BadRequestException, Body, Controller, Headers, HttpCode, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { AuthService } from "./auth.service.js";

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(12).max(256),
    organizationType: z.enum(["INDEPENDENT_ARTIST", "COMPANY"]),
    organizationDisplayName: z.string().trim().min(1).max(160),
    organizationLegalName: z.string().trim().min(1).max(240).nullable().optional(),
    companySubtype: z.enum(["LABEL", "PRODUCER", "PUBLISHER", "MANAGEMENT", "AGENCY", "OTHER"]).nullable().optional(),
  })
  .superRefine((value, context) => {
    if (value.organizationType === "INDEPENDENT_ARTIST" && value.companySubtype != null) {
      context.addIssue({ code: "custom", path: ["companySubtype"], message: "Independent artist accounts cannot define a company subtype" });
    }
    if (value.organizationType === "COMPANY" && value.companySubtype == null) {
      context.addIssue({ code: "custom", path: ["companySubtype"], message: "Company accounts require a company subtype" });
    }
  });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(256),
});

function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestException({
      code: "INVALID_REQUEST",
      message: "Request body is invalid",
      details: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }
  return parsed.data;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionService,
  ) {}

  @Post("register")
  @ApiOperation({ summary: "Create a user and the first customer organization" })
  @ApiResponse({ status: 201, description: "Account and initial organization created" })
  register(@Body() body: unknown) {
    const parsed = parseBody(registerSchema, body);
    return this.auth.register({
      email: parsed.email,
      password: parsed.password,
      organizationType: parsed.organizationType,
      organizationDisplayName: parsed.organizationDisplayName,
      organizationLegalName: parsed.organizationLegalName ?? null,
      companySubtype: parsed.companySubtype ?? null,
    });
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Authenticate with email and password" })
  @ApiResponse({ status: 200, description: "Authenticated session created" })
  login(@Body() body: unknown) {
    return this.auth.login(parseBody(loginSchema, body));
  }

  @Post("logout")
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Revoke the current bearer session" })
  async logout(@Headers("authorization") authorization: string | undefined): Promise<void> {
    await this.sessions.revoke(authorization);
  }
}
