import { BadRequestException, Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { CatalogService } from "./catalog.service.js";

const createReleaseSchema = z.object({
  title: z.string().trim().min(1).max(240),
  type: z.enum(["SINGLE", "EP", "ALBUM"]),
  primaryArtistIdentityId: z.string().uuid(),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  language: z.string().trim().min(2).max(32),
  primaryGenre: z.string().trim().min(1).max(120),
  copyrightLine: z.string().trim().min(1).max(240),
  phonographicCopyrightLine: z.string().trim().min(1).max(240),
});

function parseCreateRelease(body: unknown): z.infer<typeof createReleaseSchema> {
  const parsed = createReleaseSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestException({
      code: "INVALID_REQUEST",
      message: "Request body is invalid",
      details: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }
  return parsed.data;
}

@ApiTags("catalog")
@ApiBearerAuth()
@Controller("catalog/releases")
export class CatalogController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly sessions: SessionService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List releases owned by the active organization" })
  @ApiResponse({ status: 200, description: "Organization release list" })
  async list(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationContext(authorization, organizationId);
    return { items: await this.catalog.listReleases(context.activeOrganization.organizationId) };
  }

  @Get(":releaseId")
  @ApiOperation({ summary: "Get one release from the active organization" })
  async get(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("releaseId") releaseId: string,
  ) {
    const context = await this.sessions.requireOrganizationContext(authorization, organizationId);
    return this.catalog.getRelease(context.activeOrganization.organizationId, releaseId);
  }

  @Post()
  @ApiOperation({ summary: "Create a draft release for the active organization" })
  @ApiResponse({ status: 201, description: "Draft release created" })
  async create(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireOrganizationContext(authorization, organizationId);
    const input = parseCreateRelease(body);
    return this.catalog.createRelease({ ...input, organizationId: context.activeOrganization.organizationId });
  }
}
