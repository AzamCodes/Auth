/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
