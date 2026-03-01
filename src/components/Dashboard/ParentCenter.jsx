import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Timer, Gift, Lock, X, Check, Save, Trophy, Camera, Upload, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ParentCenter = ({ isOpen, onClose }) => {
    const { userData } = useAuth();
    const [pin, setPin] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [error, setError] = useState(false);

    // App Settings State
    const [timeLimit, setTimeLimit] = useState(30);
    const [realRewards, setRealRewards] = useState({
        strength: '',
        speed: '',
        flexibility: ''
    });
    const [gender, setGender] = useState('boy');
    const [name, setName] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (userData) {
            setTimeLimit(userData.timeLimit || 30);
            if (userData.rewards) {
                setRealRewards({
                    strength: userData.rewards.strength?.realReward || '',
                    speed: userData.rewards.speed?.realReward || '',
                    flexibility: userData.rewards.flexibility?.realReward || ''
                });
            }
            setGender(userData.heroProfile?.gender || 'boy');
            setName(userData.heroProfile?.name || userData.name || '');
            setProfilePhoto(userData.profilePhoto || null);
        }
    }, [userData]);

    const correctPin = '1234';

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

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !userData) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `profiles/${userData.uid}_hero`);
            // Usamos uploadBytes directamente con await para un flujo más limpio
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            setProfilePhoto(downloadURL);
            setUploading(false);
            console.log("Foto actualizada exitosamente");
        } catch (error) {
            console.error("Error al subir la foto:", error);
            setUploading(false);
            alert("No se pudo subir la foto. Verifica los permisos de Firebase Storage.");
        }
    };

    const handleSave = async () => {
        if (!userData) return;
        try {
            const userRef = doc(db, 'users', userData.uid);
            await updateDoc(userRef, {
                'rewards.strength.realReward': realRewards.strength,
                'rewards.speed.realReward': realRewards.speed,
                'rewards.flexibility.realReward': realRewards.flexibility,
                'heroProfile.gender': gender,
                'heroProfile.name': name,
                'profilePhoto': profilePhoto,
                'timeLimit': timeLimit
            });
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Error saving parent config:", error);
        }
    };

    const handleResetProgress = async () => {
        if (!userData || !window.confirm("¿Estás seguro de reiniciar el progreso de las misiones? (Mantendrás tus XP y Monedas)")) return;
        try {
            const userRef = doc(db, 'users', userData.uid);
            await updateDoc(userRef, {
                'completedMissions.strength': 0,
                'completedMissions.speed': 0,
                'completedMissions.flexibility': 0
            });
            alert("¡Progreso de ciudad reiniciado!");
        } catch (error) {
            console.error("Error resetting progress:", error);
        }
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
                className="glass w-full max-w-4xl h-[90vh] md:h-[85vh] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative z-10 border-white/10 shadow-[0_0_80px_rgba(0,127,255,0.3)] flex flex-col mx-4"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 md:top-8 md:right-8 text-slate-500 hover:text-white transition-colors z-[60]"
                >
                    <X size={24} />
                </button>

                {!isUnlocked ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 border border-primary/20">
                            <Lock size={28} className="text-primary md:w-8 md:h-8" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-4">Control de <span className="text-primary text-glow">Misión</span></h2>
                        <p className="text-slate-400 text-sm mb-8 md:mb-10 max-w-xs mx-auto text-balance">Ingresa tu código PIN parental para configurar la academia.</p>

                        <form onSubmit={handlePinSubmit} className="w-full max-w-[280px] md:max-w-xs mx-auto">
                            <input
                                type="password"
                                maxLength={4}
                                placeholder="****"
                                className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl py-4 md:py-6 text-center text-3xl md:text-4xl tracking-[1em] focus:outline-none focus:border-primary/50 transition-all font-black`}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                autoFocus
                            />
                            {error && <p className="text-red-500 text-[10px] mt-4 font-bold uppercase tracking-widest animate-shake">PIN Incorrecto</p>}
                            <button
                                type="submit"
                                className="btn-primary w-full mt-6 md:mt-8 py-4"
                            >
                                AUTORIZAR ACCESO
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="p-6 md:p-10 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 glass rounded-xl flex items-center justify-center text-accent">
                                <ShieldCheck size={28} className="md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-tight">Centro de <span className="text-accent">Padres</span></h2>
                                <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Configuración Maestra de la Academia</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
                            {/* Time Limit Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 text-slate-200">
                                    <Timer size={20} className="text-primary" />
                                    <h3 className="font-bold uppercase tracking-widest text-sm">Límite de Entrenamiento</h3>
                                </div>
                                <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="w-full md:flex-1 space-y-4">
                                        <input
                                            type="range"
                                            min="15"
                                            max="120"
                                            step="15"
                                            className="w-full accent-primary h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                            value={timeLimit}
                                            onChange={(e) => setTimeLimit(e.target.value)}
                                        />
                                        <div className="flex justify-between text-[9px] font-bold text-slate-500 tracking-widest uppercase">
                                            <span>15 MIN</span>
                                            <span>60 MIN</span>
                                            <span>120 MIN</span>
                                        </div>
                                    </div>
                                    <div className="text-center bg-primary/10 border border-primary/20 p-4 rounded-2xl min-w-[120px]">
                                        <p className="text-3xl font-black italic text-primary leading-none mb-1">{timeLimit}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Minutos</p>
                                    </div>
                                </div>
                            </section>

                            {/* Identity Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 text-slate-200">
                                    <ShieldCheck size={20} className="text-accent" />
                                    <h3 className="font-bold uppercase tracking-widest text-sm">Identidad Heroica</h3>
                                </div>
                                <div className="space-y-8">
                                    <div className="glass-card p-6 border-white/5 bg-white/[0.01] space-y-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nombre del Héroe / Heroína</span>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-all font-bold"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Escribe el nombre aquí..."
                                        />
                                    </div>

                                    {/* Avatar Visual Section */}
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Apariencia del Héroe / Heroína</span>
                                        <div className="flex flex-col md:flex-row items-center gap-8 glass-card p-8 border-white/10 bg-white/[0.02]">
                                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/10 p-2 glass shadow-2xl">
                                                <div className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br transition-all duration-700 ${gender === 'girl' ? 'from-accent/40 to-accent/10 shadow-[0_0_40px_rgba(0,255,204,0.3)]' : 'from-primary/40 to-primary/10 shadow-[0_0_40px_rgba(0,127,255,0.3)]'}`}>
                                                    {gender === 'girl' ?
                                                        <Trophy size={64} className="text-accent animate-pulse" /> :
                                                        <ShieldCheck size={64} className="text-primary animate-pulse" />
                                                    }
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-4 w-full text-center md:text-left">
                                                <h4 className="text-lg font-black italic uppercase tracking-tighter text-white">Identidad Seleccionada</h4>
                                                <p className="text-xs text-slate-400 max-w-sm">El emblema de tu héroe se actualiza automáticamente según su identidad elegida.</p>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${gender === 'boy' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                                                        Modo Héroe Activado
                                                    </div>
                                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${gender === 'girl' ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                                                        Modo Heroína Activado
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setGender('boy')}
                                            className={`glass-card p-6 flex flex-col items-center gap-3 transition-all ${gender === 'boy' ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,127,255,0.2)]' : 'border-white/5 opacity-40'}`}
                                        >
                                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                                                <ShieldCheck size={32} className="text-primary" />
                                            </div>
                                            <span className={`text-xs font-black uppercase tracking-widest ${gender === 'boy' ? 'text-primary' : 'text-slate-500'}`}>Héroe (Niño)</span>
                                        </button>
                                        <button
                                            onClick={() => setGender('girl')}
                                            className={`glass-card p-6 flex flex-col items-center gap-3 transition-all ${gender === 'girl' ? 'border-accent bg-accent/10 shadow-[0_0_20px_rgba(0,255,204,0.2)]' : 'border-white/5 opacity-40'}`}
                                        >
                                            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center">
                                                <Trophy size={32} className="text-accent" />
                                            </div>
                                            <span className={`text-xs font-black uppercase tracking-widest ${gender === 'girl' ? 'text-accent' : 'text-slate-500'}`}>Heroína (Niña)</span>
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Rewards Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 text-slate-200">
                                    <Gift size={20} className="text-secondary" />
                                    <h3 className="font-bold uppercase tracking-widest text-sm">Premios por Ciudad Completada</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="glass-card p-6 border-white/5 bg-white/[0.01] space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Trophy className="text-primary" size={18} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Ciudad Fuerza</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Ej: Salida al cine, Pizza..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all font-bold"
                                            value={realRewards.strength}
                                            onChange={(e) => setRealRewards({ ...realRewards, strength: e.target.value })}
                                        />
                                    </div>

                                    <div className="glass-card p-6 border-white/5 bg-white/[0.01] space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Trophy className="text-secondary" size={18} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Pista Turbo</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Ej: Helado familiar..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary/50 transition-all font-bold"
                                            value={realRewards.speed}
                                            onChange={(e) => setRealRewards({ ...realRewards, speed: e.target.value })}
                                        />
                                    </div>

                                    <div className="glass-card p-6 border-white/5 bg-white/[0.01] space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Trophy className="text-accent" size={18} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Jungla Zen</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Ej: Elegir juguete..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-all font-bold"
                                            value={realRewards.flexibility}
                                            onChange={(e) => setRealRewards({ ...realRewards, flexibility: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Danger Zone */}
                            <section className="pt-8 border-t border-red-500/10 space-y-4">
                                <div className="flex items-center gap-3 text-red-500/70">
                                    <Lock size={18} />
                                    <h3 className="font-bold uppercase tracking-widest text-xs">Mantenimiento Masivo</h3>
                                </div>
                                <button
                                    onClick={handleResetProgress}
                                    className="w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                >
                                    Reiniciar Progreso de Ciudad
                                </button>
                                <p className="text-[8px] text-slate-600 text-center uppercase tracking-widest">Esto pondrá los contadores de misiones a 0. Las monedas y XP se conservarán.</p>
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

                {/* Overlay de Éxito Estilizado */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="absolute inset-0 z-[110] flex items-center justify-center p-8 bg-background-dark/60 backdrop-blur-xl"
                        >
                            <div className="glass-card p-10 rounded-[3rem] border-primary/30 text-center shadow-[0_0_50px_rgba(0,127,255,0.3)]">
                                <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Check className="text-primary" size={40} />
                                </div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">¡Configuración <span className="text-primary">Guardada</span>!</h3>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Academia de Héroes Actualizada</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ParentCenter;
