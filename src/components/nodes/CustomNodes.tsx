import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

// ── Shared premium wrapper ───────────────────────────────────────────────────
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
      bg-white/90 backdrop-blur-sm rounded-2xl border transition-all duration-300 group
      ${selected 
        ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-[1.02]' 
        : 'border-slate-200/60 shadow-lg hover:shadow-xl hover:translate-y-[-2px] hover:border-slate-300'
      }
      overflow-hidden min-w-[240px] max-w-[280px]
    `}
  >
    {/* Accent Header Line */}
    <div className={`h-1.5 w-full ${color}`} />
    
    <div className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`
          w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center text-lg font-bold
          shadow-lg shadow-${color.replace('bg-', '')}/30 transition-transform group-hover:scale-110
        `}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 tracking-tight truncate">{title}</p>
          {subtitle && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest truncate">{subtitle}</p>}
        </div>
      </div>
      
      {children}
    </div>
  </div>
);

// ── Individual premium node types ──────────────────────────────────────────────

export const StartNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell color="bg-emerald-500" icon="▶" title={(data as any).startTitle || 'Trigger Start'} subtitle="Flow Entry Point" selected={selected}>
    <div className="flex flex-col gap-1 mt-2">
      <div className="h-1 w-full bg-emerald-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 w-1/3" />
      </div>
      <p className="text-[9px] text-slate-400 font-medium">Ready to initialize</p>
    </div>
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white !shadow-sm hover:!scale-150 transition-transform" />
  </NodeShell>
));

export const TaskNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell
    color="bg-blue-500"
    icon="📋"
    title={(data as any).title || 'User Task'}
    subtitle={(data as any).assignee ? `Assignee: ${(data as any).assignee}` : 'Unassigned'}
    selected={selected}
  >
    {(data as any).description && (
      <div className="bg-slate-50/80 p-2 rounded-lg mt-1 border border-slate-100 italic">
        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{(data as any).description}</p>
      </div>
    )}
    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
       <span className="text-[9px] font-bold text-slate-400 uppercase">Priority</span>
       <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">Medium</span>
    </div>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !shadow-sm" />
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !shadow-sm hover:!scale-150 transition-transform" />
  </NodeShell>
));

export const ApprovalNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell
    color="bg-amber-500"
    icon="✓"
    title={(data as any).title || 'Approval Step'}
    subtitle={`Role: ${(data as any).approverRole || 'Unset'}`}
    selected={selected}
  >
    <div className="flex items-center gap-2 mt-2">
       <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 w-2/3" />
       </div>
       <span className="text-[9px] font-bold text-amber-600">67%</span>
    </div>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !shadow-sm" />
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !shadow-sm hover:!scale-150 transition-transform" />
  </NodeShell>
));

export const AutomatedStepNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell
    color="bg-violet-500"
    icon="⚡"
    title={(data as any).title || 'Automation'}
    subtitle={(data as any).action ? `Act: ${(data as any).action}` : 'Configure Action'}
    selected={selected}
  >
    <div className="mt-2 flex gap-1">
      <div className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-500 text-[8px] font-bold uppercase tracking-tighter">WebHook</div>
      <div className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 text-[8px] font-bold uppercase tracking-tighter">JSON</div>
    </div>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white !shadow-sm" />
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white !shadow-sm hover:!scale-150 transition-transform" />
  </NodeShell>
));

export const EndNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell color="bg-rose-500" icon="⏹" title={(data as any).endMessage || 'End Process'} subtitle="Termination Point" selected={selected}>
    <div className="mt-2 flex items-center gap-1.5">
       <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
       <p className="text-[9px] text-slate-400 font-medium">Auto-closing active</p>
    </div>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white !shadow-sm" />
  </NodeShell>
));
