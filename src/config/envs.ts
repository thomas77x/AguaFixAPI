import 'dotenv/config';
import * as env from 'env-var';

export const envs = {
  port: env.get('PORT').default('3000').asPortNumber(),
  dbHost: env.get('DB_HOST').default('localhost').asString(),
  dbPort: env.get('DB_PORT').default('5432').asPortNumber(),
  dbUsername: env.get('DB_USERNAME').default('postgres').asString(),
  dbPassword: env.get('DB_PASSWORD').required().asString(),
  dbName: env.get('DB_NAME').default('aguafix').asString(),
  smtpHost: env.get('SMTP_HOST').default('localhost').asString(),
  smtpPort: env.get('SMTP_PORT').default('1025').asPortNumber(),
  smtpSecure: env.get('SMTP_SECURE').default('false').asBoolStrict(),
  smtpUser: env.get('SMTP_USER').asString(),
  smtpPassword: env.get('SMTP_PASSWORD').asString(),
  smtpFrom: env.get('SMTP_FROM').default('aguafix@example.test').asEmailString(),
  maintenanceEmail: env.get('MAINTENANCE_EMAIL').default('cuadrilla@example.test').asEmailString(),
};
