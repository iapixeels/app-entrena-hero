import React, { useState } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import MissionMap from './MissionMap';
import ParentCenter from './ParentCenter';
import SkillsTree from './SkillsTree';
import EliteShop from './EliteShop';
import HeroProfile from './HeroProfile';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon: Icon, label, value }) => (
    <div className="bg-[#800020]/20 backdrop-blur-xl p-6 rounded-3xl border border-white/20 flex items-center gap-6 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-[#800020]/40 border border-white/20 flex items-center justify-center">
            <Icon className="text-white" size={28} />
        </div>
        <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className="text-3xl font-black italic tracking-tighter text-white">{value}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const { userData } = useAuth();
    const [isParentCenterOpen, setIsParentCenterOpen] = useState(false);
    const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const formatNumber = (num) => {
        return num?.toLocaleString() || "0";
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <DashboardLayout
            title={userData?.heroProfile?.name ? `Academia de ${userData.heroProfile.name}` : (userData?.heroProfile?.gender === 'girl' ? "Academia de Heroínas" : "Academia de Héroes")}
            onHomeClick={scrollToTop}
            onSettingsClick={() => setIsParentCenterOpen(true)}
            onProfileClick={() => setIsProfileOpen(true)}
        >
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
                    <StatCard
                        icon={Star}
                        label="Experiencia Total"
                        value={`${formatNumber(userData?.inventory?.xp || 0)} XP`}
                    />
                    <StatCard
                        icon={Trophy}
                        label="Nivel de Héroe"
                        value={userData?.inventory?.level || 1}
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Racha Diaria"
                        value={userData?.streak || 0}
                    />
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
                        <p className="text-slate-400">Estamos diseñando el Traje de Sigilo para la próxima actualización de la Academia.</p>
                    </div>
                    <button
                        onClick={() => setIsRoadmapOpen(true)}
                        className="btn-primary"
                    >
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

                {/* Roadmap Modal - Premium PopUp */}
                <AnimatePresence>
                    {isRoadmapOpen && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsRoadmapOpen(false)}
                                className="absolute inset-0 bg-background-dark/90 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="glass max-w-lg w-full p-10 rounded-[3rem] relative z-10 border-primary/20 text-center shadow-[0_0_50px_rgba(0,127,255,0.2)]"
                            >
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
                                    <Trophy size={40} className="text-primary" />
                                </div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-white">
                                    ¡Muy Pronto <span className="text-primary text-glow">Novedades</span>!
                                </h3>
                                <p className="text-slate-400 text-lg leading-relaxed mb-10">
                                    Estamos trabajando en nuevas misiones, accesorios legendarios y sorpresas increíbles para la Academia de Héroes. 🚀
                                </p>
                                <button
                                    onClick={() => setIsRoadmapOpen(false)}
                                    className="btn-primary w-full py-4 text-lg"
                                >
                                    ¡ENTENDIDO, ESTARÉ LISTO!
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Profile Modal - Hero Career */}
                <AnimatePresence>
                    {isProfileOpen && (
                        <HeroProfile
                            onClose={() => setIsProfileOpen(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
