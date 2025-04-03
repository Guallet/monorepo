import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { Logger } from 'nestjs-pino';
import { version } from './../package.json';
import { useApitally } from 'apitally/nestjs';

const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  if (isProduction) {
    app.useLogger(app.get(Logger));
  }

  // Enable Apitally
  const isApitallyEnabled = process.env.APITALLY_ENABLED === 'true';
  if (isApitallyEnabled) {
    useApitally(app, {
      clientId: process.env.APITALLY_CLIENT_ID ?? '',
      env: process.env.APITALLY_ENV ?? 'dev', // or "prod" etc.
    });
  }

  // Configure EXPRESS server
  app.enableCors();
  app.use(helmet());
  app.use(compression());

  // Configure Swagger
  const docsPath = 'swagger';
  const openApiConfig = new DocumentBuilder()
    .setTitle('Guallet API')
    .setDescription('Personal finance manager')
    .setVersion(version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup(docsPath, app, document);

  // Start server
  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  console.log(`Guallet is running on PORT: ${port}`);
  console.log(`Version:  ${version}`);
  console.log(
    `Visit:  ${await app.getUrl()}/${docsPath} to open the Swagger documentation`,
  );
}

void bootstrap();
