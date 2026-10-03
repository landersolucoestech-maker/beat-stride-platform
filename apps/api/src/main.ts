import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module.js";
import { loadRuntimeConfig, parseAllowedOrigins } from "./platform/config/runtime-config.js";
import { CorrelationIdMiddleware } from "./platform/http/correlation-id.middleware.js";
import { HttpExceptionFilter } from "./platform/http/http-exception.filter.js";

async function bootstrap(): Promise<void> {
  const config = loadRuntimeConfig();
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const allowedOrigins = parseAllowedOrigins(config.CORS_ALLOWED_ORIGINS);

  app.use(new CorrelationIdMiddleware().use);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix("api/v1");
  app.enableShutdownHooks();

  if (allowedOrigins.length > 0) {
    app.enableCors({
      origin: allowedOrigins,
      credentials: false,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    });
  }

  const openApiConfig = new DocumentBuilder()
    .setTitle("Lander Distribution API")
    .setDescription("Proprietary music distribution and digital operations API")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup("openapi", app, document, { useGlobalPrefix: false });

  await app.listen(config.PORT, "0.0.0.0");
}

void bootstrap();
