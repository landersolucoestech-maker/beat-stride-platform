import { BadRequestException, Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { CatalogService } from "./catalog.service.js";

const pendingFileSchema = z.object({
  fileName: z.string().trim().min(1).max(512),
  contentType: z.string().trim().min(1).max(160),
  byteSize: z.number().int().positive().max(20 * 1024 * 1024 * 1024),
});

const createReleaseSchema = z
  .object({
    title: z.string().trim().min(1).max(240),
    type: z.enum(["SINGLE", "EP", "ALBUM"]),
    primaryArtistIdentityId: z.string().uuid(),
    releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    primaryGenre: z.string().trim().min(1).max(120),
    explicit: z.boolean(),
    tracks: z.array(z.object({ title: z.string().trim().min(1).max(240), explicit: z.boolean() })).min(1).max(200),
    pendingAssets: z.object({
      artwork: pendingFileSchema.nullable(),
      tracks: z.array(pendingFileSchema.extend({ trackIndex: z.number().int().min(0) })).max(200),
    }),
  })
  .superRefine((value, context) => {
    for (const [index, asset] of value.pendingAssets.tracks.entries()) {
      if (asset.trackIndex >= value.tracks.length) {
        context.addIssue({ code: "custom", path: ["pendingAssets", "tracks", index, "trackIndex"], message: "Track asset index is outside the track list" });
      }
    }
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
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "catalog.read");
    return { items: await this.catalog.listReleases(context.activeOrganization.organizationId) };
  }

  @Get(":releaseId")
  @ApiOperation({ summary: "Get one release from the active organization" })
  async get(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("releaseId") releaseId: string,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "catalog.read");
    return this.catalog.getRelease(context.activeOrganization.organizationId, releaseId);
  }

  @Post()
  @ApiOperation({ summary: "Create a draft release, recordings, tracks and pending asset records" })
  @ApiResponse({ status: 201, description: "Draft release created" })
  async create(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "release.create");
    const input = parseCreateRelease(body);
    return this.catalog.createRelease({ ...input, organizationId: context.activeOrganization.organizationId });
  }
}
