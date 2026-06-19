import { SetMetadata } from '@nestjs/common';
import { Resource } from '../enums/resource.enum';
import { Action } from '../enums/action.enum';

export interface PermissionRule {
  resource: Resource;
  action: Action;
}

export const PERMISSION_RULES_KEY = 'permissionRules';

export const RequiresPermission = (
  ...rules: [Resource, Action][]
): MethodDecorator & ClassDecorator =>
  SetMetadata(
    PERMISSION_RULES_KEY,
    rules.map(([resource, action]) => ({ resource, action })),
  );
