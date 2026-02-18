import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  app.setGlobalPrefix('api');
  
  // Serve root health-check (HF Spaces hits GET /)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req: any, res: any) => {
    res.json({ status: 'ok', service: 'WagerKit API', docs: '/api/markets' });
  });
  
  const port = process.env.PORT || process.env.BACKEND_PORT || 3001;
  await app.listen(port);
  console.log(`WagerKit API running on http://localhost:${port}`);
}
bootstrap();
