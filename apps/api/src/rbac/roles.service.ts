import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';
import { RoleGroup } from './enums/role-group.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll() {
    return this.roleRepo
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'p')
      .loadRelationCountAndMap('role.memberCount', 'role.users')
      .where('role.deleted_at IS NULL')
      .orderBy('role.name', 'ASC')
      .getMany();
  }

  async findOne(id: string) {
    const role = await this.roleRepo
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'p')
      .loadRelationCountAndMap('role.memberCount', 'role.users')
      .where('role.id = :id', { id })
      .getOne();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(name: string, group: RoleGroup) {
    const exists = await this.roleRepo.findOne({ where: { name } });
    if (exists) throw new ConflictException('Role name already exists');
    const role = this.roleRepo.create({ name, group, isSystem: false });
    return this.roleRepo.save(role);
  }

  async assignToUser(roleId: string, userId: string) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.roleId = roleId;
    await this.userRepo.save(user);
    return { message: 'Role assigned' };
  }
}
