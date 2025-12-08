/**
 * Form Validation Schemas
 * Yup validation schemas for forms
 */

import * as yup from 'yup';

export const registerSchema = yup.object().shape({
    name: yup
        .string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters'),
    email: yup
        .string()
        .required('Email is required')
        .email('Please enter a valid email'),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            'Password must contain uppercase, lowercase, number, and special character'
        ),
    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords must match'),
    acceptTerms: yup
        .boolean()
        .oneOf([true], 'You must accept the terms and conditions'),
});

export const loginSchema = yup.object().shape({
    email: yup
        .string()
        .required('Email is required')
        .email('Please enter a valid email'),
    password: yup.string().required('Password is required'),
});

export const emailVerificationSchema = yup.object().shape({
    otp: yup
        .string()
        .required('OTP is required')
        .length(6, 'OTP must be 6 digits')
        .matches(/^\d+$/, 'OTP must contain only numbers'),
});

export const passwordResetRequestSchema = yup.object().shape({
    email: yup
        .string()
        .required('Email is required')
        .email('Please enter a valid email'),
});

export const resetPasswordSchema = yup.object().shape({
    newPassword: yup
        .string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            'Password must contain uppercase, lowercase, number, and special character'
        ),
    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export const changePasswordSchema = yup.object().shape({
    oldPassword: yup.string().required('Current password is required'),
    newPassword: yup
        .string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            'Password must contain uppercase, lowercase, number, and special character'
        )
        .notOneOf([yup.ref('oldPassword')], 'New password must be different'),
    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export const profileUpdateSchema = yup.object().shape({
    name: yup
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters'),
    email: yup
        .string()
        .email('Please enter a valid email'),
});

export const twoFactorSchema = yup.object().shape({
    token: yup
        .string()
        .required('2FA code is required')
        .length(6, '2FA code must be 6 digits')
        .matches(/^\d+$/, '2FA code must contain only numbers'),
});
