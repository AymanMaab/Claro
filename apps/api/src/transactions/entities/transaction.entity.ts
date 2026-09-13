import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Account } from '../../accounts/entities/account.entity';
import { CsvImport } from '../../csv-import/entities/csv-import.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Account, {
    onDelete: 'CASCADE',
    eager: false,
  })
  account: Account;

  @ManyToOne(() => CsvImport, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  import: CsvImport | null;

  @Column({ unique: true })
  hashKey: string;

  @Column()
  description: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  amount: number;

  @Column()
  category: string;

  @Column()
  type: 'income' | 'expense';

  @Column({ type: 'date' })
  date: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}