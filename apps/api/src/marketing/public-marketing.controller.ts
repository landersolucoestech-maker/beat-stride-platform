import { BadRequestException, Controller, Get, Param } from "@nestjs/common";
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
}
