import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { envs } from '../config/envs';
import { Report } from '../reports/entities/report.entity';
import { User } from '../users/entities/user.entity';
import { CreateInitialTables1788739200000 } from './migrations/1788739200000-create-initial-tables';

export const databaseOptions: DataSourceOptions = {
  type: 'postgres',
  host: envs.dbHost,
  port: envs.dbPort,
  username: envs.dbUsername,
  password: envs.dbPassword,
  database: envs.dbName,
  entities: [Report, User],
  migrations: [CreateInitialTables1788739200000],
  synchronize: false,
  migrationsRun: false,
};

export default new DataSource(databaseOptions);
