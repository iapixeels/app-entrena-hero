import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Heart, Zap, Shield } from 'lucide-react';

const Skill = ({ name, level, max, icon: Icon, color }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center text-${color}`}>
                    <Icon size={20} />
                </div>
                <span className="font-bold text-sm uppercase tracking-widest">{name}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">NVL {level} / {max}</span>
        </div>

        <div className="flex gap-1.5">
            {[...Array(max)].map((_, i) => (
                <div
                    key={i}
                    className={`h-2 flex-1 rounded-full border border-white/5 transition-all duration-1000 ${i < level ? `bg-${color} shadow-[0_0_10px_rgba(0,127,255,0.4)]` : 'bg-white/5'
                        }`}
                />
            ))}
        </div>
    </div>
);

const SkillsTree = () => {
    return (
        <div className="glass p-10 rounded-[2.5rem] border-white/5 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Árbol de <span className="text-accent text-glow">Habilidades</span></h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Sincronización de ADN Heroico</p>
                </div>
                <div className="flex items-center gap-2 text-accent">
                    <Brain size={20} />
                    <span className="text-sm font-bold animate-pulse">Analizando Progreso...</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <Skill name="Fuerza Bruta" level={3} max={10} icon={Heart} color="primary" />
                <Skill name="Velocidad Turbo" level={5} max={10} icon={Zap} color="secondary" />
                <Skill name="Resistencia Elite" level={2} max={10} icon={Shield} color="accent" />
                <Skill name="Concentración" level={7} max={10} icon={Brain} color="yellow-500" />
            </div>
        </div>
    );
};

export default SkillsTree;
