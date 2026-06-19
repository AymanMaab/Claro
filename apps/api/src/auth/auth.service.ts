import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly privateKey: Buffer;

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    const privatePath = config.get<string>('JWT_PRIVATE_KEY_PATH')!;
    this.privateKey = readFileSync(join(process.cwd(), privatePath));
  }

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: hashed,
      isActive: true,
    });
    await this.userRepo.save(user);

    return { message: 'Registration successful. You can now log in.' };
  }

  async login(dto: LoginDto, meta: { userAgent?: string; ip?: string } = {}) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'firstName', 'lastName', 'password', 'isActive', 'roleId'],
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedException('Account is not active');

    return this.issueTokens(user, meta);
  }

  async refresh(rawToken: string, meta: { userAgent?: string; ip?: string } = {}) {
    const records = await this.refreshTokenRepo.find({
      relations: ['user', 'user.role', 'user.role.rolePermissions', 'user.role.rolePermissions.permission'],
    });

    let matched: RefreshToken | null = null;
    for (const record of records) {
      if (await bcrypt.compare(rawToken, record.tokenHash)) {
        matched = record;
        break;
      }
    }

    if (!matched || matched.expiresAt < new Date()) {
      if (matched) await this.refreshTokenRepo.delete(matched.id);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.refreshTokenRepo.delete(matched.id);
    return this.issueTokens(matched.user, meta);
  }

  async logout(rawToken: string) {
    const records = await this.refreshTokenRepo.find();
    for (const record of records) {
      if (await bcrypt.compare(rawToken, record.tokenHash)) {
        await this.refreshTokenRepo.delete(record.id);
        break;
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredTokens() {
    const result = await this.refreshTokenRepo.delete({
      expiresAt: LessThan(new Date()),
    });
    this.logger.log(`Cleaned up ${result.affected ?? 0} expired refresh tokens`);
  }

  private async issueTokens(user: User, meta: { userAgent?: string; ip?: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.role?.id ?? null,
      roleName: user.role?.name ?? null,
      roleGroup: user.role?.group ?? null,
    };

    const accessToken = this.jwtService.sign(payload, {
      privateKey: this.privateKey,
      algorithm: 'RS256',
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '15m',
    });

    const rawRefreshToken = randomBytes(64).toString('hex');
    const tokenHash = await bcrypt.hash(rawRefreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        user,
        tokenHash,
        userAgent: meta.userAgent ?? null,
        ipAddress: meta.ip ?? null,
        expiresAt,
      }),
    );

    const permissions = (user.role?.rolePermissions ?? []).map((rp) => ({
      resource: rp.permission.resource,
      action: rp.permission.action,
    }));

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
          ? { id: user.role.id, name: user.role.name, group: user.role.group }
          : null,
        permissions,
      },
    };
  }
}
