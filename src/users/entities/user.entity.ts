import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('SYSTEM_USER')
@Unique('UQ_SYSTEM_USER_email', ['email'])
export class User {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PK_SYSTEM_USER' })
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ default: true })
  isNotificationEnabled!: boolean;
}
