import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../entities/role-permission.entity';
import { PERMISSION_RULES_KEY, PermissionRule } from '../decorators/requires-permission.decorator';
import { RoleGroup } from '../enums/role-group.enum';
import { AuthenticatedUser } from '../../auth/strategies/jwt.strategy';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(RolePermission)
    private rolePermissionRepo: Repository<RolePermission>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const rules = this.reflector.getAllAndOverride<PermissionRule[]>(PERMISSION_RULES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @RequiresPermission on this route — allow through (JwtAuthGuard already validated identity)
    if (!rules || rules.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user?.roleId) throw new ForbiddenException('No role assigned');

    // SUPER_USER bypasses all permission checks
    if (user.roleGroup === RoleGroup.SUPER_USER) return true;

    // OR semantics: access granted if user satisfies ANY one rule
    for (const rule of rules) {
      const match = await this.rolePermissionRepo
        .createQueryBuilder('rp')
        .innerJoin('rp.permission', 'p')
        .where('rp.role_id = :roleId', { roleId: user.roleId })
        .andWhere('p.resource = :resource', { resource: rule.resource })
        .andWhere('p.action = :action', { action: rule.action })
        .getOne();

      if (match) return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
