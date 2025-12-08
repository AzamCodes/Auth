/**
 * Password Strength Utilities
 * Calculate and display password strength
 */

export const calculatePasswordStrength = (password) => {
    let strength = 0;

    if (!password) return { score: 0, label: 'None', color: 'error' };

    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Character type checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

    // Map strength to label and color
    const strengthMap = {
        0: { score: 0, label: 'None', color: 'error' },
        1: { score: 16, label: 'Very Weak', color: 'error' },
        2: { score: 33, label: 'Weak', color: 'warning' },
        3: { score: 50, label: 'Fair', color: 'info' },
        4: { score: 66, label: 'Good', color: 'primary' },
        5: { score: 83, label: 'Strong', color: 'success' },
        6: { score: 100, label: 'Very Strong', color: 'success' },
    };

    return strengthMap[strength];
};

export const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain a lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain an uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain a number');
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
        errors.push('Password must contain a special character');
    }

    return errors;
};
