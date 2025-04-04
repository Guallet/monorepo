import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { Logger } from 'nestjs-pino';
import { version } from './../package.json';

const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  if (isProduction) {
    app.useLogger(app.get(Logger));
  }

  // Configure EXPRESS server
  const allowedOriginsRawValue = process.env.ALLOWED_CORS_ORIGINS ?? '';
  const allowedOrigins = allowedOriginsRawValue.split(',');

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
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
