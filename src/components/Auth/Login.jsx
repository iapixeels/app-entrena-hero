import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, LogIn, Chrome, AlertCircle, RefreshCw } from 'lucide-react';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, loading: authLoading, authError } = useAuth();

    useEffect(() => {
        if (!authLoading && user) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    const handleGoogleLogin = async () => {
        try {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                await signInWithRedirect(auth, googleProvider);
            } else {
                await signInWithPopup(auth, googleProvider);
                navigate('/');
            }
        } catch (err) {
            console.error("Error en Google Login:", err);
            setError('Error al conectar con Google.');
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err) {
            console.error("Error login:", err.code);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Email o contraseña incorrectos.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Demasiados intentos. Inténtalo más tarde.');
            } else {
                setError('Error al iniciar sesión. Verifica tu conexión.');
            }
        }
    };

    const handleResetApp = () => {
        if (window.confirm("¿Deseas reiniciar la sesión? Se limpiará la memoria local para resolver bloqueos.")) {
            localStorage.clear();
            sessionStorage.clear();
            auth.signOut().then(() => {
                window.location.reload();
            });
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
                    {(error || authError) && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 mb-6"
                        >
                            <AlertCircle size={20} />
                            <p className="text-xs font-bold uppercase tracking-tight">{error || authError}</p>
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
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
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
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="btn-primary w-full py-4 text-lg group"
                        >
                            {authLoading ? 'CONECTANDO...' : (
                                <>
                                    ACCEDER A LA MISIÓN
                                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-[10px]">
                            <span className="bg-[#0f172a] px-4 text-slate-500 font-bold uppercase tracking-widest">O entrar con</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={authLoading}
                        className="w-full bg-white text-black font-black uppercase tracking-tighter py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all text-sm mb-6"
                    >
                        <Chrome className="w-5 h-5" />
                        CONTINUAR CON GOOGLE
                    </button>

                    <div className="text-center space-y-4">
                        <p className="text-xs text-slate-500 font-bold">
                            ¿NUEVO EN LA ACADEMIA? <Link to="/register" className="text-primary hover:text-primary-light transition-colors ml-1 italic">CREAR PERFIL</Link>
                        </p>

                        <button
                            onClick={handleResetApp}
                            className="text-[9px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto transition-all"
                        >
                            <RefreshCw size={12} />
                            Reiniciar sistema (Limpiar caché)
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
