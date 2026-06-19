import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { User } from '../../users/entities/user.entity';
import { RoleGroup } from '../../rbac/enums/role-group.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string | null;
  roleName: string | null;
  roleGroup: RoleGroup | null;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string | null;
  roleName: string | null;
  roleGroup: RoleGroup | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    const publicKeyPath = config.get<string>('JWT_PUBLIC_KEY_PATH')!;
    const publicKey = readFileSync(join(process.cwd(), publicKeyPath));

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      relations: ['role'],
    });

    if (!user || !user.isActive) throw new UnauthorizedException();

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.role?.id ?? null,
      roleName: user.role?.name ?? null,
      roleGroup: (user.role?.group as RoleGroup) ?? null,
    };
  }
}
