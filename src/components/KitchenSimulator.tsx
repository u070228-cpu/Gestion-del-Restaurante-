/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, Order } from '../types';
import { Utensils, Award, Flame, CheckCircle, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KitchenSimulatorProps {
  order: Order;
  chefs: User[];
  onCompleteCooking: (orderId: string, chefId: string, chefName: string) => void;
  onClose: () => void;
}

const PREPARATION_STEPS = [
  { progress: 0, text: 'Calentando fogones y preparando vajilla...' },
  { progress: 20, text: 'Asignando ingredientes y preparando cortes...' },
  { progress: 50, text: 'Cocinando al wok y sellando en parrilla caliente (80°C)...' },
  { progress: 85, text: 'Emplatando de forma gourmet y decorando con frescos...' },
  { progress: 100, text: 'Comda perfectamente lista y colocada en el mostrador.' }
];

export default function KitchenSimulator({ order, chefs, onCompleteCooking, onClose }: KitchenSimulatorProps) {
  const [selectedChef, setSelectedChef] = useState<User | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeStepText, setActiveStepText] = useState('');
  const [isCookingFinished, setIsCookingFinished] = useState(false);

  // Filter out chefs
  const activeChefs = chefs.filter(c => c.role === 'Chef' && c.status === 'Active');

  useEffect(() => {
    if (!selectedChef || progress >= 100) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          setIsCookingFinished(true);
          return 100;
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [selectedChef, progress]);

  // Sync step text with progress levels
  useEffect(() => {
    const step = [...PREPARATION_STEPS]
      .reverse()
      .find((s) => progress >= s.progress);
    if (step) {
      setActiveStepText(step.text);
    }
  }, [progress]);

  const handleSelectChef = (chef: User) => {
    setSelectedChef(chef);
    setProgress(0);
    setIsCookingFinished(false);
  };

  const handleInstantDispatch = () => {
    if (!selectedChef) {
      // Auto-assign random chef if none selected
      const defaultChef = activeChefs[0] || chefs[0];
      setSelectedChef(defaultChef);
    }
    setProgress(100);
    setIsCookingFinished(true);
  };

  const handleFinalize = () => {
    if (!selectedChef) return;
    onCompleteCooking(order.id, selectedChef.id, selectedChef.name);
  };

  return (
    <div id="kitchen_simulator_overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-55 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0e1726] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header bar */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-5 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Utensils className="w-5 h-5 animate-spin duration-3000" />
            </div>
            <div>
              <h2 className="text-white text-base font-bold font-sans">Cocina GastroGestión <span className="text-amber-400 text-xs font-mono font-medium">(Simulador)</span></h2>
              <p className="text-slate-400 text-xs font-mono">
                {order.tableId} • COMANDA {order.id.toUpperCase().replace('ORD-', '#')}
              </p>
            </div>
          </div>
          <button
            id="close_kitchen_modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold transición duration-150"
          >
            Cerrar
          </button>
        </div>

        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {!selectedChef ? (
              <motion.div
                key="step-select-chef"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-white font-bold text-md font-sans">Paso 1: Selecciona el Chef para Cocinar</h3>
                  <p className="text-slate-400 text-xs">
                    Selecciona uno de nuestros chefs expertos hoy activos para comenzar a cocinar esta comanda:
                  </p>
                </div>

                <div className="space-y-3">
                  {activeChefs.map((chef) => (
                    <div
                      key={chef.id}
                      id={`chef_card_${chef.id}`}
                      onClick={() => handleSelectChef(chef)}
                      className="group flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-500/50 border border-slate-800 rounded-2xl cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${chef.avatarColor} flex items-center justify-center text-white font-bold shadow-md relative`}>
                          <Award className="w-4 h-4 absolute -bottom-1 -right-1 text-amber-400 bg-slate-950 rounded-full p-0.5 border border-slate-850" />
                          {chef.name.split(' ').slice(1).map(n => n[0]).join('') || 'C'}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-sm group-hover:text-amber-300 transition-colors">{chef.name}</h4>
                          <span className="text-amber-400/80 text-[10px] uppercase tracking-wider font-mono font-bold">Chef De Cocina</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 font-semibold group-hover:text-amber-400 transition-colors flex items-center gap-1 font-mono">
                        Asignar &rarr;
                      </div>
                    </div>
                  ))}

                  {activeChefs.length === 0 && (
                    <div className="text-center p-6 text-slate-400 text-xs border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
                      No hay Chefs registrados y activos. Registra un Chef en el panel de Administración.
                    </div>
                  )}
                </div>

                <div className="pt-2 text-center">
                  <span className="text-slate-500 text-xs block mb-2">O salta la simulación de tiempos de cocina por completo:</span>
                  <button
                    id="instant_dispatch_landing"
                    onClick={handleInstantDispatch}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-115 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 uppercase tracking-wide transition-all"
                  >
                    <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                    Despachar Inmediatamente
                  </button>
                </div>
              </motion.div>
            ) : !isCookingFinished ? (
              <motion.div
                key="step-cooking-progress"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white text-xs font-bold font-mono">
                      🔥
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-mono block">ASIGNADO A:</span>
                      <p className="text-white text-sm font-bold">{selectedChef.name} 👨‍🍳</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-mono text-xl font-black">{progress}%</span>
                  </div>
                </div>

                {/* Progress Bar background and fill */}
                <div className="space-y-2">
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <motion.div
                      className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 h-full rounded-full"
                      style={{ width: `${progress}%` }}
                      layoutId="progress-fill"
                    />
                  </div>
                  <p className="text-xs text-amber-400/90 italic text-center animate-pulse py-1 min-h-[2.5rem]">
                    {activeStepText}
                  </p>
                </div>

                {/* Items cooking status box */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-3">Artículos a Cocinar:</h4>
                  <div className="space-y-2.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-medium">
                          <span className="font-bold text-amber-400 text-xs mr-1">{it.quantity}x</span> {it.name}
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-400/80 font-mono text-[10px] font-bold bg-amber-400/5 border border-amber-400/20 rounded-full px-2.5 py-0.5">
                          <Flame className="w-3 h-3 animate-bounce" /> Cocinando
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bypass button */}
                <button
                  id="instant_bypass_cooking"
                  onClick={handleInstantDispatch}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-2 uppercase tracking-wide transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Despachar inmediatamente ⚡
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step-cooking-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-6 py-4"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mx-auto relative">
                  <div className="absolute inset-2 rounded-full bg-emerald-500/10 animate-ping" />
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-white">¡Comanda Cocinada y Lista!</h3>
                  <p className="text-slate-400 text-xs px-6">
                    Los platillos de la <span className="text-white font-bold">{order.tableId}</span> han sido despachados exitosamente por el chef. ¡Todo excelente!
                  </p>
                </div>

                {/* Grid summary invoice style */}
                <div className="bg-slate-950/40 rounded-2xl border border-slate-850 p-4.5 max-w-sm mx-auto text-left space-y-3 font-sans">
                  <div className="flex justify-between text-xs pb-2 border-b border-slate-850">
                    <span className="text-slate-400">Mesero:</span>
                    <span className="text-white font-bold font-mono">{order.waiterName}</span>
                  </div>
                  <div className="flex justify-between text-xs pb-2 border-b border-slate-850">
                    <span className="text-slate-400">Cocinero:</span>
                    <span className="text-white font-bold text-emerald-400">{selectedChef?.name || 'Chef General'}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-slate-400 font-medium">Total comanda:</span>
                    <span className="text-white font-bold font-mono text-base">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="confirm_cooking_complete_btn"
                    onClick={handleFinalize}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 uppercase tracking-wide transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-100" />
                    Confirmar Entrega a Mesa & Regresar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
