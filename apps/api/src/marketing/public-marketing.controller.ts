import { BadRequestException, Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { MarketingService } from "./marketing.service.js";

function parseUuid(value: string): string {
  const parsed = z.string().uuid().safeParse(value);
  if (!parsed.success) {
    throw new BadRequestException({
      code: "INVALID_REQUEST",
      message: "linkId must be a valid UUID",
    });
  }
  return parsed.data;
}

function parseSlug(value: string): string {
  const parsed = z.string().min(3).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).safeParse(value);
  if (!parsed.success) {
    throw new BadRequestException({
      code: "INVALID_REQUEST",
      message: "slug is invalid",
    });
  }
  return parsed.data;
}

const publicEventSchema = z.object({
  eventType: z.enum(["PAGE_VIEW", "DESTINATION_CLICK"]),
  destinationCode: z.string().trim().min(1).max(64).regex(/^[A-Z0-9_]+$/).nullable().optional(),
  anonymousSessionId: z.string().trim().min(1).max(128).nullable().optional(),
  referrer: z.string().trim().max(2048).nullable().optional(),
  utmSource: z.string().trim().max(200).nullable().optional(),
  utmMedium: z.string().trim().max(200).nullable().optional(),
  utmCampaign: z.string().trim().max(200).nullable().optional(),
}).superRefine((value, context) => {
  if (value.eventType === "DESTINATION_CLICK" && !value.destinationCode) {
    context.addIssue({
      code: "custom",
      path: ["destinationCode"],
      message: "destinationCode is required for destination clicks",
    });
  }
  if (value.eventType === "PAGE_VIEW" && value.destinationCode) {
    context.addIssue({
      code: "custom",
      path: ["destinationCode"],
      message: "destinationCode is not allowed for page views",
    });
  }
});

@ApiTags("public-marketing")
@Controller("public/marketing-links")
export class PublicMarketingController {
  constructor(private readonly marketing: MarketingService) {}

  @Get(":linkId/:slug")
  @ApiOperation({ summary: "Get one active public Smart Link or pre-save landing page" })
  getPublicSmartLink(
    @Param("linkId") linkId: string,
    @Param("slug") slug: string,
  ) {
    return this.marketing.getPublicSmartLink(parseUuid(linkId), parseSlug(slug));
  }

  @Post(":linkId/:slug/events")
  @ApiOperation({ summary: "Record a public Smart Link page view or destination click" })
  trackEvent(
    @Param("linkId") linkId: string,
    @Param("slug") slug: string,
    @Body() body: unknown,
  ) {
    const parsed = publicEventSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: "INVALID_REQUEST",
        message: "Public marketing event is invalid",
        details: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    return this.marketing.trackPublicSmartLinkEvent({
      linkId: parseUuid(linkId),
      slug: parseSlug(slug),
      ...parsed.data,
    });
  }
}
