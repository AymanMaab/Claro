import { usePermissions } from '../../hooks/usePermissions';

interface Props {
  resource: string;
  action: string;
  children: React.ReactNode;
}

const ProtectedElement = ({ resource, action, children }: Props) => {
  const { hasPermission } = usePermissions();
  if (!hasPermission(resource, action)) return null;
  return <>{children}</>;
};

export default ProtectedElement;
