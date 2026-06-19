import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';
import { RolesService } from './roles.service';
import { RequiresPermission } from './decorators/requires-permission.decorator';
import { Resource } from './enums/resource.enum';
import { Action } from './enums/action.enum';
import { RoleGroup } from './enums/role-group.enum';

class CreateRoleDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(RoleGroup)
  group: RoleGroup;
}

class AssignRoleDto {
  @IsString()
  userId: string;
}

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @RequiresPermission([Resource.ROLES, Action.READ])
  @ApiOperation({ summary: 'List all roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @RequiresPermission([Resource.ROLES, Action.READ])
  @ApiOperation({ summary: 'Get role by id' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @RequiresPermission([Resource.ROLES, Action.CREATE])
  @ApiOperation({ summary: 'Create a new role' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto.name, dto.group);
  }

  @Patch(':id/assign')
  @RequiresPermission([Resource.ROLES, Action.ASSIGN])
  @ApiOperation({ summary: 'Assign role to a user' })
  assign(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    return this.rolesService.assignToUser(id, dto.userId);
  }
}
