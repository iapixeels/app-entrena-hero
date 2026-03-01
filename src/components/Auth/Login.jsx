import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, fetchSignInMethodsForEmail } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && user) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    if (authLoading && !user) {
        return (
            <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center gap-6 font-display">
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
            setError('Error al conectar con Google.');
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.error("Login Error:", err.code);
            // Firebase v10+ usa a veces 'invalid-credential' por seguridad
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                try {
                    const methods = await fetchSignInMethodsForEmail(auth, email);
                    if (methods.length > 0 && !methods.includes('password')) {
                        setError('Esta cuenta usa Login de Google. Pulsa el botón de Google abajo.');
                    } else {
                        setError('Email o contraseña incorrectos.');
                    }
                } catch (metaError) {
                    // Si la enumeración está bloqueada, mostramos el error estándar
                    setError('Email o contraseña incorrectos.');
                }
            } else {
                setError('Error al intentar acceder.');
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 relative overflow-hidden font-display">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-6">
                        <Shield className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                        ENTRENA <span className="text-primary text-glow">HERO</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Portal de Acceso a la Academia</p>
                </div>

                <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl">
                    {error && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 mb-6">
                            <AlertCircle size={20} />
                            <p className="text-[10px] font-bold uppercase tracking-tight">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email de Héroe</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="email"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all font-light"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Clave Secreta</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-primary/50 transition-all font-light"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/95 text-white font-black italic uppercase tracking-tighter py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                            {loading ? 'ACCEDIENDO...' : <><LogIn size={20} /> ENTRAR A MISIÓN</>}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4 text-slate-800">
                        <div className="h-px bg-white/5 flex-1" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">O</span>
                        <div className="h-px bg-white/5 flex-1" />
                    </div>

                    <button onClick={handleGoogleLogin} className="w-full bg-white text-slate-900 font-black italic uppercase tracking-tighter py-4 rounded-2xl transition-all flex items-center justify-center gap-3 hover:bg-slate-100 active:scale-95 border border-slate-200">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Google
                    </button>

                    <div className="mt-8 text-center space-y-2">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">¿NUEVO EN LA ACADEMIA?</p>
                        <Link to="/register" className="text-primary font-black italic uppercase tracking-tighter hover:text-primary-light transition-colors block">
                            CREAR PERFIL DE HÉROE
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
