import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // Créer le dossier uploads/ s'il n'existe pas
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('[SERVER] Dossier uploads/ créé');
  }
  // Servir les fichiers uploadés statiquement
  app.use('/uploads', express.static(uploadsDir));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
