/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Role } from '../types';
import { Shield, KeyRound, Check, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccessControlProps {
  users: User[];
  onLogin: (user: User) => void;
  onAddEmployee?: () => void;
}

export default function AccessControl({ users, onLogin }: AccessControlProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [showPinError, setShowPinError] = useState(false);
  const [showPinField, setShowPinField] = useState(false);
  const [revealPin, setRevealPin] = useState(false);

  // Separate users by active and filter out inactive
  const activeUsers = users.filter(u => u.status === 'Active');

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setPin('');
    setShowPinError(false);
    setShowPinField(true);
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser) return;

    if (pin === selectedUser.pinCode || selectedUser.pinCode === '') {
      onLogin(selectedUser);
    } else {
      setShowPinError(true);
      setPin('');
      setTimeout(() => setShowPinError(false), 2000);
    }
  };

  const handleAutoLogin = (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering manual selection
    onLogin(user);
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  // Extract initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div id="login_container" className="min-h-screen bg-[#070b19] flex items-center justify-center p-4 select-none relative overflow-hidden font-sans">
      {/* Background Ambience decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f172a]/95 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md relative z-10">
        
        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-[10px] tracking-[0.2em] text-cyan-400 font-mono uppercase mb-1 font-bold">
            <Shield className="w-3.5 h-3.5" />
            Control de Acceso
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            GastroGestión <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">OS</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-sans">
            Seleccione su cuenta de empleado para ingresar al sistema POS:
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!showPinField ? (
            <motion.div
              key="users-list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar"
            >
              {activeUsers.map((user) => (
                <div
                  key={user.id}
                  id={`user_card_${user.id}`}
                  onClick={() => handleUserSelect(user)}
                  className="group flex items-center justify-between p-3.5 bg-slate-900/60 hover:bg-slate-850/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl transition-all duration-200 cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.avatarColor || 'from-teal-500 to-cyan-500'} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-semibold tracking-wide group-hover:text-teal-300 transition-colors">
                        {user.name}
                      </h3>
                      <p className="text-slate-400 text-xs font-mono flex items-center gap-1 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'Admin' ? 'bg-amber-400' : user.role === 'Chef' ? 'bg-blue-400' : 'bg-cyan-400'}`}></span>
                        {user.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`autologin_btn_${user.id}`}
                      onClick={(e) => handleAutoLogin(user, e)}
                      className="text-[10px] bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-teal-500/20 font-mono font-bold tracking-wider transition-all duration-150 uppercase"
                    >
                      Autologin &rsaquo;
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="pin-entry"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Back Button */}
              <div className="flex items-center justify-between">
                <button
                  id="back_to_users_btn"
                  onClick={() => {
                    setShowPinField(false);
                    setSelectedUser(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  &larr; Volver a empleados
                </button>
                <span className="text-xs font-mono text-teal-400 font-bold bg-teal-400/10 px-2.5 py-0.5 rounded-full border border-teal-400/20">
                  {selectedUser?.role}
                </span>
              </div>

              {/* Selected User Header */}
              <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedUser?.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                  {selectedUser ? getInitials(selectedUser.name) : ''}
                </div>
                <div>
                  <h4 className="text-white text-xs font-mono">USUARIO SELECCIONADO</h4>
                  <p className="text-white font-semibold text-sm">{selectedUser?.name}</p>
                </div>
              </div>

              {/* PIN Code Inputs preview */}
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs text-slate-400 text-center font-mono">
                    INGRESE SU PIN DE ACCESO (Pista: {selectedUser?.pinCode || 'Vació/Autologin'})
                  </label>
                  <div className="relative">
                    <div className="flex justify-center gap-3">
                      {[0, 1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className={`w-12 h-14 rounded-xl border flex items-center justify-center text-lg font-bold transition-all duration-150 ${
                            showPinError
                              ? 'border-red-500/80 bg-red-900/10 text-red-400 animate-shake'
                              : pin.length > index
                              ? 'border-teal-500 bg-teal-500/5 text-teal-300'
                              : 'border-slate-800 bg-slate-900/40 text-slate-500'
                          }`}
                        >
                          {pin.length > index ? (revealPin ? pin[index] : '●') : ''}
                        </div>
                      ))}
                    </div>
                    {pin.length > 0 && (
                      <button
                        type="button"
                        id="toggle_reveal_pin"
                        onClick={() => setRevealPin(!revealPin)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {revealPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Keypad Layout */}
                <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumberClick(num)}
                      className="w-16 h-12 rounded-xl bg-slate-900 text-slate-200 text-sm font-semibold hover:bg-slate-800 active:scale-95 hover:text-white border border-slate-800/60 transition-all flex items-center justify-center mx-auto"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="w-16 h-12 rounded-xl bg-slate-950 text-slate-400 text-xs hover:bg-slate-850 active:scale-95 hover:text-red-400 border border-slate-800/40 transition-all flex items-center justify-center mx-auto font-mono"
                  >
                    DEL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumberClick('0')}
                    className="w-16 h-12 rounded-xl bg-slate-900 text-slate-200 text-sm font-semibold hover:bg-slate-800 active:scale-95 hover:text-white border border-slate-800/60 transition-all flex items-center justify-center mx-auto"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedUser) onLogin(selectedUser); // Allow bypass/confirm shortcut
                    }}
                    className="w-16 h-12 rounded-xl bg-teal-500/10 text-teal-400 text-xs hover:bg-teal-500 hover:text-white active:scale-95 border border-teal-500/30 transition-all flex items-center justify-center mx-auto font-bold uppercase tracking-wider"
                  >
                    BYPASS
                  </button>
                </div>

                {/* Status feedbacks */}
                {showPinError && (
                  <p className="text-red-400 text-center text-xs font-mono mt-1 font-bold">
                    ¡PIN incorrecto! Por favor, intente de nuevo.
                  </p>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    id="cancel_pin_btn"
                    onClick={() => {
                      setShowPinField(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-300 py-3 rounded-xl border border-slate-800 font-medium text-xs tracking-wider transition-colors uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    id="submit_pin_btn"
                    onClick={() => handlePinSubmit()}
                    disabled={pin.length < 4}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs tracking-wider transition-all uppercase flex items-center justify-center gap-1.5 ${
                      pin.length === 4
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 hover:brightness-110'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Enviar PIN
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info lock graphic */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center flex flex-col items-center">
          <p className="text-[10px] font-mono text-slate-500 tracking-wide flex items-center justify-center gap-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
            ERP Híbrido Autenticado Localmente
          </p>
          
          <button
            id="main_lock_badge"
            disabled={true}
            className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner relative group border-t-teal-500/20"
          >
            <div className="absolute inset-0.5 rounded-full bg-[#0a0f1d] z-0" />
            <div className="absolute inset-0 rounded-full border border-teal-500/10 group-hover:border-teal-500/30 animate-pulse duration-2000" />
            <Lock className="w-5 h-5 text-teal-400/80 relative z-10 animate-pulse" />
          </button>
        </div>

      </div>
    </div>
  );
}
