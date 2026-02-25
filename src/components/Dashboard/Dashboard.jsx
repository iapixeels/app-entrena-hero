import React, { useState } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import MissionMap from './MissionMap';
import ParentCenter from './ParentCenter';
import SkillsTree from './SkillsTree';
import EliteShop from './EliteShop';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, TrendingUp, Settings } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="glass p-6 rounded-3xl border-white/5 flex items-center gap-6">
        <div className={`w-14 h-14 rounded-2xl bg-${color}/10 border border-${color}/20 flex items-center justify-center`}>
            <Icon className={`text-${color}`} size={28} />
        </div>
        <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
            <p className="text-3xl font-black italic tracking-tighter">{value}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const [isParentCenterOpen, setIsParentCenterOpen] = useState(false);

    return (
        <DashboardLayout title="Cuartel General">
            <div className="space-y-16 pb-20">
                {/* Top Header with Parent Access */}
                <div className="flex flex-col md:flex-row items-baseline justify-between gap-4">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                        Mapa de <span className="text-primary text-glow">Misiones</span>
                    </h2>
                    <button
                        onClick={() => setIsParentCenterOpen(true)}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5"
                    >
                        <Settings size={16} />
                        Control Parental
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={Star} label="Experiencia Total" value="2,450 XP" color="primary" />
                    <StatCard icon={Trophy} label="Logros" value="12" color="accent" />
                    <StatCard icon={TrendingUp} label="Racha Diaria" value="5" color="secondary" />
                </div>

                {/* Mission Map Component */}
                <MissionMap />

                {/* Skills Tree Section */}
                <SkillsTree />

                {/* Elite Shop Section */}
                <EliteShop />

                {/* Quick Announcement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary/20 to-secondary/20 p-8 rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left"
                >
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                        <Trophy size={40} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xl font-bold mb-2 uppercase tracking-tight italic">¡Nuevos Accesorios en Camino!</h4>
                        <p className="text-slate-400">Estamos diseñando el Traje de Sigilo para la próxima actualización del Cuartel General.</p>
                    </div>
                    <button className="btn-primary">
                        Ver Roadmap
                    </button>
                </motion.div>

                {/* Parent Center Modal */}
                <AnimatePresence>
                    {isParentCenterOpen && (
                        <ParentCenter
                            isOpen={isParentCenterOpen}
                            onClose={() => setIsParentCenterOpen(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
