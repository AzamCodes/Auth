import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { passwordResetRequestSchema } from '../utils/validationSchemas';
import { toast } from 'react-toastify';
import axios from 'axios';

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

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(passwordResetRequestSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(`${apiUrl}/auth/request-password-reset`, data);
            setIsSuccess(true);
            toast.success('Password reset code sent to your email');

            // Navigate to reset password page after short delay
            setTimeout(() => {
                navigate('/reset-password', { state: { email: data.email } });
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset code');
            toast.error(err.response?.data?.message || 'Failed to send reset code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-4">
            <Card className="w-full max-w-md backdrop-blur-md bg-white/95 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you an OTP to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSuccess ? (
                        <Alert className="bg-green-50 text-green-900 border-green-200">
                            <AlertTitle className="text-green-800">Check your email</AlertTitle>
                            <AlertDescription>
                                We have sent a password reset OTP to your email address.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        className="pl-10"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
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
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Send Reset OTP'
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="link" asChild className="text-muted-foreground hover:text-primary">
                        <RouterLink to="/login" className="flex items-center">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </RouterLink>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
