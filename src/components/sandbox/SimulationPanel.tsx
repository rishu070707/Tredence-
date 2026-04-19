// ─── Simulation / Sandbox Panel ──────────────────────────────────────────────
import React, { useState } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { mockApi } from '../../api/mockApi';
import type { SimulationStep } from '../../types/workflow';

export const SimulationPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const validationErrors = useWorkflowStore((s) => s.validationErrors);

  const run = async () => {
    setRunning(true);
    setSteps([]);
    setOpen(true);
    try {
      const result = await mockApi.simulateWorkflow({ nodes, edges });
      setSteps(result.steps);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const statusColor: Record<string, string> = {
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    error: 'bg-red-500/10 text-red-600 border-red-500/20',
    skipped: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  };

  return (
    <div className={`
      glass-panel border-t border-slate-200/50 shadow-[0_-20px_50px_rgba(0,0,0,0.08)]
      transition-all duration-500 ease-in-out relative rounded-t-[32px] overflow-hidden
      ${open ? 'h-[360px]' : 'h-16 hover:bg-white/50'}
    `}>
      {/* Glow Effect when open */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent transition-opacity duration-700 ${open ? 'opacity-100' : 'opacity-0'}`} />

      {/* Toggle bar */}
      <div
        className="h-16 px-8 flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${nodes.length > 0 ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] pt-0.5">Execution Engine</span>
          </div>
          
          <div className="flex items-center gap-3">
             {validationErrors.length > 0 && (
               <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold border border-red-100">
                 <span className="mb-0.5 whitespace-nowrap">{validationErrors.filter(v => v.severity === 'error').length} BLOCKING ISSUES</span>
               </div>
             )}
             <div className="h-4 w-px bg-slate-200" />
             <span className="text-[10px] font-bold text-slate-400">{nodes.length} Nodes Loaded</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={(e) => { e.stopPropagation(); run(); }}
            disabled={running || nodes.length === 0}
            className={`
              px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all
              ${running 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95'
              }
            `}
          >
            {running ? 'Processing...' : '▶ Start Simulation'}
          </button>
          <div className={`transition-transform duration-500 ${open ? 'rotate-180' : ''}`}>
             <span className="text-slate-300">▼</span>
          </div>
        </div>
      </div>

      {/* Results area */}
      {open && (
        <div className="flex h-[calc(100%-4rem)] overflow-hidden bg-white/30 backdrop-blur-md">
          {/* Execution log */}
          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            <div className="flex items-center justify-between mb-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Trace</h4>
               <button className="text-[9px] font-bold text-blue-500 hover:text-blue-700">CLEAR CONSOLE</button>
            </div>

            {/* Validation errors first */}
            {validationErrors.map((err, i) => (
              <div key={`v-${i}`} className={`
                flex items-center gap-4 px-5 py-3 rounded-2xl text-[11px] font-bold border animate-in slide-in-from-bottom-2
                ${err.severity === 'error' ? 'bg-red-50/50 text-red-600 border-red-100' : 'bg-amber-50/50 text-amber-600 border-amber-100'}
              `}>
                <div className={`w-5 h-5 rounded flex items-center justify-center ${err.severity === 'error' ? 'bg-red-100' : 'bg-amber-100'}`}>
                   {err.severity === 'error' ? '✕' : '⚠'}
                </div>
                <span>{err.message}</span>
              </div>
            ))}

            {/* Simulation steps */}
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-5 px-6 py-4 rounded-2xl bg-white/80 border border-slate-100/50 group hover:border-blue-200 transition-all animate-in slide-in-from-bottom-4 duration-500">
                <div className={`w-3 h-3 rounded-full ${step.status === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-400'}`} />
                <div className="flex-1">
                   <p className="text-xs font-bold text-slate-700">{step.label}</p>
                   <p className="text-[10px] text-slate-400 font-medium">{step.message}</p>
                </div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${statusColor[step.status]}`}>
                  {step.status}
                </span>
              </div>
            ))}

            {steps.length === 0 && validationErrors.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10 opacity-50">
                <div className="text-4xl mb-4">⚡</div>
                <p className="text-xs font-bold tracking-widest">Awaiting Command Input</p>
              </div>
            )}
          </div>

          {/* Detailed Summary */}
          <div className="w-64 p-8 border-l border-slate-200/50 bg-slate-50/30">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Metrics Summary</h4>
            <div className="space-y-8">
              <Stat label="Total Nodes" value={nodes.length} sub="Graph Density" />
              <Stat label="Connections" value={edges.length} sub="Path Complexity" />
              <Stat label="Critical Blockers" value={validationErrors.filter(e => e.severity === 'error').length} color="text-red-500" sub="Execution Stability" />
            </div>
            
            <div className="mt-12 p-4 rounded-2xl bg-white flex items-center gap-3 border border-slate-100 shadow-sm">
               <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-800 uppercase">Integrity Score</p>
                  <p className="text-sm font-black text-emerald-500">{Math.max(0, 100 - (validationErrors.length * 20))}%</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value, color = 'text-slate-800', sub }: { label: string; value: number; color?: string; sub: string }) => (
  <div className="group">
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p>
    <p className="text-[9px] text-slate-300 font-medium">{sub}</p>
  </div>
);
