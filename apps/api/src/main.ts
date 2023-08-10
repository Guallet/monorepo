import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set the root path to "api"
  // Updated: Since we are hosting the api in a different domain,
  // this root prefix is no longer needed
  // app.setGlobalPrefix("api");

  // Configure EXPRESS server
  app.enableCors();

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
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
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

  // Start server
  await app.listen(process.env.PORT || 5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
