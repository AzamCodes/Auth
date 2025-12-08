
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, logout, register, validate2FA, reset } from '../redux/authSlice';
import authService from '../services/authService';
import { toast } from 'react-toastify';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, isError, isSuccess, message, requiresTwoFactor, tempUserId } = useSelector((state) => state.auth);

    // Login
    const loginUser = async (credentials) => {
        try {
            const result = await dispatch(login(credentials)).unwrap();

            if (result.requiresTwoFactor) {
                navigate('/verify-2fa');
            } else {
                toast.success('Login successful!');
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error);
        }
    };

    // Register
    const registerUser = async (userData) => {
        try {
            const result = await dispatch(register(userData)).unwrap();
            toast.success('Registration successful! Please check your email for verification code.');
            navigate('/verify-email', { state: { userId: result.userId } });
        } catch (error) {
            toast.error(error);
        }
    };

    // Logout
    const logoutUser = async () => {
        try {
            await dispatch(logout()).unwrap();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Logout failed');
            navigate('/login');
        }
    };

    // Validate 2FA
    const validate2FACode = async (token) => {
        try {
            await dispatch(validate2FA({ userId: tempUserId, token })).unwrap();
            toast.success('2FA verified successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error);
        }
    };

    // Verify email
    const verifyEmail = async (userId, otp) => {
        try {
            const result = await authService.verifyEmail(userId, otp);
            toast.success(result.message);
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
            throw error;
        }
    };

    // Request password reset
    const requestPasswordReset = async (email) => {
        try {
            const result = await authService.requestPasswordReset(email);
            toast.success(result.message);
            return result;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Request failed');
            throw error;
        }
    };

    // Reset password
    const resetPassword = async (resetToken, newPassword) => {
        try {
            const result = await authService.resetPassword(resetToken, newPassword);
            toast.success(result.message);
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reset failed');
            throw error;
        }
    };

    // Reset state
    const resetAuthState = () => {
        dispatch(reset());
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        isError,
        isSuccess,
        message,
        requiresTwoFactor,
        tempUserId,
        loginUser,
        registerUser,
        logoutUser,
        validate2FACode,
        verifyEmail,
        requestPasswordReset,
        resetPassword,
        resetAuthState,
    };
};

export default useAuth;
