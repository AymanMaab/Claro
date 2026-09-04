import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Account } from '../accounts/entities/account.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,

    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    const account = await this.accountsRepository.findOne({
      where: {
        id: dto.accountId,
        user: { id: userId },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const transaction = this.transactionsRepository.create({
      user: { id: userId },
      account,
      description: dto.description,
      amount: dto.amount,
      category: dto.category,
      type: 'income',
      date: new Date(dto.date),
      hashKey: `${userId}-${dto.accountId}-${Date.now()}-${Math.random()}`,
    });

    try {
      const savedTransaction =
        await this.transactionsRepository.save(transaction);

      account.balance = Number(account.balance) + Number(dto.amount);

      await this.accountsRepository.save(account);

      return savedTransaction;
    } catch (error) {
      console.error('TRANSACTION ERROR:', error);

      throw new BadRequestException(
        error instanceof Error ? error.message : 'Transaction failed',
      );
    }
  }
}