import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Star, ShoppingBag, Shield, Check, Info, Zap, Pizza, Tv } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

const skins = [
    { id: 1, name: 'Capa de Neón', type: 'cape', image: '/imagenes/capa de neón.webp', color: 'primary' },
    { id: 2, name: 'Escudo Global', type: 'aura', image: '/imagenes/escudo global.webp', color: 'accent' },
    { id: 3, name: 'Botas Turbo', type: 'suit', image: '/imagenes/Botas turbo.webp', color: 'secondary' },
    { id: 4, name: 'Casco Elite', type: 'suit', image: '/imagenes/Casco elite.webp', color: 'yellow-500' },
];

const HeroProfile = ({ onClose }) => {
    const { userData } = useAuth();
    const inventory = userData?.inventory?.items || [];
    const equipped = userData?.equippedItems || {};
    const rewards = userData?.rewards || {};

    const handleEquip = async (skinId, type) => {
        if (!userData) return;
        const userRef = doc(db, 'users', userData.uid);

        // Si ya está equipado, lo desequipamos
        const newEquipped = { ...equipped };
        newEquipped[type] = equipped[type] === skinId ? null : skinId;

        try {
            await updateDoc(userRef, {
                equippedItems: newEquipped
            });
        } catch (error) {
            console.error("Error al equipar item:", error);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !userData) return;

        try {
            const storageRef = ref(storage, `profiles/${userData.uid}_avatar`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                null,
                (error) => console.error("Upload error:", error),
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const userRef = doc(db, 'users', userData.uid);
                    await updateDoc(userRef, { profilePhoto: downloadURL });
                }
            );
        } catch (error) {
            console.error("Error saving photo:", error);
        }
    };

    const isGirl = userData?.heroProfile?.gender === 'girl';

    const getEquippedSkin = (type) => {
        const id = equipped[type];
        return skins.find(s => s.id === id);
    };

    const totalRealRewards = Object.values(rewards).reduce((acc, curr) => acc + (curr.cyclesCompleted || 0), 0);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-background-dark/95 backdrop-blur-xl"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="glass w-full max-w-5xl h-[90vh] md:h-[85vh] rounded-[2.5rem] md:rounded-[4rem] relative z-10 border-white/10 shadow-[0_0_100px_rgba(0,127,255,0.3)] flex flex-col mx-auto"
            >
                {/* Header */}
                <div className="p-8 md:p-10 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 ${isGirl ? 'bg-accent/20 border-accent/20' : 'bg-primary/20 border-primary/20'} rounded-2xl flex items-center justify-center border`}>
                            <Shield className={isGirl ? 'text-accent' : 'text-primary'} size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Perfil de <span className={`${isGirl ? 'text-accent' : 'text-primary'} text-glow`}>{isGirl ? 'Heroína' : 'Héroe'}</span></h2>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Nivel {userData?.inventory?.level || 1} • {userData?.inventory?.xp || 0} XP</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 text-slate-500 hover:text-white transition-colors">
                        <X size={28} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar md:flex md:overflow-hidden">
                    {/* Character Preview Area */}
                    <div className="md:w-5/12 p-8 md:p-12 flex flex-col items-center justify-center bg-white/[0.02] border-r border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,127,255,0.1),transparent_70%)]" />

                        {/* Avatar Simulation / Fixed Identity */}
                        <div className="relative w-48 h-48 md:w-64 md:h-64 mb-10 flex items-center justify-center">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className={`w-full h-full rounded-full border-2 border-dashed ${isGirl ? 'border-accent/30' : 'border-primary/30'} flex items-center justify-center p-4 relative shadow-[0_0_50px_rgba(0,0,0,0.3)]`}
                            >
                                <div className={`w-full h-full bg-gradient-to-tr ${isGirl ? 'from-accent/30 to-accent/10' : 'from-primary/30 to-primary/10'} rounded-full flex items-center justify-center relative overflow-hidden glass`}>
                                    <div className="absolute inset-0 bg-white/5 animate-pulse" />
                                    {isGirl ? (
                                        <Trophy size={80} className="text-accent drop-shadow-[0_0_15px_rgba(0,255,204,0.5)]" />
                                    ) : (
                                        <Shield size={80} className="text-primary drop-shadow-[0_0_15px_rgba(0,127,255,0.5)]" />
                                    )}

                                    {/* Equipped Items Overlay Labels */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        {Object.entries(equipped).map(([type, id]) => {
                                            if (!id) return null;
                                            const skin = skins.find(s => s.id === id);
                                            return (
                                                <motion.div
                                                    key={type}
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="absolute p-2 bg-background-dark/80 rounded-lg border border-white/20 shadow-xl flex items-center gap-2"
                                                    style={{
                                                        top: type === 'suit' ? '20%' : type === 'cape' ? '50%' : '80%',
                                                        left: type === 'suit' ? '-10%' : type === 'aura' ? '80%' : '10%'
                                                    }}
                                                >
                                                    <div className={`w-3 h-3 rounded-full bg-${skin?.color || 'primary'}`} />
                                                    <span className="text-[8px] font-black uppercase text-white whitespace-nowrap">{skin?.name}</span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="text-center">
                            <h4 className="text-2xl font-black uppercase italic italic text-white mb-1 tracking-tighter">{userData?.heroProfile?.name || (isGirl ? 'Heroína' : 'Héroe')}</h4>
                            <p className={`${isGirl ? 'text-accent' : 'text-primary'} text-[10px] font-black uppercase tracking-[0.3em] text-glow`}>Academia de Élite</p>
                        </div>
                    </div>

                    {/* Tabs / Content Area */}
                    <div className="md:w-7/12 p-8 md:p-12 overflow-y-auto custom-scrollbar space-y-12">
                        {/* Logros Reales Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Award className="text-yellow-500" size={24} />
                                <h3 className="font-black italic uppercase tracking-tighter text-xl">Logros del <span className="text-yellow-500">Mundo Real</span></h3>
                            </div>

                            {totalRealRewards === 0 ? (
                                <div className="glass-card p-8 text-center bg-white/5 border-dashed border-white/10">
                                    <p className="text-slate-500 text-sm italic font-medium">Aún no has completado ciclos de ciudad. ¡Sigue entrenando para ganar premios reales!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(rewards).map(([key, data]) => {
                                        if (data.cyclesCompleted > 0) {
                                            return (
                                                <div key={key} className="glass-card p-6 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <div className="p-3 bg-yellow-500/20 rounded-xl">
                                                            {key === 'strength' ? <Shield size={20} className="text-yellow-500" /> :
                                                                key === 'speed' ? <Zap size={20} className="text-yellow-500" /> :
                                                                    <Award size={20} className="text-yellow-500" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-xl font-black italic text-white leading-none capitalize">{data.realReward || 'Recompensa'}</p>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{data.cyclesCompleted} Ganados</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Check size={14} className="text-green-500" />
                                                        <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Listo para reclamar con papá/mamá</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Inventario de Skins Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="text-primary" size={24} />
                                <h3 className="font-black italic uppercase tracking-tighter text-xl">Inventario de <span className="text-primary">Equipamiento</span></h3>
                            </div>

                            {inventory.length === 0 ? (
                                <div className="glass-card p-8 text-center bg-white/5">
                                    <p className="text-slate-500 text-sm">No tienes accesorios. ¡Visita la Tienda de Élite!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {skins.filter(s => inventory.includes(s.id)).map(skin => (
                                        <button
                                            key={skin.id}
                                            onClick={() => handleEquip(skin.id, skin.type)}
                                            className={`glass-card p-4 text-center border transition-all ${equipped[skin.type] === skin.id
                                                ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(0,127,255,0.2)]'
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="w-full aspect-square bg-white/5 rounded-xl mb-3 overflow-hidden flex items-center justify-center p-2">
                                                <img src={skin.image} alt={skin.name} className="w-full h-full object-contain" />
                                            </div>
                                            <p className="text-[10px] font-black italic uppercase text-white truncate mb-1">{skin.name}</p>
                                            <p className={`text-[8px] font-bold uppercase tracking-widest ${equipped[skin.type] === skin.id ? 'text-primary' : 'text-slate-500'
                                                }`}>
                                                {equipped[skin.type] === skin.id ? 'EQUIPADO' : 'EQUIPAR'}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default HeroProfile;
