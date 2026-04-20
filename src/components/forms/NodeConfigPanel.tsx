// ─── Neo-Brutalist Node Config Panel ────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { mockApi } from '../../api/mockApi';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedStepNodeData,
  EndNodeData,
  KeyValuePair,
  AutomationAction,
} from '../../types/workflow';

// ─── Neo-Brutalist form primitives ───────────────────────────────────────────

const Header = ({ label, suffix }: { label: string; suffix?: string }) => (
  <div className="flex items-center justify-between mb-2">
    <label className="text-[12px] font-black text-black uppercase tracking-widest leading-none">
      {label}
    </label>
    {suffix && <span className="text-[11px] font-black italic text-black/40">{suffix}</span>}
  </div>
);

const inputCls = `
  w-full border-[3px] border-black bg-white px-4 py-3 text-[15px] font-bold text-black outline-none 
  focus:bg-[#fcd34d]/10 focus:shadow-[4px_4px_0_0_#000] transition-all
`;

const selectCls = `
  w-full border-[3px] border-black bg-white px-3 py-3 text-[15px] font-bold text-black outline-none 
  appearance-none cursor-pointer hover:bg-[#f8fafc]
`;

const KVEditor = ({
  label,
  pairs,
  onChange,
}: {
  label: string;
  pairs: KeyValuePair[];
  onChange: (p: KeyValuePair[]) => void;
}) => {
  const add = () => onChange([...pairs, { key: '', value: '' }]);
  const remove = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));
  const update = (i: number, field: 'key' | 'value', val: string) => {
    const next = [...pairs];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div className="mb-8">
      <Header label={label} suffix={`${pairs.length}_ENTRIES`} />
      <div className="space-y-3">
        {pairs.map((p, i) => (
          <div key={i} className="flex gap-2 group animate-in slide-in-from-right-2">
            <input className={inputCls} placeholder="KEY" value={p.key} onChange={(e) => update(i, 'key', e.target.value.toUpperCase())} />
            <input className={inputCls} placeholder="VAL" value={p.value} onChange={(e) => update(i, 'value', e.target.value)} />
            <button onClick={() => remove(i)} className="bg-black text-white px-3 font-black hover:bg-red-500 transition-colors">✕</button>
          </div>
        ))}
        <button onClick={add} className="w-full py-2 border-[2px] border-black border-dashed font-black text-[10px] uppercase hover:bg-black hover:text-white transition-all">+ Add Parameter Entry</button>
      </div>
    </div>
  );
};

// ─── Sub-forms per node type ─────────────────────────────────────────────────

const StartForm = ({ data, update }: { data: StartNodeData; update: (d: Partial<StartNodeData>) => void }) => (
  <>
    <div className="mb-6">
      <Header label="System Header" />
      <input className={inputCls} value={data.startTitle} onChange={(e) => update({ startTitle: e.target.value, label: e.target.value })} />
    </div>
    <KVEditor label="Initialization Context" pairs={data.metadata || []} onChange={(m) => update({ metadata: m })} />
  </>
);

const TaskForm = ({ data, update }: { data: TaskNodeData; update: (d: Partial<TaskNodeData>) => void }) => (
  <>
    <div className="mb-6">
      <Header label="Task Label" suffix="REQUIRED_FIELD" />
      <input className={inputCls} value={data.title} onChange={(e) => update({ title: e.target.value, label: e.target.value })} placeholder="ENTER_LABEL..." />
    </div>
    <div className="mb-6">
      <Header label="Description" />
      <textarea className={inputCls + ' resize-none'} rows={3} value={data.description} onChange={(e) => update({ description: e.target.value })} />
    </div>
    <div className="mb-6">
      <Header label="Assigned Operator" />
      <input className={inputCls} value={data.assignee} onChange={(e) => update({ assignee: e.target.value })} placeholder="OPERATOR_TAG" />
    </div>
    <div className="mb-6">
      <Header label="System Due Date" />
      <input type="date" className={inputCls} value={data.dueDate} onChange={(e) => update({ dueDate: e.target.value })} />
    </div>
    <KVEditor label="Extended Payload" pairs={data.customFields || []} onChange={(c) => update({ customFields: c })} />
  </>
);

const ApprovalForm = ({ data, update }: { data: ApprovalNodeData; update: (d: Partial<ApprovalNodeData>) => void }) => (
  <>
    <div className="mb-6">
      <Header label="Review Label" />
      <input className={inputCls} value={data.title} onChange={(e) => update({ title: e.target.value, label: e.target.value })} />
    </div>
    <div className="mb-6">
      <Header label="Verification Authority" />
      <div className="relative">
        <select className={selectCls} value={data.approverRole} onChange={(e) => update({ approverRole: e.target.value as any })}>
          <option value="Manager">MANAGER_OPERATOR</option>
          <option value="HRBP">HR_COMPLIANCE</option>
          <option value="Director">EXECUTIVE_BOARD</option>
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-black text-xs">▼</div>
      </div>
    </div>
    <div className="mb-6">
      <Header label="Auto-Approve Count" />
      <input type="number" className={inputCls} value={data.autoApproveThreshold} onChange={(e) => update({ autoApproveThreshold: Number(e.target.value) })} />
    </div>
  </>
);

const AutomatedForm = ({ data, update }: { data: AutomatedStepNodeData; update: (d: Partial<AutomatedStepNodeData>) => void }) => {
  const [actions, setActions] = useState<AutomationAction[]>([]);

  useEffect(() => {
    mockApi.getAutomations().then(setActions);
  }, []);

  const selectedAction = actions.find((a) => a.id === data.action);

  return (
    <>
      <div className="mb-6">
        <Header label="Automation Key" />
        <input className={inputCls} value={data.title} onChange={(e) => update({ title: e.target.value, label: e.target.value })} />
      </div>
      <div className="mb-6">
        <Header label="System Action Registry" />
        <div className="relative">
          <select
            className={selectCls}
            value={data.action}
            onChange={(e) => {
              const actionId = e.target.value;
              const act = actions.find((a) => a.id === actionId);
              const params: Record<string, string> = {};
              act?.params.forEach((p) => (params[p] = ''));
              update({ action: actionId, actionParams: params });
            }}
          >
            <option value="">-- SELECT_ACTION_ID --</option>
            {actions.map((a) => (
              <option key={a.id} value={a.id}>{a.label.toUpperCase()}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-black text-xs">▼</div>
        </div>
      </div>
      {selectedAction &&
        selectedAction.params.map((param) => (
          <div key={param} className="mb-6 animate-in fade-in duration-500">
            <Header label={`Param: ${param}`} />
            <input
              className={inputCls}
              value={data.actionParams[param] || ''}
              onChange={(e) => update({ actionParams: { ...data.actionParams, [param]: e.target.value } })}
            />
          </div>
        ))}
    </>
  );
};

const EndForm = ({ data, update }: { data: EndNodeData; update: (d: Partial<EndNodeData>) => void }) => (
  <>
    <div className="mb-6">
      <Header label="Termination Status" />
      <input className={inputCls} value={data.endMessage} onChange={(e) => update({ endMessage: e.target.value, label: e.target.value })} />
    </div>
    <div className="mb-6">
      <Header label="Summary Persistence" />
      <button
        type="button"
        onClick={() => update({ summaryFlag: !data.summaryFlag })}
        className={`w-full h-12 border-[3px] border-black text-[11px] font-black uppercase transition-all ${data.summaryFlag ? 'bg-[#4ade80] shadow-[4px_4px_0_0_#000]' : 'bg-slate-100'}`}
      >
        {data.summaryFlag ? 'Persistence_Enabled_OK' : 'Persistence_Disabled'}
      </button>
    </div>
  </>
);

// ─── Main Panel ─────────────────────────────────────────────────────────────

export const NodeConfigPanel: React.FC = () => {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const onNodeSelect = useWorkflowStore((s) => s.onNodeSelect);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <aside className="w-80 bg-[#f8fafc] border-l-[4px] border-black flex flex-col items-center justify-center h-full p-8 text-center bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] opacity-40">
        <div className="w-20 h-20 border-[4px] border-black flex items-center justify-center text-4xl font-black mb-4">?</div>
        <p className="font-black uppercase tracking-widest text-xs">Selection_Required</p>
      </aside>
    );
  }

  const data = node.data as any;
  const update = (d: any) => updateNodeData(node.id, d);

  return (
    <aside className="w-96 bg-white border-l-[4px] border-black flex flex-col h-full z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="p-8 border-b-[4px] border-black bg-[#fcd34d] shadow-[0_4px_0_0_#000] z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-black leading-none uppercase italic">Component_Edit</h2>
            <p className="text-[10px] font-black text-black/50 mt-1 uppercase tracking-widest opacity-80">Reference ID: {node.id.split('-')[0]}</p>
          </div>
          <button onClick={() => onNodeSelect(null)} className="w-10 h-10 border-[3px] border-black bg-white flex items-center justify-center font-black hover:bg-black hover:text-white transition-all">✕</button>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 overflow-y-auto p-8 space-y-1">
         {/* Node Type Identifier */}
         <div className="mb-10 px-4 py-2 border-[4px] border-black bg-black text-white font-black text-xs uppercase italic tracking-[0.2em] shadow-[4px_4px_0_0_#fcd34d]">
           Type: {data.type}_unit
         </div>

        {data.type === 'start' && <StartForm data={data} update={update} />}
        {data.type === 'task' && <TaskForm data={data} update={update} />}
        {data.type === 'approval' && <ApprovalForm data={data} update={update} />}
        {data.type === 'automated' && <AutomatedForm data={data} update={update} />}
        {data.type === 'end' && <EndForm data={data} update={update} />}
      </div>

      {/* Action Footer */}
      <div className="p-8 border-t-[4px] border-black bg-[#f8fafc]">
        <button
          onClick={() => deleteNode(node.id)}
          className="w-full py-4 border-[4px] border-black bg-[#f87171] text-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          Destroy Component
        </button>
      </div>
    </aside>
  );
};
