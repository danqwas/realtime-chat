import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
  const logger: Logger = new Logger('RealTime chat App Backend');
  const app = await NestFactory.create(AppModule);

  await app.listen(envs.port);

  logger.log(`Application listening on port ${envs.port}`);
}
bootstrap();
