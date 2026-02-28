import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Rewind, FastForward, Award, CheckCircle, Timer as TimerIcon, Trophy } from 'lucide-react';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const levelTable = [
    { lvl: 10, minXp: 4500 },
    { lvl: 9, minXp: 3600 },
    { lvl: 8, minXp: 2800 },
    { lvl: 7, minXp: 2100 },
    { lvl: 6, minXp: 1500 },
    { lvl: 5, minXp: 1000 },
    { lvl: 4, minXp: 650 },
    { lvl: 3, minXp: 350 },
    { lvl: 2, minXp: 150 },
    { lvl: 1, minXp: 0 },
];

const missionRewards = {
    strength: { xp: 50, coins: 25, msg: "Has demostrado tu fuerza en Ciudad Fuerza" },
    speed: { xp: 60, coins: 30, msg: "Tu velocidad aumenta en Pista Turbo" },
    flexibility: { xp: 70, coins: 35, msg: "Tu equilibrio crece en Jungla Zen" }
};

const MissionPlayer = ({ mission, onClose }) => {
    const { userData } = useAuth();
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [powerBar, setPowerBar] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isCityCompleted, setIsCityCompleted] = useState(false);
    const [rewardProcessed, setRewardProcessed] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const videoRef = useRef(null);

    // Duración total de la misión en segundos
    const MISSION_DURATION = 30;

    // Recompensas dinámicas según la misión
    const currentReward = missionRewards[mission?.dbId] || { xp: 50, coins: 25, msg: "Misión Completada" };

    // Usa el video de la misión o un fallback
    const videoUrl = mission?.video || "/videos/Nino gimnasta 3-4.mp4";

    const calculateNewLevel = (totalXp) => {
        const levelObj = levelTable.find(l => totalXp >= l.minXp);
        return levelObj ? levelObj.lvl : 1;
    };

    const handleCompletion = async () => {
        if (rewardProcessed || !userData) return;
        setRewardProcessed(true);

        try {
            const userRef = doc(db, 'users', userData.uid);
            const currentXp = userData.inventory?.xp || 0;
            const currentMissions = userData.completedMissions?.[mission.dbId] || 0;

            // Multiplier from items (Neon Cape = 1.1x)
            const xpMultiplier = userData.equippedItems?.cape === 1 ? 1.10 : 1.0;
            const coinsMultiplier = 1.0; // Future items could add this

            // Ciclo de 20 misiones = 100%
            const isFinishingCycle = currentMissions >= 19;

            let xpToAdd = isFinishingCycle ? currentReward.xp + 500 : currentReward.xp;
            let coinsToAdd = isFinishingCycle ? currentReward.coins + 200 : currentReward.coins;

            // Apply Multipliers
            xpToAdd = Math.floor(xpToAdd * xpMultiplier);
            coinsToAdd = Math.floor(coinsToAdd * coinsMultiplier);

            const newXpTotal = currentXp + xpToAdd;
            const newLevel = calculateNewLevel(newXpTotal);

            const updates = {
                'inventory.xp': newXpTotal,
                'inventory.level': newLevel,
                'inventory.lastUpdated': serverTimestamp(),
                'coins': increment(coinsToAdd),
            };

            if (isFinishingCycle) {
                updates[`completedMissions.${mission.dbId}`] = 0;
                updates[`rewards.${mission.dbId}.cyclesCompleted`] = increment(1);
                setIsCityCompleted(true);
            } else {
                updates[`completedMissions.${mission.dbId}`] = increment(1);
            }

            await updateDoc(userRef, updates);
            console.log(isFinishingCycle ? "¡Ciclo Heroico Completado!" : "Misión guardada con éxito");
        } catch (error) {
            console.error("Error al guardar progreso:", error);
        }
    };

    // Temporizador Global de 30 Segundos
    useEffect(() => {
        let interval;
        if (isPlaying && timeLeft > 0 && !isCompleted) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        if (videoRef.current) videoRef.current.pause();
                        setIsCompleted(true);
                        setIsPlaying(false);
                        handleCompletion();
                        return 0;
                    }
                    return prev - 1;
                });
                setPowerBar(prev => (prev + Math.random() * 10) % 100);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, timeLeft, isCompleted, userData, rewardProcessed]);

    // Manejo de Loop Infinito del Video
    const handleVideoEnd = () => {
        if (videoRef.current && !isCompleted) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.log("Video play interrupted"));
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleRewind = () => {
        if (videoRef.current) videoRef.current.currentTime -= 5;
    };

    const handleFastForward = () => {
        if (videoRef.current) videoRef.current.currentTime += 5;
    };

    const handleRestart = () => {
        setTimeLeft(MISSION_DURATION);
        setPowerBar(0);
        setIsCompleted(false);
        setIsCityCompleted(false);
        setRewardProcessed(false);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
        setIsPlaying(true);
    };

    const progressValue = ((MISSION_DURATION - timeLeft) / MISSION_DURATION) * 100;

    return (
        <div className="fixed inset-0 z-[150] bg-background-dark flex flex-col font-display">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-8 flex justify-between items-center z-20 pointer-events-none">
                <div className="pointer-events-auto">
                    <button
                        onClick={onClose}
                        className="w-12 h-12 md:w-14 md:h-14 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="glass px-4 py-1.5 md:px-6 md:py-2 rounded-xl flex items-center gap-3 border-primary/20">
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">Misión en Vivo</span>
                    </div>
                    <p className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">
                        {mission?.title || 'Entrenamiento Hero'}
                    </p>
                </div>
            </div>

            {/* Timer Flotante Visible */}
            <div className="absolute top-[128px] left-4 md:left-8 z-30">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="glass px-6 py-2.5 rounded-2xl border-accent/20 flex items-center gap-3 shadow-[0_0_30px_rgba(0,127,255,0.3)]"
                >
                    <TimerIcon className="text-accent animate-spin-slow" size={20} />
                    <div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Tiempo</p>
                        <p className="text-xl font-black italic text-white leading-none">{timeLeft}s</p>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    playsInline
                    loop
                    muted={isMuted}
                    onEnded={handleVideoEnd}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />

                {/* Training Overlays */}
                {!isPlaying && !isCompleted && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-30">
                        <button
                            onClick={togglePlay}
                            className="w-24 h-24 md:w-32 md:h-32 bg-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,127,255,0.6)] active:scale-90 transition-transform"
                        >
                            <Play size={48} className="text-white fill-current ml-2" />
                        </button>
                    </div>
                )}

                {/* Power Bar (Floating UI) */}
                <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-30">
                    <div className="h-48 md:h-64 w-4 md:w-6 bg-white/5 rounded-full overflow-hidden border border-white/10 relative p-1">
                        <motion.div
                            animate={{ height: `${powerBar}%` }}
                            className="absolute bottom-1 left-1 right-1 bg-gradient-to-t from-primary to-accent rounded-full shadow-[0_0_20px_rgba(0,127,255,0.8)] transition-all duration-300"
                        />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-primary whitespace-nowrap rotate-90 mt-12">Poder</span>
                </div>
            </div>

            {/* Bottom Controls / Progress */}
            <div className="min-h-32 glass border-t border-white/5 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center gap-4 md:gap-8 relative z-20">
                <div className="flex items-center gap-3 md:gap-6">
                    <button
                        onClick={handleRewind}
                        className="text-slate-500 hover:text-white transition-colors p-2"
                    >
                        <Rewind size={24} />
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-14 h-14 md:w-16 md:h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white transition-all shadow-xl"
                    >
                        {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                    </button>
                    <button
                        onClick={handleFastForward}
                        className="text-slate-500 hover:text-white transition-colors p-2"
                    >
                        <FastForward size={24} />
                    </button>
                    <button
                        onClick={handleRestart}
                        className="text-slate-500 hover:text-white transition-all p-2 flex flex-col items-center gap-1 group"
                        title="Reiniciar Misión"
                    >
                        <Rewind size={20} className="group-active:rotate-[-45deg] transition-transform" />
                        <span className="text-[8px] font-bold uppercase">Reiniciar</span>
                    </button>
                </div>

                <div className="flex-1 w-full space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-500">Progreso Heroico</span>
                        <span className="text-primary">{Math.floor(progressValue)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            animate={{ width: `${progressValue}%` }}
                            className="h-full bg-primary shadow-[0_0_10px_rgba(0,127,255,0.5)]"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <div className="text-center min-w-[70px]">
                        <p className="text-xl md:text-2xl font-black italic text-accent line-height-1">+{currentReward.xp}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">XP Ganado</p>
                    </div>
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-white/5 text-white border border-white/10'
                            }`}
                    >
                        {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                </div>
            </div>

            {/* Modal de Ciudad Completada (Ciclo Maestro) */}
            <AnimatePresence>
                {isCityCompleted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-background-dark/95 backdrop-blur-2xl overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center max-w-lg w-full glass-card p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border-primary/30 shadow-[0_0_100px_rgba(0,127,255,0.4)] my-auto"
                        >
                            <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/20 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 animate-bounce">
                                <Trophy size={32} className="text-primary md:w-12 md:h-12" />
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-2 text-white leading-tight">
                                ¡CIUDAD <span className="text-primary">COMPLETADA</span>!
                            </h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-6 md:mb-10">Ciclo Heroico Finalizado</p>

                            <div className="bg-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-10 border border-white/20">
                                <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mb-3 md:mb-4 text-glow-sm">Recompensa del Mundo Real</p>
                                <p className="text-2xl md:text-3xl font-black italic text-accent uppercase leading-tight drop-shadow-lg">
                                    {userData?.rewards?.[mission.dbId]?.realReward || "¡Premio Especial!"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
                                <div className="glass p-3 md:p-4 rounded-xl md:rounded-2xl border-primary/20 bg-primary/5">
                                    <p className="text-xl md:text-3xl font-black italic text-primary">+500</p>
                                    <p className="text-[8px] md:text-[10px] uppercase font-bold text-slate-500">BONO XP</p>
                                </div>
                                <div className="glass p-3 md:p-4 rounded-xl md:rounded-2xl border-yellow-500/20 bg-yellow-500/5">
                                    <p className="text-xl md:text-3xl font-black italic text-yellow-500">+200</p>
                                    <p className="text-[8px] md:text-[10px] uppercase font-bold text-slate-500">BONO COINS</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="btn-primary w-full py-4 md:py-6 text-lg md:text-2xl shadow-[0_0_40px_rgba(0,127,255,0.5)]"
                            >
                                SEGUIR ENTRENANDO
                                <CheckCircle size={24} className="md:w-7 md:h-7" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completion Modal (Mission) */}
            <AnimatePresence>
                {isCompleted && !isCityCompleted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-background-dark/95 backdrop-blur-xl overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center max-w-md w-full my-auto"
                        >
                            <div className="w-20 h-20 md:w-32 md:h-32 bg-accent/20 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 md:mb-8 border border-accent/20">
                                <Award size={40} className="text-accent md:w-16 md:h-16" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-4 leading-tight">
                                ¡Misión <span className="text-accent">Completada</span>!
                            </h2>
                            <p className="text-slate-400 text-base md:text-lg mb-8 md:mb-10 leading-relaxed capitalize px-4">
                                {currentReward.msg}
                            </p>

                            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
                                <div className="glass p-4 rounded-xl md:rounded-2xl border-white/5">
                                    <p className="text-xl md:text-2xl font-bold text-primary">+{currentReward.xp}</p>
                                    <p className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500">Experiencia</p>
                                </div>
                                <div className="glass p-4 rounded-xl md:rounded-2xl border-white/5">
                                    <p className="text-xl md:text-2xl font-bold text-yellow-500">+{currentReward.coins}</p>
                                    <p className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500">Hero Coins</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={onClose}
                                    className="btn-primary w-full py-4 md:py-5 text-lg md:text-xl px-4"
                                >
                                    REGRESAR A LA ACADEMIA
                                    <CheckCircle size={24} />
                                </button>
                                <button
                                    onClick={handleRestart}
                                    className="w-full py-3 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                                >
                                    REPETIR MISIÓN
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MissionPlayer;
