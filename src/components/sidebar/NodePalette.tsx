// ─── Neo-Brutalist Sidebar with Lucide Icons ─────────────────────────────────
import React from 'react';
import type { NodeType } from '../../types/workflow';
import { 
  Play, 
  ClipboardList, 
  UserCheck, 
  Zap, 
  Square,
  Cpu
} from 'lucide-react';

interface PaletteItem {
  type: NodeType;
  label: string;
  color: string;
  icon: React.ReactNode;
  desc: string;
}

const ITEMS: PaletteItem[] = [
  { 
    type: 'start', 
    label: 'START_FLOW', 
    color: 'bg-[#fcd34d]', 
    icon: <Play className="w-6 h-6 fill-current" strokeWidth={3} />, 
    desc: 'Start Node' 
  },
  { 
    type: 'task', 
    label: 'USER_TASK', 
    color: 'bg-[#60a5fa]', 
    icon: <ClipboardList className="w-6 h-6" strokeWidth={3} />, 
    desc: 'Task Node' 
  },
  { 
    type: 'approval', 
    label: 'APPROVE_OP', 
    color: 'bg-[#fb923c]', 
    icon: <UserCheck className="w-6 h-6" strokeWidth={3} />, 
    desc: 'Approval Node' 
  },
  { 
    type: 'automated', 
    label: 'SYS_AUTOMATE', 
    color: 'bg-[#a78bfa]', 
    icon: <Zap className="w-6 h-6 fill-current" strokeWidth={3} />, 
    desc: 'Automated Step Node' 
  },
  { 
    type: 'end', 
    label: 'TERMINAL', 
    color: 'bg-[#f87171]', 
    icon: <Square className="w-6 h-6 fill-current" strokeWidth={3} />, 
    desc: 'End Node' 
  },
];

export const NodePalette: React.FC = () => {
  const onDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-72 bg-[#fcd34d] border-r-[4px] border-black flex flex-col h-full z-10 box-border relative overflow-hidden">
      {/* Texture/Pattern background overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Header */}
      <div className="p-8 border-b-[4px] border-black bg-white shadow-[0_4px_0_0_#000]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 border-[3px] border-black bg-black flex items-center justify-center text-white shadow-[3px_3px_0_0_#4ade80]">
             <Cpu className="w-6 h-6" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tighter leading-none italic uppercase">Workflow</h1>
            <p className="text-[10px] font-black text-black bg-[#4ade80] px-1 inline-block mt-1">V2.4.0_STABLE</p>
          </div>
        </div>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {ITEMS.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className={`
              flex items-center gap-4 px-4 py-3 cursor-grab active:cursor-grabbing
              bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000]
              hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] 
              transition-all group relative
            `}
          >
            <span className={`w-12 h-12 border-[3px] border-black ${item.color} text-black flex items-center justify-center
                             shadow-[2px_2px_0_0_#000] group-hover:scale-110 transition-transform`}>
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black text-black uppercase tracking-tight">{item.label}</p>
              <p className="text-[9px] text-black/50 font-black tracking-widest uppercase">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend / Status */}
      <div className="p-6 border-t-[4px] border-black bg-black text-white">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] font-black uppercase tracking-widest">System Status</span>
           <div className="w-2 h-2 bg-[#4ade80] rounded-none shadow-[0_0_8px_#4ade80]" />
        </div>
        <p className="text-[9px] font-bold text-white/60 leading-tight">
          DRAG_COMPONENTS_TO_WORKSPACE.PDF_INTEGRATION_ACTIVE.
        </p>
      </div>
    </aside>
  );
};
