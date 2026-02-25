import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Zap, Shield, Sparkles, Check } from 'lucide-react';

const skins = [
    { id: 1, name: 'Capa de Neón', price: 500, icon: <Sparkles className="text-primary" />, color: 'primary' },
    { id: 2, name: 'Escudo Global', price: 1200, icon: <Shield className="text-accent" />, color: 'accent' },
    { id: 3, name: 'Botas Turbo', price: 850, icon: <Zap className="text-secondary" />, color: 'secondary' },
    { id: 4, name: 'Casco Elite', price: 2000, icon: <Star className="text-yellow-500" />, color: 'yellow-500' },
];

const EliteShop = () => {
    const [balance, setBalance] = useState(1500);
    const [owned, setOwned] = useState([1]);

    const handleBuy = (skin) => {
        if (balance >= skin.price && !owned.includes(skin.id)) {
            setBalance(prev => prev - skin.price);
            setOwned(prev => [...prev, skin.id]);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                    <ShoppingBag className="text-primary" />
                    Tienda de <span className="text-primary text-glow">Élite</span>
                </h3>
                <div className="glass px-4 py-2 rounded-2xl flex items-center gap-3 border-yellow-500/20">
                    <Star size={18} className="text-yellow-500 fill-current" />
                    <span className="text-lg font-bold text-yellow-500">{balance}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {skins.map(skin => (
                    <motion.div
                        key={skin.id}
                        whileHover={{ scale: 1.02 }}
                        className="glass-card p-6 border-white/5 bg-white/[0.01] flex flex-col items-center text-center gap-4"
                    >
                        <div className={`w-20 h-20 rounded-3xl bg-${skin.color}/10 border border-${skin.color}/20 flex items-center justify-center text-2xl`}>
                            {skin.icon}
                        </div>
                        <div>
                            <p className="font-bold text-lg mb-1">{skin.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Accesorio Legendario</p>
                        </div>

                        <button
                            onClick={() => handleBuy(skin)}
                            disabled={owned.includes(skin.id) || balance < skin.price}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${owned.includes(skin.id)
                                    ? 'bg-accent/20 text-accent border border-accent/20 cursor-default'
                                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 active:scale-95 disabled:opacity-30'
                                }`}
                        >
                            {owned.includes(skin.id) ? (
                                <><Check size={18} /> Equipado</>
                            ) : (
                                <><Star size={16} className="text-yellow-500 fill-current" /> {skin.price}</>
                            )}
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default EliteShop;
