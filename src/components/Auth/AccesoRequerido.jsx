import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Rocket, ChevronRight, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';

const AccesoRequerido = () => {
    const handleLogout = () => auth.signOut();

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full glass p-10 rounded-[2.5rem] text-center relative z-10 border-white/5 shadow-2xl"
            >
                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
                    <ShieldAlert size={48} className="text-primary animate-pulse" />
                </div>

                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
                    Acceso <span className="text-primary text-glow">Requerido</span>
                </h1>

                <p className="text-slate-400 text-lg mb-10 leading-relaxed font-light">
                    ¡Hola, pequeño Héroe! Tu nivel actual de seguridad no te permite entrar a esta misión. Necesitas activar tu <span className="text-white font-bold">Protocolo de Acceso Premium</span> para continuar tu aventura.
                </p>

                <div className="space-y-4">
                    <button
                        className="w-full bg-primary hover:bg-primary/90 text-white text-xl font-bold py-5 rounded-2xl shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                        onClick={() => window.open('https://hotmart.com', '_blank')}
                    >
                        <Rocket size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        OBTENER ACCESO ELITE
                        <ChevronRight size={24} />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full text-slate-500 hover:text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Cerrar Sesión
                    </button>
                </div>

                <div className="mt-12 flex items-center justify-center gap-6 opacity-30">
                    <div className="h-px bg-white/20 flex-1" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Hero Academy Labs</p>
                    <div className="h-px bg-white/20 flex-1" />
                </div>
            </motion.div>
        </div>
    );
};

export default AccesoRequerido;
