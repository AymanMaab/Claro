import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string().email('Enter a valid email address.').required('Email is required.'),
  password: Yup.string().min(8, 'Must be at least 8 characters.').required('Password is required.'),
});

export const registerSchema = Yup.object({
  firstName: Yup.string().min(2, 'Must be at least 2 characters.').required('First name is required.'),
  lastName: Yup.string().min(2, 'Must be at least 2 characters.').required('Last name is required.'),
  email: Yup.string().email('Enter a valid email address.').required('Email is required.'),
  password: Yup.string()
    .min(8, 'Must be at least 8 characters.')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter.')
    .matches(/\d/, 'Must contain at least one number.')
    .required('Password is required.'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match.')
    .required('Please confirm your password.'),
});
