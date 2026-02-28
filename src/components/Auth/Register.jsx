import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, googleProvider, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, UserPlus, Github as GoogleIcon, AlertCircle, CheckCircle, Eye, EyeOff, User } from 'lucide-react';

const Register = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            // Esperar un momento para mostrar éxito antes de redirigir
            if (success) {
                const timer = setTimeout(() => navigate('/'), 2000);
                return () => clearTimeout(timer);
            } else {
                navigate('/');
            }
        }
    }, [user, authLoading, navigate, success]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setSuccess(true);
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado.');
            } else if (err.code === 'auth/weak-password') {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else {
                setError('Error al crear la cuenta. Inténtalo de nuevo.');
            }
            console.error(err);
        }
        setLoading(false);
    };

    const handleGoogleRegister = async () => {
        setError('');
        try {
            // Detectar si es dispositivo móvil para usar redirect en lugar de popup
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                await signInWithRedirect(auth, googleProvider);
            } else {
                await signInWithPopup(auth, googleProvider);
                setSuccess(true);
            }
        } catch (err) {
            console.error("Error en Google Register:", err);
            if (err.code !== 'auth/popup-closed-by-user') {
                setError('Error al registrarse con Google.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 relative overflow-hidden font-display">
            {/* Dynamic Background Elements */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full animate-pulse-slow" />
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full animate-pulse-slow" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass p-10 rounded-[2.5rem] relative z-10 border-white/5"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Inscripción de Héroes</span>
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                        {success ? '¡Héroe ' : 'Únete a la '}
                        <span className="text-primary text-glow">{success ? 'Creado!' : 'Academia'}</span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-2">
                        {success ? '¡Tu aventura comienza ahora! Redirigiendo...' : 'Crea tu perfil y empieza tu entrenamiento hoy.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 mb-6 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl flex items-center gap-3 mb-6 text-sm">
                        <CheckCircle size={18} />
                        ¡Registro exitoso! Preparando tu centro de mando...
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Nombre de Héroe"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-light"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-light"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña Secreta"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-light"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Creando Perfil...' : <><UserPlus size={20} /> Registrarse</>}
                    </button>
                </form>

                <div className="my-8 flex items-center gap-4 text-slate-600">
                    <div className="h-px bg-white/5 flex-1" />
                    <span className="text-xs font-bold uppercase tracking-widest">O registrarse con</span>
                    <div className="h-px bg-white/5 flex-1" />
                </div>

                <button
                    onClick={handleGoogleRegister}
                    className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 hover:bg-slate-100 active:scale-95"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Cuenta de Google
                </button>

                <p className="text-center text-slate-500 text-xs mt-10">
                    ¿Ya eres parte de la academia? <Link to="/login" className="text-primary font-bold cursor-pointer hover:underline">Iniciar Sesión</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
