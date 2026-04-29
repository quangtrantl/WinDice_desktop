/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Minus, 
  Square, 
  Dices, 
  Monitor, 
  Folder, 
  Settings, 
  Trash2, 
  Search, 
  LayoutGrid,
  Volume2,
  Wifi,
  Battery,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';

// --- Types ---

type WindowState = {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
};

// --- Components ---

const Dice = ({ value, rolling }: { value: number; rolling: boolean }) => {
  const dots = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  return (
    <motion.div
      animate={rolling ? {
        rotateX: [0, 90, 180, 270, 360],
        rotateY: [0, 90, 180, 270, 360],
        scale: [1, 1.1, 1],
      } : { rotateX: 0, rotateY: 0, scale: 1 }}
      transition={rolling ? { duration: 0.5, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
      className="w-20 h-20 bg-white rounded-xl shadow-lg border-2 border-gray-200 flex items-center justify-center relative overflow-hidden"
    >
      <div className="grid grid-cols-3 grid-rows-3 gap-2 w-14 h-14">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {dots[value as keyof typeof dots].includes(i) && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 bg-slate-800 rounded-full shadow-inner" 
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function App() {
  const [diceValues, setDiceValues] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [leverage, setLeverage] = useState(1);
  const [betType, setBetType] = useState<'over' | 'under' | 'seven'>('over');
  const [lastResult, setLastResult] = useState<{ amount: number; won: boolean } | null>(null);
  const [gameWindow, setGameWindow] = useState<WindowState>({
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
  });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const rollDice = () => {
    if (isRolling || balance < betAmount) return;
    setIsRolling(true);
    setLastResult(null);
    
    const rollInterval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;
      setDiceValues([d1, d2]);
      setIsRolling(false);

      let won = false;
      let multiplier = 1;

      if (betType === 'over' && total > 7) {
        won = true;
        multiplier = 1;
      } else if (betType === 'under' && total < 7) {
        won = true;
        multiplier = 1;
      } else if (betType === 'seven' && total === 7) {
        won = true;
        multiplier = 4;
      }

      const change = won 
        ? (betAmount * multiplier * leverage) 
        : -(betAmount * leverage);
      
      setBalance(prev => Math.max(0, prev + change));
      setLastResult({ amount: Math.abs(change), won });

      if (won) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 1000);
  };

  const toggleWindow = () => {
    setGameWindow(prev => ({ ...prev, isOpen: !prev.isOpen, isMinimized: false }));
  };

  const minimizeWindow = () => {
    setGameWindow(prev => ({ ...prev, isMinimized: true }));
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0078D4] relative font-sans select-none">
      {/* Desktop Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-40"
        style={{ backgroundImage: 'url(https://picsum.photos/id/10/1920/1080)' }}
      />

      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 grid grid-flow-col grid-rows-6 gap-4 z-10">
        <DesktopIcon icon={<Monitor className="text-white w-8 h-8" />} label="This PC" />
        <DesktopIcon icon={<Folder className="text-yellow-400 w-8 h-8" />} label="Documents" />
        <DesktopIcon 
          icon={<Dices className="text-indigo-400 w-8 h-8" />} 
          label="Dice Game" 
          onClick={toggleWindow}
        />
        <DesktopIcon icon={<Trash2 className="text-slate-200 w-8 h-8" />} label="Recycle Bin" />
      </div>

      {/* Game Window */}
      <AnimatePresence>
        {gameWindow.isOpen && !gameWindow.isMinimized && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={cn(
              "absolute z-20 bg-slate-50 shadow-2xl rounded-lg overflow-hidden border border-slate-300 flex flex-col",
              gameWindow.isMaximized ? "inset-0 rounded-none" : "top-10 left-1/2 -translate-x-1/2 w-[600px] h-[550px]"
            )}
          >
            {/* Window Title Bar */}
            <div className="h-10 bg-white border-bottom border-slate-200 flex items-center justify-between px-3 shrink-0">
              <div className="flex items-center gap-2">
                <Dices className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-medium text-slate-700">Dice Trader Pro v2.0</span>
              </div>
              <div className="flex items-center h-full">
                <button 
                  onClick={minimizeWindow}
                  className="h-full px-4 hover:bg-slate-100 transition-colors flex items-center justify-center"
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <button 
                  onClick={() => setGameWindow(p => ({ ...p, isMaximized: !p.isMaximized }))}
                  className="h-full px-4 hover:bg-slate-100 transition-colors flex items-center justify-center"
                >
                  <Square className="w-3 h-3 text-slate-600" />
                </button>
                <button 
                  onClick={toggleWindow}
                  className="h-full px-4 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div className="flex-1 flex flex-col p-6 gap-6 bg-gradient-to-b from-slate-50 to-slate-100 overflow-y-auto">
              {/* Stats Header */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Available Balance</div>
                  <div className="text-2xl font-black text-slate-900">${balance.toLocaleString()}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Current Risk</div>
                  <div className="text-lg font-bold text-orange-600">${(betAmount * leverage).toLocaleString()}</div>
                </div>
              </div>

              {/* Dice Display */}
              <div className="flex flex-col items-center justify-center py-4 bg-slate-900/5 rounded-2xl border border-slate-200/50">
                <div className="flex gap-6 mb-4">
                  <Dice value={diceValues[0]} rolling={isRolling} />
                  <Dice value={diceValues[1]} rolling={isRolling} />
                </div>
                <div className="text-slate-400 text-xs font-mono">SUM: {diceValues[0] + diceValues[1]}</div>
              </div>

              {/* Betting Controls */}
              <div className="grid grid-cols-1 gap-6">
                {/* Bet Type Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Select Prediction</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'under', label: 'Under 7', sub: '2x Payout' },
                      { id: 'seven', label: 'Exactly 7', sub: '5x Payout' },
                      { id: 'over', label: 'Over 7', sub: '2x Payout' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setBetType(type.id as any)}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all flex flex-col items-center",
                          betType === type.id 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                        )}
                      >
                        <span className="font-bold text-sm">{type.label}</span>
                        <span className={cn("text-[9px] opacity-70", betType === type.id ? "text-white" : "text-slate-400")}>{type.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount & Leverage */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Bet Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input 
                        type="number" 
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-7 pr-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Leverage</label>
                    <select 
                      value={leverage}
                      onChange={(e) => setLeverage(parseInt(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={1}>1x (Safe)</option>
                      <option value={2}>2x</option>
                      <option value={5}>5x</option>
                      <option value={10}>10x (Degenerate)</option>
                      <option value={50}>50x (YOLO)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={rollDice}
                  disabled={isRolling || balance < betAmount}
                  className={cn(
                    "w-full py-4 rounded-xl font-black text-xl shadow-xl transition-all uppercase tracking-widest",
                    isRolling 
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                      : balance < betAmount
                        ? "bg-red-100 text-red-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                  )}
                >
                  {isRolling ? "Rolling Market..." : balance < betAmount ? "Insufficient Funds" : "Execute Trade"}
                </motion.button>

                {/* Result Overlay */}
                <AnimatePresence>
                  {lastResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: -60, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 px-6 py-2 rounded-full font-black text-lg shadow-2xl pointer-events-none whitespace-nowrap",
                        lastResult.won ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                      )}
                    >
                      {lastResult.won ? `+ $${lastResult.amount.toLocaleString()}` : `- $${lastResult.amount.toLocaleString()}`}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Window Status Bar */}
            <div className="h-6 bg-slate-100 border-t border-slate-200 px-3 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
              <span>Market Status: Open</span>
              <span className="font-mono">LIQ PRICE: $0.00</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/80 backdrop-blur-md border-t border-white/20 z-50 flex items-center justify-between px-1">
        <div className="flex items-center h-full">
          {/* Start Button */}
          <button className="h-10 w-10 flex items-center justify-center hover:bg-white/50 rounded transition-colors group">
            <LayoutGrid className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
          </button>

          {/* Search Bar */}
          <div className="relative ml-1 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-white/50 border border-slate-200 rounded-full py-1.5 pl-9 pr-4 text-sm w-48 focus:outline-none focus:bg-white transition-all"
            />
          </div>

          <div className="h-8 w-[1px] bg-slate-300 mx-2" />

          {/* Taskbar Apps */}
          <div className="flex items-center gap-1">
            <TaskbarIcon icon={<Folder className="text-yellow-500 w-5 h-5" />} />
            <TaskbarIcon 
              icon={<Dices className="text-indigo-600 w-5 h-5" />} 
              active={gameWindow.isOpen} 
              onClick={() => setGameWindow(p => ({ ...p, isMinimized: !p.isMinimized }))}
            />
            <TaskbarIcon icon={<Settings className="text-slate-600 w-5 h-5" />} />
          </div>
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-3 px-3 h-full">
          <div className="flex items-center gap-2 text-slate-700">
            <Volume2 className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-4 h-4" />
          </div>
          <div className="flex flex-col items-end text-[11px] font-medium text-slate-700">
            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{time.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          </div>
          <div className="w-1 h-full border-l border-slate-300 ml-1" />
        </div>
      </div>
    </div>
  );
}

function DesktopIcon({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 w-20 hover:bg-white/10 rounded transition-colors group"
    >
      <div className="group-hover:scale-105 transition-transform drop-shadow-md">
        {icon}
      </div>
      <span className="text-[11px] text-white font-medium text-center leading-tight drop-shadow-md">
        {label}
      </span>
    </button>
  );
}

function TaskbarIcon({ icon, active, onClick }: { icon: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "h-10 w-10 flex items-center justify-center rounded transition-all relative group",
        active ? "bg-white/60 shadow-sm" : "hover:bg-white/40"
      )}
    >
      <div className="group-hover:scale-110 transition-transform">
        {icon}
      </div>
      {active && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-blue-600 rounded-full" />
      )}
    </button>
  );
}
