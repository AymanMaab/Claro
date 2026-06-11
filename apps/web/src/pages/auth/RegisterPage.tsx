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
import { useTheme, type Theme } from '@mui/material/styles';
import { Mail, Lock, User } from 'lucide-react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../../components';
import { useRegisterMutation } from '../../store/api/authApi';
import { registerSchema } from '../../schemas/auth.schema';

const RegisterPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        await register({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
        }).unwrap();
        setToast({ open: true, message: 'Account created! Please sign in.', severity: 'success' });
        setTimeout(() => navigate('/login'), 1500);
      } catch (err) {
        const message = (err as { data?: { message?: string | string[] }; message?: string })?.data?.message
          ?? (err as { message?: string })?.message
          ?? 'Registration failed. Please try again.';
        setToast({ open: true, message: Array.isArray(message) ? message[0] : String(message), severity: 'error' });
      }
    },
  });

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

        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <FormControl fullWidth error={formik.touched.firstName && !!formik.errors.firstName}>
                <FormLabel htmlFor="firstName">First name</FormLabel>
                <OutlinedInput
                  id="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ali"
                  size="small"
                  autoComplete="given-name"
                  startAdornment={
                    <InputAdornment position="start"><User size={16} /></InputAdornment>
                  }
                  inputProps={{
                    sx: (theme: Theme) => ({
                      '&:-webkit-autofill': {
                        WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
                        WebkitTextFillColor: theme.palette.text.primary,
                      },
                    }),
                  }}
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <FormHelperText>{formik.errors.firstName}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth error={formik.touched.lastName && !!formik.errors.lastName}>
                <FormLabel htmlFor="lastName">Last name</FormLabel>
                <OutlinedInput
                  id="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Khan"
                  size="small"
                  autoComplete="family-name"
                  startAdornment={
                    <InputAdornment position="start"><User size={16} /></InputAdornment>
                  }
                  inputProps={{
                    sx: (theme: Theme) => ({
                      '&:-webkit-autofill': {
                        WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
                        WebkitTextFillColor: theme.palette.text.primary,
                      },
                    }),
                  }}
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <FormHelperText>{formik.errors.lastName}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          <FormControl error={formik.touched.email && !!formik.errors.email}>
            <FormLabel htmlFor="email">Email</FormLabel>
            <OutlinedInput
              id="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="you@example.com"
              size="small"
              autoComplete="email"
              startAdornment={
                <InputAdornment position="start"><Mail size={16} /></InputAdornment>
              }
              inputProps={{
                sx: (theme: Theme) => ({
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                  },
                }),
              }}
            />
            {formik.touched.email && formik.errors.email && (
              <FormHelperText>{formik.errors.email}</FormHelperText>
            )}
          </FormControl>

          <FormControl error={formik.touched.password && !!formik.errors.password}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <OutlinedInput
              id="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="••••••••"
              size="small"
              autoComplete="new-password"
              startAdornment={
                <InputAdornment position="start"><Lock size={16} /></InputAdornment>
              }
              inputProps={{
                sx: (theme: Theme) => ({
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                  },
                }),
              }}
            />
            {formik.touched.password && formik.errors.password && (
              <FormHelperText>{formik.errors.password}</FormHelperText>
            )}
          </FormControl>

          <FormControl error={formik.touched.confirmPassword && !!formik.errors.confirmPassword}>
            <FormLabel htmlFor="confirmPassword">Confirm password</FormLabel>
            <OutlinedInput
              id="confirmPassword"
              type="password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="••••••••"
              size="small"
              autoComplete="new-password"
              startAdornment={
                <InputAdornment position="start"><Lock size={16} /></InputAdornment>
              }
              inputProps={{
                sx: (theme: Theme) => ({
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                  },
                }),
              }}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <FormHelperText>{formik.errors.confirmPassword}</FormHelperText>
            )}
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ mt: 1, py: 1.2 }}
          >
            {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
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
