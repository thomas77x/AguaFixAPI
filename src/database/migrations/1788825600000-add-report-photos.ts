import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportPhotos1788825600000 implements MigrationInterface {
  name = 'AddReportPhotos1788825600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "WATER_REPORT" ADD "photoUrl" character varying NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "WATER_REPORT" ALTER COLUMN "photoUrl" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "WATER_REPORT" ADD "repairPhotoUrl" character varying`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "WATER_REPORT" DROP COLUMN "repairPhotoUrl"`);
    await queryRunner.query(`ALTER TABLE "WATER_REPORT" DROP COLUMN "photoUrl"`);
  }
}
