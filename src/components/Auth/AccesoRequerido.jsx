import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Rocket, ChevronRight, LogOut, Lock, Star, Sparkles, Key, CheckCircle2, AlertCircle, Play, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const AccesoRequerido = () => {
    const { logout, userData, activateLicense, user } = useAuth();
    const navigate = useNavigate();

    // Estados para licencia
    const [licenseCode, setLicenseCode] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    // Estados para configuración de perfil (NUEVO)
    const [showProfileSetup, setShowProfileSetup] = useState(false);
    const [heroName, setHeroName] = useState('');
    const [heroGender, setHeroGender] = useState('boy');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Detectar si el perfil está incompleto (Caso Google)
    useEffect(() => {
        if (userData && (!userData.heroProfile?.name || userData.heroProfile.name === 'Héroe' || userData.heroProfile.name === user?.displayName)) {
            setShowProfileSetup(true);
            setHeroName(userData.heroProfile?.name || user?.displayName || '');
            setHeroGender(userData.heroProfile?.gender || 'boy');
        }
    }, [userData, user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!heroName.trim()) return;
        setIsSavingProfile(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                'heroProfile.name': heroName,
                'heroProfile.gender': heroGender,
                'heroProfile.avatar': heroGender
            });
            setShowProfileSetup(false);
        } catch (err) {
            console.error(err);
        }
        setIsSavingProfile(false);
    };

    const handleActivation = async (e) => {
        e.preventDefault();
        if (!licenseCode.trim()) return;
        setStatus('loading');
        try {
            await activateLicense(licenseCode);
            setStatus('success');
            setMessage('¡Licencia activada con éxito!');
        } catch (err) {
            setStatus('error');
            setMessage(err);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 relative overflow-hidden font-display">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[130px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full glass p-8 md:p-12 rounded-[3.5rem] relative z-10 border-white/5 shadow-2xl overflow-hidden">

                <AnimatePresence mode="wait">
                    {/* PASO 1: CONFIGURACIÓN DE PERFIL (Para usuarios que vienen de Google/Incompletos) */}
                    {showProfileSetup ? (
                        <motion.div key="profile" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="space-y-8">
                            <div className="text-center">
                                <div className="inline-flex p-4 rounded-3xl bg-accent/10 border border-accent/20 mb-6">
                                    <Sparkles className="w-12 h-12 text-accent" />
                                </div>
                                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Configura tu <span className="text-accent text-glow">Perfil de Héroe</span></h2>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Dinos quién eres antes de empezar</p>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-6 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">¿Nombre de tu Héroe/Heroína?</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={20} />
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent/50 transition-all text-xl font-bold tracking-tight uppercase"
                                            value={heroName}
                                            onChange={(e) => setHeroName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Elige tu Identidad</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button type="button" onClick={() => setHeroGender('boy')} className={`py-4 rounded-2xl border transition-all font-black italic uppercase tracking-tighter ${heroGender === 'boy' ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30' : 'bg-white/5 border-white/10 text-slate-500'}`}>Héroe</button>
                                        <button type="button" onClick={() => setHeroGender('girl')} className={`py-4 rounded-2xl border transition-all font-black italic uppercase tracking-tighter ${heroGender === 'girl' ? 'bg-accent border-accent text-white shadow-xl shadow-accent/30' : 'bg-white/5 border-white/10 text-slate-500'}`}>Heroína</button>
                                    </div>
                                </div>

                                <button type="submit" disabled={isSavingProfile} className="w-full bg-white text-black font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 text-lg uppercase italic tracking-tighter">
                                    {isSavingProfile ? 'Guardando Informes...' : 'CONTINUAR A LA ACADEMIA'}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        /* PASO 2: ACTIVACIÓN DE LICENCIA (Se muestra después de configurar o si ya está configurado) */
                        <motion.div key="license" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8">
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-8">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                    <div className="relative w-full h-full bg-primary/10 rounded-[2rem] flex items-center justify-center border border-primary/20">
                                        {status === 'success' ? <CheckCircle2 size={48} className="text-green-400" /> : <ShieldAlert size={48} className="text-primary" />}
                                    </div>
                                </div>
                                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white">MEMBRESÍA <span className="text-primary text-glow">ELITE</span></h1>
                                <p className="text-slate-400 text-sm mb-10 font-bold uppercase tracking-widest leading-relaxed">¡Bienvenid{userData?.heroProfile?.gender === 'girl' ? 'a' : 'o'}, {userData?.heroProfile?.gender === 'girl' ? 'Heroína' : 'Héroe'} <span className="text-white font-black italic">{userData?.heroProfile?.name}</span>! <br />Necesitas una licencia activa para acceder.</p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 mb-8">
                                {status === 'success' ? (
                                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
                                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl">
                                            <p className="text-xl font-black italic uppercase tracking-tighter">¡Protocolo de Acceso Activado!</p>
                                        </div>
                                        <button onClick={() => navigate('/')} className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-6 rounded-2xl shadow-2xl shadow-green-500/30 transition-all flex items-center justify-center gap-4 active:scale-95 text-2xl uppercase italic tracking-tighter group"><Play size={28} className="fill-current group-hover:scale-110 transition-transform" /> Entrar a la Academia</button>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center justify-center gap-2"><Key size={14} /> ¿TIENES UN CÓDIGO DE HOTMART?</h3>
                                        <form onSubmit={handleActivation} className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="INTRODUCE TU CÓDIGO AQUÍ"
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-center text-white focus:outline-none focus:border-primary transition-all font-black tracking-widest uppercase text-2xl"
                                                value={licenseCode}
                                                onChange={(e) => setLicenseCode(e.target.value.toUpperCase())}
                                                disabled={status === 'loading'}
                                            />
                                            {status === 'error' && <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20"><AlertCircle size={14} /> {message}</div>}
                                            <button type="submit" disabled={status === 'loading'} className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 text-lg tracking-tight">{status === 'loading' ? 'SOLICITANDO ACCESO...' : 'DESBLOQUEAR MI MEMBRESÍA'}</button>
                                        </form>
                                    </div>
                                )}
                            </div>

                            {status !== 'success' && (
                                <div className="space-y-4">
                                    <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black py-4 rounded-xl border border-primary/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest" onClick={() => window.open('https://hotmart.com', '_blank')}><Rocket size={16} /> ¿Aún no tienes licencia? Cómprala en Hotmart <ChevronRight size={16} /></button>
                                    <button onClick={logout} className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all">Cerrar Sesión y salir</button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default AccesoRequerido;
