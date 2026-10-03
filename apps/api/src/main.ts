import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module.js";
import { CorrelationIdMiddleware } from "./platform/http/correlation-id.middleware.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(new CorrelationIdMiddleware().use);

  const openApiConfig = new DocumentBuilder()
    .setTitle("Lander Distribution API")
    .setDescription("Proprietary music distribution platform API")
    .setVersion("0.1.0")
    .build();

  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup("openapi", app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

void bootstrap();
