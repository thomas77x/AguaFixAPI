import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  ServiceUnavailableException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { envs } from '../config/envs';
import { EmailService } from '../email/email.service';
import { StorageService } from '../storage/storage.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';
import { generateReportTemplate } from './templates/report.template';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) =>
        file.mimetype.startsWith('image/')
          ? cb(null, true)
          : cb(new BadRequestException('La foto debe ser una imagen.'), false),
    }),
  )
  async create(@Body() dto: CreateReportDto, @UploadedFile() photo?: Express.Multer.File) {
    if (!photo) {
      throw new BadRequestException('La foto de la fuga (campo "photo") es obligatoria.');
    }
    const photoUrl = await this.storageService.uploadFile(photo, 'reports/');
    const report = await this.reportsService.create(dto, photoUrl);
    try {
      await this.emailService.sendEmail(
        envs.maintenanceEmail,
        `Nueva fuga de agua · Reporte #${report.id}`,
        generateReportTemplate(dto, photoUrl),
      );
    } catch {
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: 'El reporte se guardó, pero no se pudo enviar el correo. No vuelvas a crear el reporte.',
        reportId: report.id,
      });
    }
    return report;
  }

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }
}
