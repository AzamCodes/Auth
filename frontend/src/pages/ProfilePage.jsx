import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { User, Lock, Shield, Camera, Loader2, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import userService from '../services/userService';
import authService from '../services/authService';
import { profileUpdateSchema, changePasswordSchema } from '../utils/validationSchemas';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

const ProfilePage = () => {
    const { user, logoutUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [show2FADialog, setShow2FADialog] = useState(false);
    const [twoFactorToken, setTwoFactorToken] = useState('');

    // Profile Form
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        setValue: setValueProfile,
        formState: { errors: errorsProfile },
    } = useForm({
        resolver: yupResolver(profileUpdateSchema),
    });

    // Password Form
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        reset: resetPasswordForm,
        formState: { errors: errorsPassword },
    } = useForm({
        resolver: yupResolver(changePasswordSchema),
    });

    useEffect(() => {
        if (user) {
            setValueProfile('name', user.name);
            setValueProfile('email', user.email);
        }
    }, [user, setValueProfile]);

    const onUpdateProfile = async (data) => {
        setIsLoading(true);
        try {
            await userService.updateProfile(data);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const onChangePassword = async (data) => {
        setIsLoading(true);
        try {
            await authService.changePassword(data.oldPassword, data.newPassword);
            toast.success('Password changed successfully');
            resetPasswordForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('picture', file);

        try {
            await userService.uploadProfilePicture(file);
            toast.success('Profile picture updated');
            // Ideally force a refresh of user state here
            window.location.reload();
        } catch (err) {
            toast.error('Failed to upload image');
        }
    };

    const toggle2FA = async (checked) => {
        if (checked) {
            // Enable 2FA
            try {
                const response = await authService.setup2FA();
                setQrCode(response.qrCode); // Assuming API returns qrCode data URL
                setShow2FADialog(true);
            } catch (err) {
                toast.error('Failed to setup 2FA');
            }
        } else {
            // Disable 2FA - usually requires password, simplifying for UI demo
            // In a real app, prompt for password first
            const password = prompt("Enter your password to disable 2FA:");
            if (password) {
                try {
                    await authService.disable2FA(password);
                    toast.success('2FA disabled');
                    // Update local user state if needed
                    window.location.reload();
                } catch (err) {
                    toast.error('Failed to disable 2FA');
                }
            }
        }
    };

    const verify2FASetup = async () => {
        try {
            await authService.verify2FA(twoFactorToken);
            toast.success('2FA enabled successfully');
            setShow2FADialog(false);
            window.location.reload();
        } catch (err) {
            toast.error('Invalid 2FA code');
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Account Settings</h1>
                <Button variant="destructive" onClick={logoutUser}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal details and public profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative group cursor-pointer">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={user?.profilePicture} />
                                        <AvatarFallback className="text-xl">{user?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white h-8 w-8" />
                                        <Input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">Click to upload new picture</p>
                            </div>

                            <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" {...registerProfile('name')} />
                                    {errorsProfile.name && <p className="text-sm text-destructive">{errorsProfile.name.message}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" {...registerProfile('email')} disabled />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                </div>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>
                                    Ensure your account is secure by using a strong password.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="oldPassword">Current Password</Label>
                                        <Input id="oldPassword" type="password" {...registerPassword('oldPassword')} />
                                        {errorsPassword.oldPassword && <p className="text-sm text-destructive">{errorsPassword.oldPassword.message}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input id="newPassword" type="password" {...registerPassword('newPassword')} />
                                        {errorsPassword.newPassword && <p className="text-sm text-destructive">{errorsPassword.newPassword.message}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input id="confirmPassword" type="password" {...registerPassword('confirmPassword')} />
                                        {errorsPassword.confirmPassword && <p className="text-sm text-destructive">{errorsPassword.confirmPassword.message}</p>}
                                    </div>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Update Password
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Two-Factor Authentication</CardTitle>
                                <CardDescription>
                                    Add an extra layer of security to your account.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Enable 2FA</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Secure your account with TOTP (Google Authenticator, Authy)
                                    </p>
                                </div>
                                <Switch
                                    checked={user?.isTwoFactorEnabled}
                                    onCheckedChange={toggle2FA}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
                        <DialogDescription className="text-left space-y-2">
                            <p><strong>Step 1:</strong> Download an Authenticator App like <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong> on your phone.</p>
                            <p><strong>Step 2:</strong> Open the app and tap "+" or "Add Account".</p>
                            <p><strong>Step 3:</strong> Scan the QR code below <strong>using that app</strong> (do not use your standard camera or Google Lens).</p>
                            <p><strong>Step 4:</strong> Enter the 6-digit code shown in the app to verify.</p>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4 py-4">
                        {qrCode && <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border rounded-lg" />}
                        <div className="w-full max-w-xs space-y-2 flex flex-col items-center">
                            <Label htmlFor="token">Verification Code</Label>
                            <InputOTP
                                maxLength={6}
                                value={twoFactorToken}
                                onChange={(value) => setTwoFactorToken(value)}
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
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={verify2FASetup} disabled={twoFactorToken.length !== 6}>Verify & Enable</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProfilePage;
