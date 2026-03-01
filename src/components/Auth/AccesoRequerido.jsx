import React from 'react';
import { motion } from 'react-router-dom';
import { motion as m } from 'framer-motion';
import { ShieldAlert, Rocket, ChevronRight, LogOut, Lock, Star, Sparkles } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const AccesoRequerido = () => {
    const { logout, userData } = useAuth();

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Animations */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[130px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full glass p-8 md:p-12 rounded-[3rem] text-center relative z-10 border-white/5 shadow-2xl"
            >
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
                    <Lock size={14} className="text-red-500" />
                    <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">Acceso Restringido</span>
                </div>

                <div className="relative w-28 h-28 mx-auto mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-ping" />
                    <div className="relative w-full h-full bg-primary/10 rounded-[2rem] flex items-center justify-center border border-primary/20 transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                        <ShieldAlert size={56} className="text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-accent p-2 rounded-lg shadow-lg rotate-12">
                        <Star size={16} className="text-white fill-white" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-6 leading-none">
                    ACTIVA TU <br />
                    <span className="text-primary text-glow">CENTRO DE MANDO</span>
                </h1>

                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                    ¡Atención <span className="text-white font-bold italic">{userData?.heroProfile?.name || 'Héroe'}</span>!
                    Hemos detectado que aún no tienes una <span className="text-primary font-black uppercase">Membresía Elite</span> activa.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10 text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                        <Sparkles size={40} className="text-primary" />
                    </div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-3">¿Qué obtienes al ser Premium?</h3>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Acceso total al Mapa de Misiones Diarias
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Entrenamientos épicos guiados por expertos
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Desbloqueo de la Tienda de Élite y Equipamiento
                        </li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <button
                        className="w-full bg-primary hover:bg-primary/90 text-white text-xl font-black py-6 rounded-2xl shadow-2xl shadow-primary/40 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 group relative overflow-hidden"
                        onClick={() => window.open('https://hotmart.com', '_blank')}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <div className="flex items-center gap-3">
                            <Rocket size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            ¡QUIERO SER PREMIUM AHORA!
                        </div>
                        <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Redirección segura a Hotmart</span>
                    </button>

                    <button
                        onClick={logout}
                        className="w-full text-slate-500 hover:text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Volver al Portal de Entrada
                    </button>
                </div>

                <p className="mt-10 text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                    <span className="h-px bg-white/5 flex-1" />
                    Tecnología Segura de Hotmart
                    <span className="h-px bg-white/5 flex-1" />
                </p>
            </m.div>
        </div>
    );
};

export default AccesoRequerido;
