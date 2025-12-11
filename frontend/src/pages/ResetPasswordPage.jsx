import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Lock, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import { resetPasswordSchema } from '../utils/validationSchemas';
import { toast } from 'react-toastify';
import axios from 'axios';
import * as yup from 'yup';

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

// Schema for OTP verification step
const otpSchema = yup.object().shape({
    email: yup.string().required('Email is required').email('Invalid email'),
    otp: yup.string().required('OTP is required').length(6, 'OTP must be 6 digits'),
});

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1); // 1: Verify OTP, 2: Set New Password
    const [isLoading, setIsLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [error, setError] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form for Step 1: OTP Verification
    const {
        register: registerOtp,
        handleSubmit: handleSubmitOtp,
        formState: { errors: errorsOtp },
        setValue: setValueOtp,
        watch: watchOtp,
    } = useForm({
        resolver: yupResolver(otpSchema),
    });

    // Form for Step 2: New Password
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: errorsPassword },
    } = useForm({
        resolver: yupResolver(resetPasswordSchema),
    });

    useEffect(() => {
        if (location.state?.email) {
            setValueOtp('email', location.state.email);
        }
    }, [location.state, setValueOtp]);

    const onVerifyOtp = async (data) => {
        setIsLoading(true);
        setError('');
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(`${apiUrl}/auth/verify-reset-otp`, data);
            setResetToken(response.data.resetToken);
            setStep(2);
            toast.success('OTP verified successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const onResetPassword = async (data) => {
        setIsLoading(true);
        setError('');
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(`${apiUrl}/auth/reset-password`, {
                resetToken,
                newPassword: data.newPassword,
            });
            toast.success('Password reset successfully');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-4">
            <Card className="w-full max-w-md backdrop-blur-md bg-white/95 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <KeyRound className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription>
                        {step === 1 ? 'Enter the OTP sent to your email' : 'Create a new password'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSubmitOtp(onVerifyOtp)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    {...registerOtp('email')}
                                />
                                {errorsOtp.email && (
                                    <p className="text-sm text-destructive">{errorsOtp.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2 flex flex-col items-center">
                                <Label htmlFor="otp">OTP Code</Label>
                                <InputOTP
                                    maxLength={6}
                                    value={watchOtp('otp') || ''}
                                    onChange={(value) => setValueOtp('otp', value)}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                                {errorsOtp.otp && (
                                    <p className="text-sm text-destructive">{errorsOtp.otp.message}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#764ba2] hover:to-[#667eea]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify OTP'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmitPassword(onResetPassword)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        className="pl-10 pr-10"
                                        {...registerPassword('newPassword')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errorsPassword.newPassword && (
                                    <p className="text-sm text-destructive">{errorsPassword.newPassword.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="pl-10 pr-10"
                                        {...registerPassword('confirmPassword')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errorsPassword.confirmPassword && (
                                    <p className="text-sm text-destructive">{errorsPassword.confirmPassword.message}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#764ba2] hover:to-[#667eea]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
