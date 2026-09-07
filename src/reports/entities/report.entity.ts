import { Check, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type ReportSeverity = 'low' | 'medium' | 'high';

@Entity('WATER_REPORT')
@Check('CHK_WATER_REPORT_severity', `"severity" IN ('low', 'medium', 'high')`)
export class Report {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PK_WATER_REPORT' })
  id!: number;

  @Column()
  address!: string;

  @Column()
  description!: string;

  @Column({ type: 'varchar' })
  severity!: ReportSeverity;

  @Column()
  reporterPhone!: string;

  @Column({ default: false })
  isResolved!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
