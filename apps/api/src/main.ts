import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env['PORT'] ?? 4000;
  await app.listen(port);
  console.info(`API running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start API', err);
  process.exit(1);
});
