import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Visibility,
    VisibilityOff,
    Lock,
    Email,
    Google,
    GitHub,
} from '@mui/icons-material';
import { loginSchema } from '../utils/validationSchemas';
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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

const LoginPage = () => {
    const navigate = useNavigate();
    const { loginUser, isAuthenticated, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginSchema),
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data) => {
        await loginUser(data);
    };

    const handleGoogleLogin = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${apiUrl}/auth/google`;
    };

    const handleGithubLogin = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${apiUrl}/auth/github`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-4">
            <Card className="w-full max-w-md backdrop-blur-md bg-white/95 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>
                        Sign in to continue to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Email className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
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

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="pl-10 pr-10"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <VisibilityOff className="h-5 w-5" /> : <Visibility className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" />
                                <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Remember me
                                </Label>
                            </div>
                            <RouterLink
                                to="/forgot-password"
                                className="text-sm text-primary hover:underline"
                            >
                                Forgot password?
                            </RouterLink>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#764ba2] hover:to-[#667eea]"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={handleGoogleLogin} className="w-full">
                            <Google className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                        <Button variant="outline" onClick={handleGithubLogin} className="w-full">
                            <GitHub className="mr-2 h-4 w-4" />
                            GitHub
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <RouterLink to="/register" className="text-primary font-semibold hover:underline">
                            Sign up
                        </RouterLink>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
