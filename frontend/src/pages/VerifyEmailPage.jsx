import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    MarkEmailRead,
    Refresh,
} from '@mui/icons-material';
import { Loader2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyEmail, isLoading } = useAuth();

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        // Get userId from navigation state
        const userIdFromState = location.state?.userId;
        if (userIdFromState) {
            setUserId(userIdFromState);
        } else {
            setError('Invalid verification request. Please register again.');
        }
    }, [location]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        if (!userId) {
            setError('User ID not found. Please register again.');
            return;
        }

        try {
            await verifyEmail(userId, otp);
        } catch (err) {
            setError(err.message || 'Verification failed');
        }
    };

    const handleResendOTP = async () => {
        setIsResending(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }

            alert(data.message || 'OTP sent successfully!');
        } catch (err) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-4">
            <Card className="w-full max-w-md backdrop-blur-md bg-white/95 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <MarkEmailRead className="w-16 h-16 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
                    <CardDescription>
                        We've sent a 6-digit verification code to your email address.
                        Please enter it below to verify your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleVerify} className="space-y-4">
                        <Input
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 6) {
                                    setOtp(value);
                                }
                            }}
                            maxLength={6}
                            className="text-center text-2xl tracking-[8px] font-bold h-14"
                        />

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#764ba2] hover:to-[#667eea]"
                            disabled={isLoading || !userId}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                'Verify Email'
                            )}
                        </Button>

                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Didn't receive the code?
                            </p>
                            <Button
                                variant="ghost"
                                onClick={handleResendOTP}
                                disabled={isResending || !userId}
                                className="text-primary"
                            >
                                {isResending ? 'Sending...' : (
                                    <>
                                        <Refresh className="mr-2 h-4 w-4" />
                                        Resend OTP
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button
                        variant="link"
                        onClick={() => navigate('/login')}
                    >
                        Back to Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default VerifyEmailPage;
