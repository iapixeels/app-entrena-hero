import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, googleProvider, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff, User, Sparkles, ChevronRight } from 'lucide-react';

const Register = () => {
    const { user, userData, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('boy');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showProfileSetup, setShowProfileSetup] = useState(false);

    // Detectar si el usuario viene de un registro de Google y necesita configurar su perfil
    useEffect(() => {
        if (!authLoading && user && !success) {
            // Si el héroe no tiene nombre personalizado o género configurado (está el default de AuthContext)
            // O si simplemente queremos forzar el paso de configuración para nuevos usuarios
            if (userData && (!userData.heroProfile || userData.heroProfile.name === 'Héroe' || userData.heroProfile.name === user.displayName)) {
                setShowProfileSetup(true);
                if (!name) setName(user.displayName || '');
            }
        }
    }, [user, userData, authLoading, success]);

    // Redirección final suave
    useEffect(() => {
        if (!authLoading && user && success && !showProfileSetup) {
            const timer = setTimeout(() => navigate('/'), 2000);
            return () => clearTimeout(timer);
        }
    }, [user, authLoading, navigate, success, showProfileSetup]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            await setDoc(doc(db, 'users', newUser.uid), {
                uid: newUser.uid,
                email: newUser.email,
                provider: 'password',
                accesoPremium: false,
                heroProfile: {
                    name: name || 'Héroe',
                    gender: gender,
                    avatar: gender
                },
                createdAt: serverTimestamp()
            });

            setSuccess(true);
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado.');
            } else if (err.code === 'auth/weak-password') {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else {
                setError('Error al crear la cuenta.');
            }
        }
        setLoading(false);
    };

    const handleGoogleRegister = async () => {
        setError('');
        try {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                await signInWithRedirect(auth, googleProvider);
            } else {
                await signInWithPopup(auth, googleProvider);
            }
        } catch (err) {
            console.error("Error Google Register:", err);
            setError('Error al registrarse con Google.');
        }
    };

    const handleCompleteProfile = async () => {
        if (!name) {
            setError('Por favor, indica tu nombre de Héroe.');
            return;
        }
        setLoading(true);
        try {
            await setDoc(doc(db, 'users', user.uid), {
                provider: 'google',
                heroProfile: {
                    name: name,
                    gender: gender,
                    avatar: gender
                }
            }, { merge: true });

            setShowProfileSetup(false);
            setSuccess(true);
        } catch (err) {
            setError('Error al guardar el perfil.');
        }
        setLoading(false);
    };

    if (showProfileSetup) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 relative overflow-hidden font-display">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full glass p-10 rounded-[2.5rem] relative z-10 border-white/5 shadow-2xl"
                >
                    <div className="text-center mb-10">
                        <div className="inline-flex p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-6">
                            <Sparkles className="w-12 h-12 text-primary" />
                        </div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                            Configura tu <span className="text-primary text-glow">Perfil Héroe</span>
                        </h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Personaliza tu identidad antes de empezar</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">¿Nombre de tu Héroe?</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Ej: Súper Juan"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Elige tu Género</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setGender('boy')}
                                    className={`py-4 rounded-2xl border transition-all font-black italic uppercase tracking-tighter ${gender === 'boy' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'}`}
                                >
                                    Soy Héroe
                                </button>
                                <button
                                    onClick={() => setGender('girl')}
                                    className={`py-4 rounded-2xl border transition-all font-black italic uppercase tracking-tighter ${gender === 'girl' ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'}`}
                                >
                                    Soy Heroína
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleCompleteProfile}
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                        >
                            {loading ? 'SINCRONIZANDO...' : <>INICIAR AVENTURA <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 relative overflow-hidden font-display">
            {/* Background elements */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full glass p-10 rounded-[2.5rem] relative z-10 border-white/5 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Inscripción</span>
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                        {success ? '¡Héroe ' : 'Únete a la '}
                        <span className="text-primary text-glow">{success ? 'Listo!' : 'Academia'}</span>
                    </h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 italic">
                        {success ? 'Entrando a la Sala de Misiones...' : 'Empieza tu entrenamiento ahora.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 mb-6 text-[10px] font-black uppercase tracking-widest">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl flex items-center gap-3 mb-6 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle size={18} />
                        ¡Héroe registrado con éxito!
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tu Nombre de Héroe</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Ej: Rayo Relámpago"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all font-light"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="tu@academiadeheroes.com"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-primary/50 transition-all font-light"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Clave Secreta</label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 pr-12 text-white focus:outline-none focus:border-primary/50 transition-all font-light"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-2">
                        <button
                            type="button"
                            onClick={() => setGender('boy')}
                            className={`py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${gender === 'boy' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'}`}
                        >
                            Soy un Héroe
                        </button>
                        <button
                            type="button"
                            onClick={() => setGender('girl')}
                            className={`py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${gender === 'girl' ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'}`}
                        >
                            Soy Heroína
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/95 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'CREANDO PERFIL...' : 'REGISTRARSE AHORA'}
                    </button>
                </form>

                <div className="my-8 flex items-center gap-4 text-slate-800">
                    <div className="h-px bg-white/5 flex-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">O REGISTRARSE CON</span>
                    <div className="h-px bg-white/5 flex-1" />
                </div>

                <button
                    onClick={handleGoogleRegister}
                    className="w-full bg-white text-slate-900 font-black italic uppercase tracking-tighter py-4 rounded-2xl transition-all flex items-center justify-center gap-3 hover:bg-slate-100 active:scale-95 border border-slate-200"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 transition-transform group-hover:scale-110" />
                    Google
                </button>

                <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-8">
                    ¿YA ERES PARTE? <Link to="/login" className="text-primary font-black italic hover:text-primary-light transition-colors ml-1">INICIAR SESIÓN</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
