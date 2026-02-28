import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Play, Zap, Dumbbell, Target } from 'lucide-react';
import MissionPlayer from './MissionPlayer';
import { useAuth } from '../../context/AuthContext';

const missions = [
    {
        id: 'ciudad-fuerza',
        dbId: 'strength',
        title: 'Ciudad Fuerza',
        sector: 'Sector Alpha',
        description: 'Entrenamiento de resistencia y poder muscular.',
        icon: <Dumbbell className="text-primary" />,
        color: 'primary',
        locked: false,
        image: '/imagenes/Nene haciendo ejercicio.jpeg',
        video: '/videos/Nino gimnasta 3-4.mp4'
    },
    {
        id: 'pista-turbo',
        dbId: 'speed',
        title: 'Pista Turbo',
        sector: 'Sector Beta',
        description: 'Agilidad, velocidad y reflejos de superhéroe.',
        icon: <Zap className="text-secondary" />,
        color: 'secondary',
        locked: false,
        image: '/imagenes/speed.jpeg',
        video: '/videos/speed 3-4.mp4'
    },
    {
        id: 'jungla-zen',
        dbId: 'flexibility',
        title: 'Jungla Zen',
        sector: 'Sector Omega',
        description: 'Flexibilidad, equilibrio y enfoque mental.',
        icon: <Target className="text-accent" />,
        color: 'accent',
        locked: false,
        image: '/imagenes/flexibility.jpeg',
        video: '/videos/flexibility 3-4.mp4'
    }
];

const MissionCard = ({ mission, onClick, currentProgress }) => {
    return (
        <motion.div
            whileHover={mission.locked ? {} : { y: -10 }}
            onClick={() => !mission.locked && onClick({ ...mission, progress: currentProgress })}
            className={`relative group h-[450px] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl ${mission.locked ? 'grayscale cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {/* Background Image */}
            <img src={mission.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40" alt={mission.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className={`text-${mission.color} font-bold text-xs tracking-widest uppercase mb-2 block`}>
                    {mission.sector}
                </span>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 flex items-center gap-3">
                    {mission.title}
                    {!mission.locked && <Play size={20} className="fill-current" />}
                </h3>

                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    {mission.description}
                </p>

                {/* Progress Bar */}
                {!mission.locked && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <span>Progreso de Misión</span>
                            <span className="text-primary">{currentProgress || 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${currentProgress || 0}%` }}
                                className="h-full bg-primary shadow-[0_0_10px_rgba(0,127,255,0.5)]"
                            />
                        </div>
                    </div>
                )}

                {mission.locked && (
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mt-4">
                        <Lock size={16} />
                        Misión Bloqueada
                    </div>
                )}
            </div>

            {/* Decorative Icon */}
            <div className="absolute top-8 right-8 w-14 h-14 glass rounded-2xl flex items-center justify-center">
                {mission.icon}
            </div>
        </motion.div>
    );
};

const MissionMap = () => {
    const { userData } = useAuth();
    const [selectedMission, setSelectedMission] = useState(null);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {missions.map((mission) => {
                    const missionCount = userData?.completedMissions?.[mission.dbId] || 0;
                    const progressPercentage = Math.min(100, missionCount * 5);

                    return (
                        <MissionCard
                            key={mission.id}
                            mission={mission}
                            currentProgress={progressPercentage}
                            onClick={setSelectedMission}
                        />
                    );
                })}
            </div>

            <AnimatePresence>
                {selectedMission && (
                    <MissionPlayer
                        mission={selectedMission}
                        onClose={() => setSelectedMission(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default MissionMap;
