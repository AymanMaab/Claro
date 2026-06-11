import { useEffect, useRef, useState } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useRefreshSessionMutation } from '../../store/api/authApi';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [refreshSession] = useRefreshSessionMutation();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    refreshSession()
      .finally(() => setReady(true));
  }, [refreshSession]);

  if (!ready) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
