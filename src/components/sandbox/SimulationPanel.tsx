// ─── Neo-Brutalist Simulation Panel ──────────────────────────────────────────
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
    success: 'bg-[#4ade80] text-black border-black',
    error: 'bg-[#f87171] text-black border-black',
    skipped: 'bg-white text-black border-black',
  };

  return (
    <div className={`
      bg-white border-t-[4px] border-black transition-all duration-300 ease-in-out relative
      ${open ? 'h-[360px]' : 'h-16'}
    `}>
      {/* Toggle bar */}
      <div
        className="h-16 px-8 flex items-center justify-between cursor-pointer border-b-[4px] border-black bg-white"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 border-[2px] border-black ${nodes.length > 0 ? 'bg-[#4ade80]' : 'bg-slate-300'}`} />
            <span className="text-sm font-black uppercase tracking-tighter">SIMULATOR_CORE_V1</span>
          </div>
          
          <div className="flex items-center gap-4">
             {validationErrors.length > 0 && (
               <div className="bg-[#f87171] text-black border-[3px] border-black px-3 py-0.5 text-[10px] font-black uppercase">
                 {validationErrors.filter(v => v.severity === 'error').length} BLOCKING_ERRORS
               </div>
             )}
             <div className="h-6 w-1 bg-black" />
             <span className="text-[10px] font-black text-black/40 italic">GRAPH_DENSITY: {nodes.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={(e) => { e.stopPropagation(); run(); }}
            disabled={running || nodes.length === 0}
            className={`
              px-8 py-2 text-xs font-black uppercase border-[3px] border-black shadow-[4px_4px_0_0_#000]
              active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all
              ${running 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-[#4ade80] text-black hover:bg-[#22c55e]'
              }
            `}
          >
            {running ? 'PROCESSING...' : 'RUN_VALIDATION_TRACE'}
          </button>
          <div className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
             <span className="text-xl font-black">{open ? '▼' : '▲'}</span>
          </div>
        </div>
      </div>

      {/* Results area */}
      {open && (
        <div className="flex h-[calc(100%-4rem)] overflow-hidden bg-white">
          {/* Execution log */}
          <div className="flex-1 overflow-y-auto p-8 space-y-4 border-r-[4px] border-black">
            <div className="flex items-center justify-between mb-6 pb-2 border-b-[2px] border-slate-100">
               <h4 className="text-xs font-black text-black uppercase italic underline decoration-4 decoration-[#fcd34d]">ACTIVE_TRACE_OUTPUT</h4>
            </div>

            {/* Validation errors first */}
            {validationErrors.map((err, i) => (
              <div key={`v-${i}`} className={`
                flex items-center gap-4 px-6 py-4 border-[3px] border-black 
                ${err.severity === 'error' ? 'bg-[#f87171]/10 text-black' : 'bg-[#fcd34d]/20 text-black'}
              `}>
                <div className={`w-6 h-6 border-[2px] border-black flex items-center justify-center font-black ${err.severity === 'error' ? 'bg-[#f87171]' : 'bg-[#fcd34d]'}`}>
                   {err.severity === 'error' ? '!' : '?'}
                </div>
                <span className="text-[11px] font-black uppercase tracking-tight">{err.message}</span>
              </div>
            ))}

            {/* Simulation steps */}
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-5 px-6 py-4 border-[3px] border-black bg-white shadow-[3px_3px_0_0_rgba(0,0,0,0.05)] hover:shadow-[5px_5px_0_0_rgba(0,0,0,0.1)] transition-all">
                <div className={`w-4 h-4 border-[2px] border-black ${step.status === 'success' ? 'bg-[#4ade80]' : 'bg-slate-300'}`} />
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-0.5">
                     <span className="text-[9px] font-black bg-black text-white px-1 tracking-tight">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                     <p className="text-[12px] font-black text-black uppercase tracking-tight">{step.label}</p>
                   </div>
                   <p className="text-[10px] text-black/50 font-bold italic">{step.message}</p>
                </div>
                <span className={`text-[9px] font-black px-4 py-1 border-[2px] border-black uppercase tracking-widest ${statusColor[step.status]}`}>
                  LOG_{step.status}
                </span>
              </div>
            ))}

            {steps.length === 0 && validationErrors.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-10">
                <div className="text-6xl mb-6 opacity-20">▦</div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300 italic">SYSTEM_AWAITING_TRIGGER</p>
              </div>
            )}
          </div>

          {/* Metrics Panel */}
          <div className="w-80 p-8 bg-[#f8fafc] overflow-y-auto">
            <h4 className="text-xs font-black text-black uppercase tracking-widest mb-10 pb-2 border-b-[4px] border-black">STATISTICAL_REPORT</h4>
            <div className="space-y-10">
              <Stat label="Total Graph Nodes" value={nodes.length} />
              <Stat label="Active Edges" value={edges.length} />
              <Stat label="Critical Violations" value={validationErrors.filter(e => e.severity === 'error').length} color="text-red-500" />
            </div>
            
            <div className="mt-12 p-6 border-[4px] border-black bg-white shadow-[6px_6px_0_0_#000]">
               <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 border-[3px] border-black bg-[#4ade80] flex items-center justify-center text-black">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-black uppercase leading-none mb-1">HEALTH_SCORE</p>
                    <p className="text-3xl font-black text-black tracking-tighter leading-none">{Math.max(0, 100 - (validationErrors.length * 20))}%</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value, color = 'text-black' }: { label: string; value: number; color?: string }) => (
  <div className="relative pl-6 border-l-[4px] border-black">
    <p className="text-[10px] text-black/50 font-black uppercase tracking-widest leading-none mb-2">{label}</p>
    <p className={`text-4xl font-black tracking-tighter leading-none ${color}`}>{value}</p>
  </div>
);
