import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { Logger } from 'nestjs-pino';
import { version } from './../package.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  // Configure EXPRESS server
  app.enableCors();
  app.use(helmet());
  app.use(compression());

  // Configure Swagger
  const openApiConfig = new DocumentBuilder()
    .setTitle('Guallet API')
    .setDescription('Personal finance manager')
    .setVersion(version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup('api', app, document);

  // Start server
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Guallet is running on PORT: ${port}`);
  console.log(`Version:  ${version}`);
  console.log(
    `Visit:  ${await app.getUrl()}/api to open the Swagger documentation`,
  );
}
bootstrap();
