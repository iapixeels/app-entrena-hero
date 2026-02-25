import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requirePremium = true }) => {
    const { user, isPremium, loading } = useAuth();

    if (loading) return null; // O un spinner de carga

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requirePremium && !isPremium) {
        return <Navigate to="/acceso-requerido" />;
    }

    return children;
};

export default ProtectedRoute;
