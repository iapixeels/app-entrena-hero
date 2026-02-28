import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requirePremium = true }) => {
    const { user, userData, isPremium, loading } = useAuth();

    // Si está cargando el estado de Auth o si hay un usuario pero sus datos aún no llegan de Firestore
    if (loading || (user && !userData)) {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center gap-6">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-primary font-black italic uppercase tracking-tighter text-2xl animate-pulse">
                    Sincronizando <span className="text-white">Academia...</span>
                </p>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.3em]">Cargando Datos de Héroe</p>
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
