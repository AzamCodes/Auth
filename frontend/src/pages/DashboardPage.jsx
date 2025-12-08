import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const DashboardPage = () => {
    const { user } = useSelector((state) => state.auth);
    const { logoutUser } = useAuth();

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">
                Welcome, {user?.name}!
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Role:</strong> {user?.role}</p>
                        <p><strong>2FA Enabled:</strong> {user?.twoFactorEnabled ? 'Yes' : 'No'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Button asChild>
                            <Link to="/profile">Edit Profile</Link>
                        </Button>
                        <Button variant="outline" onClick={logoutUser}>
                            Logout
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
