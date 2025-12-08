import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Visibility,
    VisibilityOff,
    PersonAdd,
    Email,
    Lock,
    Person,
} from '@mui/icons-material';
import { registerSchema } from '../utils/validationSchemas';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
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

const RegisterPage = () => {
    const { registerUser, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        control,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            acceptTerms: false
        }
    });

    const watchPassword = watch('password', '');

    const onSubmit = async (data) => {
        const { confirmPassword, acceptTerms, ...userData } = data;
        await registerUser(userData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f093fb] to-[#f5576c] p-4">
            <Card className="w-full max-w-md backdrop-blur-md bg-white/95 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <PersonAdd className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>
                        Join us today and get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <Person className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    className="pl-10"
                                    {...register('name')}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

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

                        <PasswordStrengthIndicator password={watchPassword} />

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    className="pl-10"
                                    {...register('confirmPassword')}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                                <Controller
                                    name="acceptTerms"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="acceptTerms"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor="acceptTerms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pt-0.5">
                                    I agree to the{' '}
                                    <a href="#" className="text-primary hover:underline">
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" className="text-primary hover:underline">
                                        Privacy Policy
                                    </a>
                                </Label>
                            </div>
                            {errors.acceptTerms && (
                                <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#f093fb] to-[#f5576c] hover:from-[#f5576c] hover:to-[#f093fb]"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <RouterLink to="/login" className="text-primary font-semibold hover:underline">
                            Sign in
                        </RouterLink>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;
