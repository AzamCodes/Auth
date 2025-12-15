import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/authSlice';
import { Loader2 } from 'lucide-react';
import userService from '../services/userService';

const OAuthCallbackPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        // We no longer read 'user' from URL to prevent URI_TOO_LONG errors

        if (token) {
            const completeLogin = async () => {
                try {
                    // 1. Store token temporarily
                    localStorage.setItem('accessToken', token);

                    // 2. Fetch User Profile
                    const response = await userService.getProfile();

                    if (response && response.user) {
                        const user = response.user;

                        // 3. Update Redux & LocalStorage
                        dispatch(setAuth({ token, user }));
                        localStorage.setItem('user', JSON.stringify(user));

                        // 4. Redirect to dashboard
                        navigate('/dashboard');
                    } else {
                        throw new Error('Failed to load user profile');
                    }
                } catch (error) {
                    console.error('OAuth callback error:', error);
                    // Clear invalid data
                    localStorage.removeItem('accessToken');
                    navigate('/login');
                }
            };

            completeLogin();
        } else {
            // No token, redirect to login
            navigate('/login');
        }
    }, [searchParams, navigate, dispatch]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
            <Loader2 className="h-16 w-16 text-white animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-white">
                Completing authentication...
            </h2>
        </div>
    );
};

export default OAuthCallbackPage;
