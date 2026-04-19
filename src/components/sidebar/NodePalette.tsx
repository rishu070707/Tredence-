// ─── Node Palette (Sidebar) ──────────────────────────────────────────────────
import React from 'react';
import type { NodeType } from '../../types/workflow';

interface PaletteItem {
  type: NodeType;
  label: string;
  color: string;
  icon: string;
  desc: string;
}

const ITEMS: PaletteItem[] = [
  { type: 'start', label: 'Start', color: 'bg-emerald-500', icon: '▶', desc: 'Flow entry point' },
  { type: 'task', label: 'Task', color: 'bg-blue-500', icon: '📋', desc: 'Human action needed' },
  { type: 'approval', label: 'Approval', color: 'bg-amber-500', icon: '✓', desc: 'Manager review' },
  { type: 'automated', label: 'Automation', color: 'bg-violet-500', icon: '⚡', desc: 'System trigger' },
  { type: 'end', label: 'End', color: 'bg-rose-500', icon: '⏹', desc: 'Flow completion' },
];

export const NodePalette: React.FC = () => {
  const onDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-72 glass-panel border-r border-slate-200 flex flex-col h-full z-10 shadow-2xl relative">
      {/* Header */}
      <div className="p-7">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
             <span className="font-black text-xs italic">T</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter">Workflow<span className="text-blue-600">Pro</span></h1>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-11">Automation Studio</p>
      </div>

      <div className="px-5 mb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent w-full" />
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {ITEMS.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-grab active:cursor-grabbing
                       bg-white/50 border border-slate-100 hover:border-blue-400/50 hover:bg-white
                       hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group relative overflow-hidden"
          >
            {/* Visual background hint */}
            <div className={`absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full ${item.color} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
            
            <span className={`w-10 h-10 rounded-xl ${item.color} text-white flex items-center justify-center text-sm font-bold
                             shadow-lg shadow-${item.color.replace('bg-', '')}/30 group-hover:scale-110 transition-transform`}>
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.label}</p>
              <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
            </div>
            
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300">⋮</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tip Section */}
      <div className="p-6 m-4 mt-auto rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
           {/* Decorative icon background */}
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
        </div>
        <p className="text-xs font-bold mb-1 relative z-10">Pro Tip</p>
        <p className="text-[10px] opacity-80 leading-relaxed font-medium relative z-10">
          Drag handles to connect nodes. Double-click an edge to remove it.
        </p>
      </div>
    </aside>
  );
};
