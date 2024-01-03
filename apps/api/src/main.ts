import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { SupertokensExceptionFilter } from './core/auth/auth.filter';
import supertokens from 'supertokens-node';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);

  // Set the root path to "api"
  // Updated: Since we are hosting the api in a different domain,
  // this root prefix is no longer needed
  // app.setGlobalPrefix("api");

  // Configure EXPRESS server
  app.enableCors({
    origin: [
      configService.get<string>('auth.supertokens.appInfo.websiteDomain'),
      process.env.SUPERTOKENS_WEBSITE_DOMAIN,
    ],
    allowedHeaders: ['Content-Type', ...supertokens.getAllCORSHeaders()],
    credentials: true,
  });

  // Configure SuperTokens Exceptions
  app.useGlobalFilters(new SupertokensExceptionFilter());

  // Enable Helmet with GraphQL as per https://docs.nestjs.com/security/helmet
  app.use(
    helmet({
      // TODO: Should we disable this on Production?
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
            'https://cdn.jsdelivr.net/gh/supertokens/',
          ],
          scriptSrc: [
            `'self'`,
            `https: 'unsafe-inline'`,
            'unsafe-inline', // Do we need this? Is not this covered by the above? Required for supertokens though
            'https://cdn.jsdelivr.net/gh/supertokens/',
          ],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );
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
  SwaggerModule.setup('api', app, document);

  // Start server
  await app.listen(process.env.PORT || 5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
