import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Mail, Lock, LogIn, Github as GoogleIcon, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError('Credenciales incorrectas. Inténtalo de nuevo.');
            console.error(err);
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error(err);
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
                        <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Protocolo de Acceso</span>
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                        Entrena <span className="text-primary text-glow">Hero</span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-2">La aventura te espera. Identifícate, Héroe.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 mb-6 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailLogin} className="space-y-4">
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
                            type="password"
                            placeholder="Contraseña Secreta"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-light"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Sincronizando...' : <><LogIn size={20} /> Entrar al Cuartel</>}
                    </button>
                </form>

                <div className="my-8 flex items-center gap-4 text-slate-600">
                    <div className="h-px bg-white/5 flex-1" />
                    <span className="text-xs font-bold uppercase tracking-widest">O entrar con</span>
                    <div className="h-px bg-white/5 flex-1" />
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 hover:bg-slate-100 active:scale-95"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Cuenta de Google
                </button>

                <p className="text-center text-slate-500 text-xs mt-10">
                    ¿Aún no eres un recluta? <span className="text-primary font-bold cursor-pointer hover:underline">Reclutamiento Abierto</span>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
