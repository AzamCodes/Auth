import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/authSlice';
import { Loader2 } from 'lucide-react';

const OAuthCallbackPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));

                // Store token and user in Redux
                dispatch(setAuth({ token, user }));

                // Store token in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                // Redirect to dashboard
                navigate('/dashboard');
            } catch (error) {
                console.error('OAuth callback error:', error);
                navigate('/login');
            }
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
