import * as Yup from 'yup';

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-])[A-Za-z\d@$!%*?&#._-]{8,}$/;
export const phoneRegex = /^[1-9][0-9]{7,14}$/; // International format (no leading zero, 8-15 digits)

export const RegisterSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'Full name must be at least 3 characters')
    .required('Full Name is required'),
  email: Yup.string()
    .matches(emailRegex, 'Invalid email format')
    .required('Email is required'),
  phone: Yup.string()
    .matches(phoneRegex, 'Invalid Egyptian phone number (e.g. 01012345678)')
    .required('Phone number is required'),
  password: Yup.string()
    .matches(passwordRegex, 'Password must be at least 8 chars, with one uppercase, one lowercase, one number and one special char')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: Yup.string()
    .oneOf(['FOUNDER', 'CONSULTANT'], 'Invalid role selected')
    .required('Role is required'),

  // Founder Fields
  businessName: Yup.string().when('role', {
    is: 'FOUNDER',
    then: (schema) => schema.required('Business Name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  businessSector: Yup.string().when('role', {
    is: 'FOUNDER',
    then: (schema) => schema.required('Business Sector is required'),
    otherwise: (schema) => schema.optional(),
  }),
  foundingDate: Yup.date()
    .nullable()
    .transform((value, originalValue) => originalValue === "" ? null : value)
    .typeError('Invalid date format')
    .optional(),

  // Consultant Fields
  specialization: Yup.string().when('role', {
    is: 'CONSULTANT',
    then: (schema) => schema.required('Specialization is required'),
    otherwise: (schema) => schema.optional(),
  }),
  yearsOfExp: Yup.number()
    .transform((value, originalValue) => originalValue === "" ? undefined : value)
    .typeError('Years of experience must be a number')
    .when('role', {
      is: 'CONSULTANT',
      then: (schema) => schema.min(0, 'Must be positive').required('Years of experience is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  availability: Yup.string().when('role', {
    is: 'CONSULTANT',
    then: (schema) => schema.required('Availability is required'),
    otherwise: (schema) => schema.optional(),
  }),
});

export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

export const ProfileUpdateSchema = Yup.object().shape({
  name: Yup.string().min(3, 'Name too short').required('Name is required'),
  phone: Yup.string().matches(phoneRegex, 'Invalid phone format').optional(),
  businessName: Yup.string().optional(),
  businessSector: Yup.string().optional(),
  bio: Yup.string().optional(),
  yearsOfExp: Yup.number().typeError('Must be a number').optional(),
  specialization: Yup.string().optional(),
  foundingDate: Yup.string().optional(),
});
