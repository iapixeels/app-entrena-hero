import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Rewind, FastForward, Award, CheckCircle } from 'lucide-react';

const MissionPlayer = ({ mission, onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [powerBar, setPowerBar] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const videoRef = useRef(null);

    // Mock video URL - En una app real esto vendría de los datos de la misión
    const videoUrl = "https://iapixeels-premium-content.s3.us-east-2.amazonaws.com/avatares-iapixeels/sophia-clips/sophia-saludo-subt-4-5.mp4";

    useEffect(() => {
        let interval;
        if (isPlaying && !isCompleted) {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setIsCompleted(true);
                        setIsPlaying(false);
                        return 100;
                    }
                    return prev + 0.5;
                });

                // Simulación de "Barra de Poder" (esto vendría de sensores en el futuro)
                setPowerBar(prev => (prev + Math.random() * 10) % 100);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isCompleted]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed inset-0 z-[150] bg-background-dark flex flex-col font-display">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-20 pointer-events-none">
                <div className="pointer-events-auto">
                    <button
                        onClick={onClose}
                        className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    >
                        <X size={28} />
                    </button>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="glass px-6 py-2 rounded-xl flex items-center gap-3 border-primary/20">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Misión en Vivo</span>
                    </div>
                    <p className="text-2xl font-black italic uppercase italic tracking-tighter text-white drop-shadow-lg">
                        {mission?.title || 'Entrenamiento Hero'}
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative flex items-center justify-center bg-black">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    playsInline
                />

                {/* Training Overlays */}
                {!isPlaying && !isCompleted && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                        <button
                            onClick={togglePlay}
                            className="w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,127,255,0.6)] active:scale-90 transition-transform"
                        >
                            <Play size={64} className="text-white fill-current ml-2" />
                        </button>
                    </div>
                )}

                {/* Power Bar (Floating UI) */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
                    <div className="h-64 w-6 bg-white/5 rounded-full overflow-hidden border border-white/10 relative p-1">
                        <motion.div
                            animate={{ height: `${powerBar}%` }}
                            className="absolute bottom-1 left-1 right-1 bg-gradient-to-t from-primary to-accent rounded-full shadow-[0_0_20px_rgba(0,127,255,0.8)]"
                        />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary whitespace-nowrap rotate-90 mt-12">Barra de Poder</span>
                </div>
            </div>

            {/* Bottom Controls / Progress */}
            <div className="h-32 glass border-t border-white/5 px-8 flex items-center gap-8 relative z-20">
                <div className="flex items-center gap-4">
                    <button className="text-slate-500 hover:text-white transition-colors"><Rewind size={24} /></button>
                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white transition-all"
                    >
                        {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                    </button>
                    <button className="text-slate-500 hover:text-white transition-colors"><FastForward size={24} /></button>
                </div>

                <div className="flex-1 space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-500">Progreso de la sesión</span>
                        <span className="text-primary">{Math.floor(progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-primary"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-2xl font-black italic text-accent">+120</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">XP Ganado</p>
                    </div>
                    <button className="btn-secondary">
                        Mute
                    </button>
                </div>
            </div>

            {/* Completion Modal */}
            <AnimatePresence>
                {isCompleted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background-dark/95 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="text-center max-w-md w-full"
                        >
                            <div className="w-32 h-32 bg-accent/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-accent/20">
                                <Award size={64} className="text-accent" />
                            </div>
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
                                ¡Misión <span className="text-accent">Completada</span>!
                            </h2>
                            <p className="text-slate-400 text-lg mb-10 leading-relaxed capitalize">
                                Has demostrado el valor de un verdadero héroe en {mission?.title}.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="glass p-4 rounded-2xl border-white/5">
                                    <p className="text-2xl font-bold text-primary">+250</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-500">Experiencia</p>
                                </div>
                                <div className="glass p-4 rounded-2xl border-white/5">
                                    <p className="text-2xl font-bold text-yellow-500">+50</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-500">Hero Coins</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="btn-primary w-full py-5 text-xl"
                            >
                                REGRESAR AL CUARTEL
                                <CheckCircle size={24} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MissionPlayer;
