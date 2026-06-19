import { useAppSelector } from '../store/hooks';

export function usePermissions() {
  const user = useAppSelector((state) => state.auth.user);

  const isSuperUser = user?.role?.group === 'SUPER_USER';

  function hasPermission(resource: string, action: string): boolean {
    if (isSuperUser) return true;
    return (user?.permissions ?? []).some(
      (p) => p.resource === resource && p.action === action,
    );
  }

  function hasAnyPermission(checks: { resource: string; action: string }[]): boolean {
    if (isSuperUser) return true;
    return checks.some(({ resource, action }) => hasPermission(resource, action));
  }

  return { hasPermission, hasAnyPermission, isSuperUser };
}
