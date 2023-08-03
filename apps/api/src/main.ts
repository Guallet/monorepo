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
  app.use(helmet());
  app.use(compression());

  await app.listen(process.env.PORT || 5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
