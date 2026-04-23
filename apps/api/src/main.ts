import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  const port = process.env['PORT'] ?? 4000;
  await app.listen(port);
  console.info(`API running on http://localhost:${port}`);
  console.info(`Swagger docs: http://localhost:${port}/v1/docs`);
}

bootstrap().catch((err) => {
  console.error('Failed to start API', err);
  process.exit(1);
});
