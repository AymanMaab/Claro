import { useState, useEffect, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

interface ToastProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

interface ToastItem {
  id: number;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

let nextId = 0;

const Toast = ({ open, message, severity, onClose, duration = 3000 }: ToastProps) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = nextId++;
    setItems((prev) => [...prev, { id, message, severity }]);
    onClose();
  }, [open, message, severity]);

  return (
    <Stack
      spacing={1}
      sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1400 }}
    >
      {items.map((item) => (
        <Snackbar
          key={item.id}
          open
          autoHideDuration={duration}
          onClose={() => remove(item.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ position: 'relative', top: 'unset', right: 'unset' }}
        >
          <Alert severity={item.severity} variant="filled" sx={{ width: '100%', minWidth: 280 }}>
            {item.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default Toast;
