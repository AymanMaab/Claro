import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleGroup } from '../enums/role-group.enum';
import { RolePermission } from './role-permission.entity';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'varchar' })
  group: RoleGroup;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Column({ name: 'parent_role_id', nullable: true })
  parentRoleId: string | null;

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'parent_role_id' })
  parentRole: Role | null;

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  memberCount?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
