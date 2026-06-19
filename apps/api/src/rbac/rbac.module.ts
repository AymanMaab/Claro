import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { PermissionGuard } from './guards/permission.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  providers: [PermissionGuard],
  exports: [TypeOrmModule, PermissionGuard],
})
export class RbacModule {}
