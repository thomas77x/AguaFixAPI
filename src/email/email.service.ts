import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { envs } from '../config/envs';

@Injectable()
export class EmailService {
  private readonly transporter = createTransport({
    host: envs.smtpHost,
    port: envs.smtpPort,
    secure: envs.smtpSecure,
    auth: envs.smtpUser ? { user: envs.smtpUser, pass: envs.smtpPassword } : undefined,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  async sendEmail(to: string, subject: string, template: string): Promise<void> {
    const result = await this.transporter.sendMail({
      from: envs.smtpFrom,
      to,
      subject,
      html: template,
    });
    if (result.accepted.length === 0) {
      throw new Error('El servidor SMTP no aceptó el destinatario.');
    }
  }
}
