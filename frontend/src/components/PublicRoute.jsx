import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // If children are provided, render them, otherwise render Outlet
    return children ? children : <Outlet />;
};

export default PublicRoute;
