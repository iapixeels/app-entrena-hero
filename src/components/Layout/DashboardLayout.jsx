import React from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Settings, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children, title }) => {
    const { user } = useAuth();
    const handleLogout = () => auth.signOut();

    return (
        <div className="min-h-screen bg-background-dark text-slate-100 font-display flex flex-col">
            {/* Top Navigation */}
            <nav className="h-20 glass border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                        <Shield size={24} className="text-white" />
                    </div>
                    <span className="text-xl font-black italic uppercase tracking-tighter hidden md:block">
                        Entrena <span className="text-primary">Hero</span>
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-[10px] font-bold">
                            LVL 1
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cadete</p>
                            <p className="text-xs font-bold">{user?.email?.split('@')[0]}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                {title && (
                    <header className="mb-10">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter"
                        >
                            {title}
                        </motion.h1>
                    </header>
                )}
                {children}
            </main>

            {/* Bottom Navigation for Mobile */}
            <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 glass rounded-2xl border border-white/10 flex items-center justify-around px-6 z-50">
                <button className="text-primary"><Shield size={24} /></button>
                <button className="text-slate-500"><User size={24} /></button>
                <button className="text-slate-500"><Settings size={24} /></button>
            </nav>
        </div>
    );
};

export default DashboardLayout;
