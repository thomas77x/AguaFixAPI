import { Body, Controller, Get, Post, ServiceUnavailableException } from '@nestjs/common';
import { envs } from '../config/envs';
import { EmailService } from '../email/email.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';
import { generateReportTemplate } from './templates/report.template';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly emailService: EmailService,
  ) {}

  @Post()
  async create(@Body() dto: CreateReportDto) {
    const report = await this.reportsService.create(dto);
    try {
      await this.emailService.sendEmail(
        envs.maintenanceEmail,
        `Nueva fuga de agua · Reporte #${report.id}`,
        generateReportTemplate(dto),
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
