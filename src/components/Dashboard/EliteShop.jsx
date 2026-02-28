import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Zap, Shield, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const skins = [
    { id: 1, name: 'Capa de Neón', price: 500, image: '/imagenes/capa de neón.webp', color: 'primary', benefit: '+20% Poder' },
    { id: 2, name: 'Escudo Global', price: 1200, image: '/imagenes/escudo global.webp', color: 'accent', benefit: '+30% Resistencia' },
    { id: 3, name: 'Botas Turbo', price: 850, image: '/imagenes/Botas turbo.webp', color: 'secondary', benefit: '+25% Agilidad' },
    { id: 4, name: 'Casco Elite', price: 2000, image: '/imagenes/Casco elite.webp', color: 'yellow-500', benefit: '+50% Enfoque' },
];

const EliteShop = () => {
    const { userData } = useAuth();
    const [balance, setBalance] = useState(0);
    const [owned, setOwned] = useState([]);

    useEffect(() => {
        if (userData) {
            setBalance(userData.coins || 0);
            // Si inventory es un objeto, leemos .items, si es array (legacy) lo usamos directo
            const items = Array.isArray(userData.inventory)
                ? userData.inventory
                : (userData.inventory?.items || []);
            setOwned(items);
        }
    }, [userData]);

    const handleBuy = async (skin) => {
        if (userData && balance >= skin.price && !owned.includes(skin.id)) {
            try {
                const userRef = doc(db, 'users', userData.uid);
                await updateDoc(userRef, {
                    coins: increment(-skin.price),
                    'inventory.items': arrayUnion(skin.id)
                });
                console.log("Compra realizada con éxito:", skin.name);
            } catch (error) {
                console.error("Error al comprar item:", error);
            }
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                    <Star size={20} className="text-yellow-500 fill-current" />
                    <span className="text-2xl font-black text-yellow-500 tracking-tighter">{balance}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                    <ShoppingBag className="text-primary" size={32} />
                    Tienda de <span className="text-primary text-glow">Élite</span>
                </h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Equipamiento Legendario para la Academia</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {skins.map(skin => (
                    <motion.div
                        key={skin.id}
                        whileHover={{ scale: 1.02 }}
                        className="glass-card p-6 border-white/5 bg-white/[0.01] flex flex-col items-center text-center gap-4"
                    >
                        <div className={`w-32 h-32 rounded-3xl overflow-hidden bg-${skin.color}/10 border border-${skin.color}/20 flex items-center justify-center`}>
                            <img
                                src={skin.image}
                                alt={skin.name}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            />
                        </div>
                        <div>
                            <p className="font-bold text-lg mb-1">{skin.name}</p>
                            <p className="text-accent text-[9px] font-black uppercase tracking-widest mb-2">{skin.benefit}</p>
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
