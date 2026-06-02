import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPropertyDto: CreatePropertyDto, @Request() req: any) {
    // req.user.userId correspond à payload.sub défini dans jwt.strategy.ts
    const hostId = req.user.userId;
    return this.propertiesService.create(createPropertyDto, hostId);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
      if (!allowed.test(extname(file.originalname))) {
        return cb(new BadRequestException('Seules les images JPG, PNG, GIF et WebP sont autorisées.'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu.');
    const url = `http://localhost:3000/uploads/${file.filename}`;
    return { url, filename: file.filename };
  }

  @Get('my-listings')
  @UseGuards(JwtAuthGuard)
  findMyListings(@Request() req: any) {
    return this.propertiesService.findByHost(req.user.userId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats(@Request() req: any) {
    return this.propertiesService.getStats(req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.propertiesService.remove(id, req.user.userId);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.propertiesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }
}
