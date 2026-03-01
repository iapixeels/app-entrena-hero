import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    // Solo redirigimos cuando tenemos la certeza absoluta de que el usuario existe
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    // PANTALLA DE CARGA PARA EVITAR EL "FLASH" DEL LOGIN
    if (authLoading && !user) {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center gap-6">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-primary font-black italic uppercase tracking-tighter text-2xl animate-pulse text-center">
                    Sincronizando <span className="text-white">Academia...</span>
                </p>
            </div>
        );
    }

    const handleGoogleLogin = async () => {
        setError('');
        try {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                await signInWithRedirect(auth, googleProvider);
            } else {
                await signInWithPopup(auth, googleProvider);
            }
        } catch (err) {
            console.error("Error Google Login:", err);
            setError('Error de conexión con Google.');
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.error("Error Email Login:", err.code);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError('Email o contraseña incorrectos.');
            } else if (err.code === 'auth/account-exists-with-different-credential') {
                setError('Esta cuenta usa Login de Google. Pulsa el botón de Google.');
            } else {
                setError('Error al intentar acceder.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-6 font-display">
                        <Shield className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                        ENTRENA <span className="text-primary text-glow">HERO</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Portal de Acceso a la Academia</p>
                </div>

                <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 mb-6"
                        >
                            <AlertCircle size={20} />
                            <p className="text-[10px] font-bold uppercase tracking-tight">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email de Héroe</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    placeholder="nombre@ejemplo.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium placeholder:font-normal"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium placeholder:font-normal"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="btn-primary w-full py-4 text-lg group active:scale-95 transition-all outline-none"
                        >
                            ACCEDER POR EMAIL
                            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-[10px]">
                            <span className="bg-[#0f172a] px-4 text-slate-500 font-bold uppercase tracking-widest">O continuar con</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={authLoading}
                        className="w-full bg-white text-slate-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-4 hover:shadow-lg active:scale-95 transition-all text-sm border border-slate-200 outline-none"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.33 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.13a7.07 7.07 0 0 1 0-4.26V7.03H2.18a11.99 11.99 0 0 0 0 9.94l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.03l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar con Google
                    </button>

                    <div className="text-center mt-8">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            ¿NUEVO HÉROE? <Link to="/register" className="text-primary hover:text-primary-light transition-colors ml-1 italic font-black">CREAR PERFIL</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
