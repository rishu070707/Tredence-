import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { 
  Play, 
  ClipboardList, 
  UserCheck, 
  Zap, 
  Square 
} from 'lucide-react';

// ── Shared Neo-Brutalist wrapper ─────────────────────────────────────────────
const NodeShell = ({
  children,
  color,
  icon,
  title,
  subtitle,
  selected,
}: {
  children?: React.ReactNode;
  color: string;
  icon: string | React.ReactNode;
  title: string;
  subtitle?: string;
  selected?: boolean;
}) => (
  <div
    className={`
      bg-white border-[3px] border-black transition-all duration-100
      ${selected 
        ? 'translate-x-[-4px] translate-y-[-4px] shadow-[8px_8px_0px_0px_#000000]' 
        : 'shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000]'
      }
      min-w-[240px] max-w-[280px] overflow-hidden
    `}
  >
    {/* Header Banner */}
    <div className={`px-4 py-2 border-b-[3px] border-black flex items-center gap-3 ${color}`}>
      <div className="text-xl font-black text-black">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-black uppercase tracking-widest text-black/60 leading-none mb-1">
          {subtitle || 'Node'}
        </p>
        <p className="text-sm font-black text-black uppercase truncate leading-none">
          {title}
        </p>
      </div>
    </div>
    
    <div className="p-4 bg-white">
      {children}
    </div>
  </div>
);

// ── Neo-Brutalist Node types ──────────────────────────────────────────────────

export const StartNode = memo(({ data, selected }: NodeProps) => (
  <>
    <NodeShell color="bg-[#fcd34d]" icon={<Play className="w-5 h-5 fill-current" />} title={(data as any).startTitle || 'INITIALIZE'} subtitle="Start Node" selected={selected}>
      <div className="p-2 border-2 border-black bg-slate-50 font-mono text-[9px] font-bold">
        SYSTEM.INIT_OK
      </div>
    </NodeShell>
    <Handle type="source" position={Position.Bottom} className="!bg-black !rounded-none !w-3 !h-3 !border-0" />
  </>
));

export const TaskNode = memo(({ data, selected }: NodeProps) => (
  <>
    <NodeShell
      color="bg-[#60a5fa]"
      icon={<ClipboardList className="w-5 h-5" />}
      title={(data as any).title || 'UI_TASK'}
      subtitle="Task Node"
      selected={selected}
    >
      {(data as any).description && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-black/70 leading-tight">{(data as any).description}</p>
        </div>
      )}
      <div className="flex justify-between items-center py-1 px-2 border-2 border-black bg-[#60a5fa]/10">
         <span className="text-[8px] font-black uppercase">Priority</span>
         <span className="text-[8px] font-black uppercase bg-black text-white px-1">HIGH</span>
      </div>
    </NodeShell>
    <Handle type="target" position={Position.Top} className="!bg-black !rounded-none !w-3 !h-3 !border-0" />
    <Handle type="source" position={Position.Bottom} className="!bg-black !rounded-none !w-3 !h-3 !border-0" />
  </>
));

export const ApprovalNode = memo(({ data, selected }: NodeProps) => (
  <>
    <NodeShell
      color="bg-[#fb923c]"
      icon={<UserCheck className="w-5 h-5" />}
      title={(data as any).title || 'VERIFY'}
      subtitle="Approval Node"
      selected={selected}
    >
      <div className="h-6 w-full border-2 border-black relative bg-[#fb923c]/20">
         <div className="h-full bg-[#fb923c] w-2/3 border-r-2 border-black" />
         <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black tracking-tighter">PROGRESS: 66%</span>
      </div>
    </NodeShell>
    <Handle type="target" position={Position.Top} className="!bg-black !rounded-none !w-3 !h-3 !border-0" />
    <Handle type="source" position={Position.Bottom} className="!bg-black !rounded-none !w-3 !h-3 !border-0" />
  </>
));

export const AutomatedStepNode = memo(({ data, selected }: NodeProps) => (
  <>
    <NodeShell
      color="bg-[#a78bfa]"
      icon={<Zap className="w-5 h-5 fill-current" />}
      title={(data as any).title || 'AUTOMATE'}
      subtitle="Automated Step Node"
      selected={selected}
    >
      <div className="flex flex-wrap gap-1">
        <div className="px-2 py-0.5 border-2 border-black bg-white text-[8px] font-black uppercase italic tracking-tighter">JSON_RPC</div>
        <div className="px-2 py-0.5 border-2 border-black bg-black text-white text-[8px] font-black uppercase tracking-tighter">CLOUD_RUN</div>
      </div>
    </NodeShell>
    <Handle type="target" position={Position.Top} className="!bg-black !rounded-none !w-3 !h-3 !border-0" />
    <Handle type="source" position={Position.Bottom} className="!bg-black !rounded-none !w-3 !h-3 !border-0" />
  </>
));

export const EndNode = memo(({ data, selected }: NodeProps) => (
  <>
    <NodeShell color="bg-[#f87171]" icon={<Square className="w-5 h-5 fill-current" />} title={(data as any).endMessage || 'TERMINATE'} subtitle="End Node" selected={selected}>
      <div className="p-2 border-2 border-black bg-rose-50 flex items-center gap-2">
         <div className="w-2 h-2 bg-rose-500 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" />
         <p className="text-[9px] font-black text-black">PROCESS_TERMINATION_ACTIVE</p>
      </div>
    </NodeShell>
    <Handle type="target" position={Position.Top} className="!bg-black !rounded-none !w-3 !h-3 !border-0" />
  </>
));
