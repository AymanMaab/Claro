import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import { Mail, Lock } from 'lucide-react';
import { Toast } from '../../components';
import { authService } from '../../services';

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_RE = /\S+@\S+\.\S+/;

const LoginPage = () => {
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!email.trim()) {
      next.email = 'Email is required.';
    } else if (!EMAIL_RE.test(email)) {
      next.email = 'Enter a valid email address.';
    }
    if (!password) {
      next.password = 'Password is required.';
    } else if (password.length < 8) {
      next.password = 'Must be at least 8 characters.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.login(email, password);
      setToast({ open: true, message: 'Logged in successfully.', severity: 'success' });
      // TODO: navigate to dashboard
    } catch (err) {
      setToast({ open: true, message: (err as Error).message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.custom.authGradient,
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 440, mb: 4 }}>
        <Box component="img" src="/CLARO-logo (1).svg" alt="Claro" sx={{ height: 56, mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Welcome to Claro
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Track your finances across all your Pakistani bank accounts
        </Typography>
      </Box>

      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 5 },
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,106,188,0.10)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 550, mb: 1 }}>
          Sign in to your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter your details to continue
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl error={!!errors.email}>
            <FormLabel htmlFor="email">Email</FormLabel>
            <OutlinedInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              size="small"
              autoComplete="email"
              startAdornment={
                <InputAdornment position="start">
                  <Mail size={16} />
                </InputAdornment>
              }
            />
            {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
          </FormControl>

          <FormControl error={!!errors.password}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <OutlinedInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              size="small"
              autoComplete="current-password"
              startAdornment={
                <InputAdornment position="start">
                  <Lock size={16} />
                </InputAdornment>
              }
            />
            {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link href="#" variant="body2" underline="hover">
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 1, py: 1.2 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
          </Button>

          <Typography variant="body2" align="center" color="text.secondary">
            Don&apos;t have an account?{' '}
            <Link href="/register" underline="hover">
              Create one
            </Link>
          </Typography>
        </Box>
      </Card>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </Box>
  );
};

export default LoginPage;
