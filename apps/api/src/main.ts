import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log(`PORT: ${process.env.PORT || '3000'}`);

  const app = await NestFactory.create(AppModule);

  // Set the root path to "api"
  // Updated: Since we are hosting the api in a different domain,
  // this root prefix is no longer needed
  // app.setGlobalPrefix("api");

  // Configure EXPRESS server
  app.enableCors();
  app.use(helmet());
  app.use(compression());

  // Configure Swagger
  const openApiConfig = new DocumentBuilder()
    .setTitle('Guallet API')
    .setDescription('Personal finance manager')
    .setVersion('1.0')
    // .addServer('htts://server-production-7ec4.up.railway.app', 'Dev')
    // .addServer('https://api.guallet.io/v1', 'Production')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup('docs', app, document);

  // Start Server
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
