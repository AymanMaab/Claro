import { useState } from 'react';
import {
  Box, Typography, Chip, CircularProgress, Alert, IconButton, Tooltip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button,
} from '@mui/material';
import { UserRound, ShieldCheck, KeyRound, Pencil, Trash2, Lock, Users, type LucideIcon } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { usePermissions } from '../../hooks/usePermissions';
import { useGetRolesQuery } from '../../store/api/rolesApi';
import { useUpdateMeMutation } from '../../store/api/usersApi';


const ProfileTab = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [updateMe, { isLoading, isSuccess, isError }] = useUpdateMeMutation();

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName:  user?.lastName  ?? '',
    email:     user?.email     ?? '',
  });

  const isDirty =
    form.firstName !== (user?.firstName ?? '') ||
    form.lastName  !== (user?.lastName  ?? '') ||
    form.email     !== (user?.email     ?? '');

  const handleSave = () => {
    if (!isDirty) return;
    updateMe(form);
  };

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Paper variant="outlined" sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="First name"
            size="small"
            fullWidth
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          />
          <TextField
            label="Last name"
            size="small"
            fullWidth
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          />
        </Box>

        <TextField
          label="Email"
          size="small"
          fullWidth
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />

        <Divider />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Role</Typography>
            <Chip
              label={user?.role?.name ?? 'No role'}
              size="small"
              color={user?.role ? 'primary' : 'default'}
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isError   && <Typography variant="caption" color="error">Failed to save</Typography>}
            {isSuccess && <Typography variant="caption" color="success.main">Saved</Typography>}
            <Button
              variant="contained"
              size="small"
              disabled={!isDirty || isLoading}
              onClick={handleSave}
            >
              {isLoading ? 'Saving…' : 'Save changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

const RolesTab = () => {
  const { data: roles, isLoading, isError } = useGetRolesQuery();
  const { hasPermission } = usePermissions();

  const canEdit   = hasPermission('roles', 'update');
  const canDelete = hasPermission('roles', 'delete');
  const canAssign = hasPermission('roles', 'assign');

  if (isLoading) return <CircularProgress size={24} />;
  if (isError)   return <Alert severity="error">Failed to load roles</Alert>;

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Role Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Members</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles?.map((role) => (
            <TableRow key={role.id} hover>
              <TableCell>{role.name}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Users size={13} />
                  {role.memberCount ?? 0}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <KeyRound size={13} />
                  {role.rolePermissions.length}
                </Box>
              </TableCell>
              <TableCell>
                {role.isSystem
                  ? <Chip label="system" size="small" variant="outlined" sx={{ fontSize: 10 }} />
                  : <Typography variant="caption" color="text.secondary">custom</Typography>
                }
              </TableCell>
              <TableCell>
                {role.isSystem ? (
                  <Tooltip title="System roles cannot be modified">
                    <Lock size={15} color="gray" />
                  </Tooltip>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {canAssign && (
                      <Tooltip title="Assign role">
                        <IconButton size="small">
                          <UserRound size={15} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canEdit && (
                      <Tooltip title="Edit role">
                        <IconButton size="small">
                          <Pencil size={15} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip title="Delete role">
                        <IconButton size="small" sx={{ color: 'error.main' }}>
                          <Trash2 size={15} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

type ActiveTab = 'profile' | 'roles';
interface TabDef { id: ActiveTab; label: string; icon: LucideIcon }

const SettingsPage = () => {
  const { hasPermission } = usePermissions();
  const canReadRoles = hasPermission('roles', 'read');

  const [active, setActive] = useState<ActiveTab>('profile');

  const tabs: TabDef[] = [
    { id: 'profile', label: 'Profile', icon: UserRound },
    ...(canReadRoles ? [{ id: 'roles' as ActiveTab, label: 'Roles', icon: ShieldCheck }] : []),
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Settings</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 3 }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <Box
              key={t.id}
              onClick={() => setActive(t.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2,
                py: 0.75,
                borderRadius: 10,
                cursor: 'pointer',
                bgcolor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? '#fff' : 'text.secondary',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                userSelect: 'none',
                transition: 'background 0.15s, color 0.15s',
                '&:hover': { bgcolor: isActive ? 'primary.main' : 'action.hover' },
              }}
            >
              <Icon size={15} />
              {t.label}
            </Box>
          );
        })}
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        {active === 'profile' ? 'Profile Details' : 'Roles & Permissions'}
      </Typography>

      {active === 'profile' && <ProfileTab />}
      {active === 'roles' && canReadRoles && <RolesTab />}
    </Box>
  );
};

export default SettingsPage;
