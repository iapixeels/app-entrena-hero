import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Rocket, ChevronRight, LogOut, Lock, Star, Sparkles, Key, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AccesoRequerido = () => {
    const { logout, userData, activateLicense } = useAuth();
    const navigate = useNavigate();
    const [licenseCode, setLicenseCode] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

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

    const isGirl = userData?.heroProfile?.gender === 'girl';

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[130px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full glass p-8 md:p-12 rounded-[3rem] text-center relative z-10 border-white/5 shadow-2xl"
            >
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <div className="relative w-full h-full bg-primary/10 rounded-[2rem] flex items-center justify-center border border-primary/20">
                        {status === 'success' ? (
                            <CheckCircle2 size={48} className="text-green-400" />
                        ) : (
                            <ShieldAlert size={48} className="text-primary" />
                        )}
                    </div>
                </div>

                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">
                    MEMBRESÍA <span className="text-primary text-glow">ELITE</span>
                </h1>

                <p className="text-slate-400 text-sm mb-10 font-bold uppercase tracking-widest leading-relaxed">
                    ¡Bienvenid{isGirl ? 'a' : 'o'}, {isGirl ? 'Heroína' : 'Héroe'} <span className="text-white font-black italic">{userData?.heroProfile?.name}</span>! <br />
                    Necesitas una licencia activa para acceder a la academia.
                </p>

                {/* AREA DE ACTIVACIÓN */}
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 mb-8">
                    {status === 'success' ? (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl">
                                <p className="text-xl font-black italic uppercase tracking-tighter">¡Protocolo de Acceso Activado!</p>
                                <p className="text-xs font-bold mt-2 uppercase tracking-widest">{message}</p>
                            </div>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-6 rounded-2xl shadow-2xl shadow-green-500/30 transition-all flex items-center justify-center gap-4 active:scale-95 text-2xl uppercase italic tracking-tighter group"
                            >
                                <Play size={28} className="fill-current group-hover:scale-110 transition-transform" />
                                Entrar a la Academia
                            </button>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                <Key size={14} /> ¿TIENES UN CÓDIGO DE HOTMART?
                            </h3>

                            <form onSubmit={handleActivation} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="INTRODUCE TU CÓDIGO AQUÍ"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-center text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all font-black tracking-widest uppercase text-xl"
                                    value={licenseCode}
                                    onChange={(e) => setLicenseCode(e.target.value.toUpperCase())}
                                    disabled={status === 'loading'}
                                />

                                {status === 'error' && (
                                    <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                        <AlertCircle size={14} /> {message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 text-lg tracking-tight"
                                >
                                    {status === 'loading' ? 'SOLICITANDO ACCESO...' : 'DESBLOQUEAR MI MEMBRESÍA'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {status !== 'success' && (
                    <div className="space-y-4">
                        <button
                            className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black py-4 rounded-xl border border-primary/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                            onClick={() => window.open('https://hotmart.com', '_blank')}
                        >
                            <Rocket size={16} />
                            ¿Aún no tienes licencia? Cómprala en Hotmart
                            <ChevronRight size={16} />
                        </button>

                        <button
                            onClick={logout}
                            className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                            Cerrar Sesión y salir
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AccesoRequerido;
