import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Timer, Gift, Lock, X, Check, Save } from 'lucide-react';

const ParentCenter = ({ isOpen, onClose }) => {
    const [pin, setPin] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [error, setError] = useState(false);

    // App Settings State
    const [timeLimit, setTimeLimit] = useState(30);
    const [rewards, setRewards] = useState([
        { id: 1, name: 'Salida al Cine', points: 1000 },
        { id: 2, name: 'Día de Parque', points: 500 },
    ]);

    const correctPin = '1234'; // Esto debería guardarse en Firestore eventualmente

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pin === correctPin) {
            setIsUnlocked(true);
            setError(false);
        } else {
            setError(true);
            setPin('');
            setTimeout(() => setError(false), 2000);
        }
    };

    const handleSave = () => {
        // Aquí iría la lógica para guardar en Firestore
        alert('¡Configuración guardada en el Cuartel General!');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-background-dark/80 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="glass w-full max-w-2xl rounded-[3rem] overflow-hidden relative z-10 border-white/10 shadow-[0_0_50px_rgba(0,127,255,0.2)]"
            >
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {!isUnlocked ? (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
                            <Lock size={32} className="text-primary" />
                        </div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Control de <span className="text-primary text-glow">Misión</span></h2>
                        <p className="text-slate-400 mb-10">Ingresa tu código PIN parental para configurar la academia.</p>

                        <form onSubmit={handlePinSubmit} className="max-w-xs mx-auto">
                            <input
                                type="password"
                                maxLength={4}
                                placeholder="****"
                                className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl py-6 text-center text-4xl tracking-[1em] focus:outline-none focus:border-primary/50 transition-all font-black`}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                autoFocus
                            />
                            {error && <p className="text-red-500 text-xs mt-4 font-bold uppercase tracking-widest animate-shake">PIN Incorrecto</p>}
                            <button
                                type="submit"
                                className="btn-primary w-full mt-8 py-4"
                            >
                                AUTORIZAR ACCESO
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col h-[70vh] md:h-auto">
                        <div className="p-10 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="text-accent" size={32} />
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Centro de <span className="text-accent">Padres</span></h2>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Configuración Maestra</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                            {/* Time Limit Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 text-slate-200">
                                    <Timer size={20} className="text-primary" />
                                    <h3 className="font-bold uppercase tracking-widest text-sm">Límite de Entrenamiento</h3>
                                </div>
                                <div className="glass-card p-6 flex items-center justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <input
                                            type="range"
                                            min="15"
                                            max="120"
                                            step="15"
                                            className="w-full accent-primary h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                            value={timeLimit}
                                            onChange={(e) => setTimeLimit(e.target.value)}
                                        />
                                        <div className="flex justify-between text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                                            <span>15 MIN</span>
                                            <span>60 MIN</span>
                                            <span>120 MIN</span>
                                        </div>
                                    </div>
                                    <div className="text-center bg-primary/10 border border-primary/20 p-4 rounded-2xl min-w-[100px]">
                                        <p className="text-2xl font-black italic text-primary">{timeLimit}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Minutos</p>
                                    </div>
                                </div>
                            </section>

                            {/* Rewards Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 text-slate-200">
                                    <Gift size={20} className="text-secondary" />
                                    <h3 className="font-bold uppercase tracking-widest text-sm">Recompensas del Mundo Real</h3>
                                </div>
                                <div className="space-y-3">
                                    {rewards.map(reward => (
                                        <div key={reward.id} className="glass-card p-4 flex items-center justify-between border-white/5 bg-white/[0.01]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                                    <Check size={18} />
                                                </div>
                                                <p className="font-bold">{reward.name}</p>
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
                                                {reward.points} XP
                                            </span>
                                        </div>
                                    ))}
                                    <button className="w-full border border-dashed border-white/10 rounded-2xl py-4 text-slate-500 hover:text-white hover:border-white/20 transition-all text-xs font-bold uppercase tracking-widest">
                                        + Añadir Nueva Recompensa
                                    </button>
                                </div>
                            </section>
                        </div>

                        <div className="p-10 border-t border-white/5 bg-white/[0.02]">
                            <button
                                onClick={handleSave}
                                className="btn-primary w-full py-5 text-xl"
                            >
                                <Save size={20} />
                                GUARDAR CAMBIOS
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ParentCenter;
