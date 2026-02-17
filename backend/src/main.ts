import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS for both local dev and HF Spaces
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:7860',
    /\.hf\.space$/,  // Allow all HF Spaces domains
  ];
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`WagerKit API running on http://localhost:${port}`);
}
bootstrap();
