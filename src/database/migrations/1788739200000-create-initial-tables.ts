import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1788739200000 implements MigrationInterface {
  name = 'CreateInitialTables1788739200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "SYSTEM_USER" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "isNotificationEnabled" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_SYSTEM_USER" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_SYSTEM_USER_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "WATER_REPORT" (
        "id" SERIAL NOT NULL,
        "address" character varying NOT NULL,
        "description" character varying NOT NULL,
        "severity" character varying NOT NULL,
        "reporterPhone" character varying NOT NULL,
        "isResolved" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_WATER_REPORT" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_WATER_REPORT_severity" CHECK ("severity" IN ('low', 'medium', 'high'))
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "WATER_REPORT"');
    await queryRunner.query('DROP TABLE "SYSTEM_USER"');
  }
}
