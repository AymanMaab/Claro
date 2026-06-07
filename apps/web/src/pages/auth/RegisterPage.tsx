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
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import { Mail, Lock, User } from 'lucide-react';
import { Toast } from '../../components';
import { authService } from '../../services';

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_RE = /\S+@\S+\.\S+/;
const HAS_UPPER = /[A-Z]/;
const HAS_DIGIT = /\d/;

const RegisterPage = () => {
  const theme = useTheme();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = (): boolean => {
    const rules: [keyof FieldErrors, boolean, string][] = [
      ['firstName', !form.firstName.trim(),              'First name is required.'],
      ['firstName', form.firstName.trim().length < 2,    'Must be at least 2 characters.'],
      ['lastName',  !form.lastName.trim(),               'Last name is required.'],
      ['lastName',  form.lastName.trim().length < 2,     'Must be at least 2 characters.'],
      ['email',     !form.email.trim(),                  'Email is required.'],
      ['email',     !EMAIL_RE.test(form.email),          'Enter a valid email address.'],
      ['password',  !form.password,                      'Password is required.'],
      ['password',  form.password.length < 8,            'Must be at least 8 characters.'],
      ['password',  !HAS_UPPER.test(form.password),      'Must contain at least one uppercase letter.'],
      ['password',  !HAS_DIGIT.test(form.password),      'Must contain at least one number.'],
      ['confirmPassword', !form.confirmPassword,         'Please confirm your password.'],
      ['confirmPassword', form.confirmPassword !== form.password, 'Passwords do not match.'],
    ];

    const next: FieldErrors = {};
    for (const [field, failing, message] of rules) {
      if (failing && !next[field]) next[field] = message;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.register(form.firstName, form.lastName, form.email, form.password);
      setToast({ open: true, message: 'Account created! Please sign in.', severity: 'success' });
      // TODO: navigate to login after short delay
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
        <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Start tracking your finances with Claro
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <FormControl fullWidth error={!!errors.firstName}>
                <FormLabel htmlFor="firstName">First name</FormLabel>
                <OutlinedInput
                  id="firstName"
                  value={form.firstName}
                  onChange={set('firstName')}
                  placeholder="Ali"
                  size="small"
                  autoComplete="given-name"
                  startAdornment={
                    <InputAdornment position="start"><User size={16} /></InputAdornment>
                  }
                />
                {errors.firstName && <FormHelperText>{errors.firstName}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth error={!!errors.lastName}>
                <FormLabel htmlFor="lastName">Last name</FormLabel>
                <OutlinedInput
                  id="lastName"
                  value={form.lastName}
                  onChange={set('lastName')}
                  placeholder="Khan"
                  size="small"
                  autoComplete="family-name"
                  startAdornment={
                    <InputAdornment position="start"><User size={16} /></InputAdornment>
                  }
                />
                {errors.lastName && <FormHelperText>{errors.lastName}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>

          <FormControl error={!!errors.email}>
            <FormLabel htmlFor="email">Email</FormLabel>
            <OutlinedInput
              id="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              size="small"
              autoComplete="email"
              startAdornment={
                <InputAdornment position="start"><Mail size={16} /></InputAdornment>
              }
            />
            {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
          </FormControl>

          <FormControl error={!!errors.password}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <OutlinedInput
              id="password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              size="small"
              autoComplete="new-password"
              startAdornment={
                <InputAdornment position="start"><Lock size={16} /></InputAdornment>
              }
            />
            {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
          </FormControl>

          <FormControl error={!!errors.confirmPassword}>
            <FormLabel htmlFor="confirmPassword">Confirm password</FormLabel>
            <OutlinedInput
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              placeholder="••••••••"
              size="small"
              autoComplete="new-password"
              startAdornment={
                <InputAdornment position="start"><Lock size={16} /></InputAdornment>
              }
            />
            {errors.confirmPassword && <FormHelperText>{errors.confirmPassword}</FormHelperText>}
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 1, py: 1.2 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
          </Button>

          <Typography variant="body2" align="center" color="text.secondary">
            Already have an account?{' '}
            <Link href="/login" underline="hover">
              Sign in
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

export default RegisterPage;
