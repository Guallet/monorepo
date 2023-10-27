import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { SentryLogger } from './utils/sentry.logger';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new SentryLogger(),
  });

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

  // Init Sentry
  if (process.env.SENTRY_ENABLED === 'true') {
    Sentry.init({
      dsn: 'https://5a32cae961e2f278378bc957e9c4d872@o4506092862636032.ingest.sentry.io/4506093032374272',
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        // new Sentry.Integrations.Express({ app }),
        // new ProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0,
      // Set sampling rate for profiling - this is relative to tracesSampleRate
      profilesSampleRate: 1.0,
    });

    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
  }

  // Start server
  await app.listen(process.env.PORT || 5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
