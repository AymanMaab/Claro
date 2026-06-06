import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Account } from '../../accounts/entities/account.entity';

@Entity('csv_imports')
export class CsvImport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  account: Account;

  @Column()
  fileName: string;

  @Column()
  bankName: string;

  @Column()
  totalRows: number;

  @Column()
  imported: number;

  @Column()
  skipped: number;

  @Column()
  status: 'completed' | 'failed';

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  importedAt: Date;
}
