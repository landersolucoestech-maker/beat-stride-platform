import { BadRequestException, Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { ArtistIdentityService } from "./artist-identity.service.js";

const createArtistSchema = z.object({
  canonicalName: z.string().trim().min(1).max(160),
  kind: z.enum(["PERSON", "DUO", "GROUP", "PROJECT"]),
});

function parseCreateArtist(body: unknown): z.infer<typeof createArtistSchema> {
  const parsed = createArtistSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestException({
      code: "INVALID_REQUEST",
      message: "Request body is invalid",
      details: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }
  return parsed.data;
}

@ApiTags("artist-identity")
@ApiBearerAuth()
@Controller("artists")
export class ArtistIdentityController {
  constructor(
    private readonly artists: ArtistIdentityService,
    private readonly sessions: SessionService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List artist identities associated with the active organization" })
  @ApiResponse({ status: 200, description: "Artist identities associated with the organization" })
  async list(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationContext(authorization, organizationId);
    return { items: await this.artists.listForOrganization(context.activeOrganization.organizationId) };
  }

  @Post()
  @ApiOperation({ summary: "Create an artist identity and associate it with the active organization" })
  @ApiResponse({ status: 201, description: "Artist identity created" })
  async create(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireOrganizationContext(authorization, organizationId);
    const input = parseCreateArtist(body);
    return this.artists.createForOrganization({
      organizationId: context.activeOrganization.organizationId,
      canonicalName: input.canonicalName,
      kind: input.kind,
    });
  }
}
