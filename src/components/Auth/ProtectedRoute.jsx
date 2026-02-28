import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requirePremium = true }) => {
    const { user, isPremium, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center gap-6">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-primary font-black italic uppercase tracking-tighter text-xl animate-pulse">
                    Identificando <span className="text-white">Héroe...</span>
                </p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requirePremium && !isPremium) {
        return <Navigate to="/acceso-requerido" />;
    }

    return children;
};

export default ProtectedRoute;
