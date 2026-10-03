import { randomUUID } from "node:crypto";

import { BadRequestException, Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { SubmissionService } from "./submission.service.js";

const submitSchema = z.object({
  expectedVersion: z.number().int().positive(),
});

@ApiTags("submission")
@ApiBearerAuth()
@Controller("catalog/releases/:releaseId")
export class SubmissionController {
  constructor(
    private readonly submissions: SubmissionService,
    private readonly sessions: SessionService,
  ) {}

  @Get("readiness")
  @ApiOperation({ summary: "Evaluate release submission readiness without changing state" })
  @ApiResponse({ status: 200, description: "Current submission readiness and blockers" })
  async readiness(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("releaseId") releaseId: string,
  ) {
    const context = await this.sessions.requireOrganizationContext(authorization, organizationId);
    return this.submissions.getReadiness(context.activeOrganization.organizationId, releaseId);
  }

  @Post("submit")
  @ApiOperation({ summary: "Submit a release version to the QC workflow" })
  @ApiResponse({ status: 201, description: "Release submitted and QC review queued" })
  async submit(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Headers("x-correlation-id") correlationId: string | undefined,
    @Param("releaseId") releaseId: string,
    @Body() body: unknown,
  ) {
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: "INVALID_REQUEST",
        message: "Request body is invalid",
        details: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      });
    }

    const context = await this.sessions.requireOrganizationContext(authorization, organizationId);
    return this.submissions.submit({
      organizationId: context.activeOrganization.organizationId,
      releaseId,
      actorId: context.user.id,
      expectedVersion: parsed.data.expectedVersion,
      correlationId: correlationId && z.string().uuid().safeParse(correlationId).success ? correlationId : randomUUID(),
    });
  }
}
