// ─── Node Configuration Panel ────────────────────────────────────────────────
// Dynamic form that renders different fields depending on the selected node type.
// Each sub-form is its own component — easy to extend for new node types.

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

// ─── Reusable form primitives ────────────────────────────────────────────────

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
    {children}
  </div>
);

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors';

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
    <Field label={label}>
      <div className="space-y-2">
        {pairs.map((p, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputCls} placeholder="Key" value={p.key} onChange={(e) => update(i, 'key', e.target.value)} />
            <input className={inputCls} placeholder="Value" value={p.value} onChange={(e) => update(i, 'value', e.target.value)} />
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 text-sm font-bold px-1">✕</button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium">+ Add field</button>
    </Field>
  );
};

// ─── Sub-forms per node type ─────────────────────────────────────────────────

const StartForm = ({ data, update }: { data: StartNodeData; update: (d: Partial<StartNodeData>) => void }) => (
  <>
    <Field label="Start Title">
      <input className={inputCls} value={data.startTitle} onChange={(e) => update({ startTitle: e.target.value, label: e.target.value })} />
    </Field>
    <KVEditor label="Metadata (optional)" pairs={data.metadata || []} onChange={(m) => update({ metadata: m })} />
  </>
);

const TaskForm = ({ data, update }: { data: TaskNodeData; update: (d: Partial<TaskNodeData>) => void }) => (
  <>
    <Field label="Title *">
      <input className={inputCls} value={data.title} onChange={(e) => update({ title: e.target.value, label: e.target.value })} placeholder="Required" />
    </Field>
    <Field label="Description">
      <textarea className={inputCls + ' resize-none'} rows={3} value={data.description} onChange={(e) => update({ description: e.target.value })} />
    </Field>
    <Field label="Assignee">
      <input className={inputCls} value={data.assignee} onChange={(e) => update({ assignee: e.target.value })} />
    </Field>
    <Field label="Due Date">
      <input type="date" className={inputCls} value={data.dueDate} onChange={(e) => update({ dueDate: e.target.value })} />
    </Field>
    <KVEditor label="Custom Fields (optional)" pairs={data.customFields || []} onChange={(c) => update({ customFields: c })} />
  </>
);

const ApprovalForm = ({ data, update }: { data: ApprovalNodeData; update: (d: Partial<ApprovalNodeData>) => void }) => (
  <>
    <Field label="Title">
      <input className={inputCls} value={data.title} onChange={(e) => update({ title: e.target.value, label: e.target.value })} />
    </Field>
    <Field label="Approver Role">
      <select className={inputCls} value={data.approverRole} onChange={(e) => update({ approverRole: e.target.value as any })}>
        <option value="Manager">Manager</option>
        <option value="HRBP">HRBP</option>
        <option value="Director">Director</option>
      </select>
    </Field>
    <Field label="Auto-Approve Threshold">
      <input type="number" className={inputCls} value={data.autoApproveThreshold} onChange={(e) => update({ autoApproveThreshold: Number(e.target.value) })} />
    </Field>
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
      <Field label="Title">
        <input className={inputCls} value={data.title} onChange={(e) => update({ title: e.target.value, label: e.target.value })} />
      </Field>
      <Field label="Action (from API)">
        <select
          className={inputCls}
          value={data.action}
          onChange={(e) => {
            const actionId = e.target.value;
            const act = actions.find((a) => a.id === actionId);
            const params: Record<string, string> = {};
            act?.params.forEach((p) => (params[p] = ''));
            update({ action: actionId, actionParams: params });
          }}
        >
          <option value="">— Select action —</option>
          {actions.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </Field>
      {selectedAction &&
        selectedAction.params.map((param) => (
          <Field key={param} label={param.charAt(0).toUpperCase() + param.slice(1)}>
            <input
              className={inputCls}
              value={data.actionParams[param] || ''}
              onChange={(e) => update({ actionParams: { ...data.actionParams, [param]: e.target.value } })}
            />
          </Field>
        ))}
    </>
  );
};

const EndForm = ({ data, update }: { data: EndNodeData; update: (d: Partial<EndNodeData>) => void }) => (
  <>
    <Field label="End Message">
      <input className={inputCls} value={data.endMessage} onChange={(e) => update({ endMessage: e.target.value, label: e.target.value })} />
    </Field>
    <Field label="Include Summary">
      <button
        type="button"
        onClick={() => update({ summaryFlag: !data.summaryFlag })}
        className={`relative w-11 h-6 rounded-full transition-colors ${data.summaryFlag ? 'bg-blue-500' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.summaryFlag ? 'translate-x-5' : ''}`} />
      </button>
    </Field>
  </>
);

// ─── Main panel ──────────────────────────────────────────────────────────────

export const NodeConfigPanel: React.FC = () => {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const onNodeSelect = useWorkflowStore((s) => s.onNodeSelect);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <aside className="w-72 bg-white border-l border-slate-200 flex items-center justify-center h-full">
        <p className="text-sm text-slate-400 text-center px-6">
          Select a node on the canvas to edit its properties.
        </p>
      </aside>
    );
  }

  const data = node.data as any;
  const update = (d: any) => updateNodeData(node.id, d);

  return (
    <aside className="w-72 bg-white border-l border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Edit Node</h2>
          <p className="text-[11px] text-slate-400 capitalize">{data.type} node</p>
        </div>
        <button onClick={() => onNodeSelect(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {data.type === 'start' && <StartForm data={data} update={update} />}
        {data.type === 'task' && <TaskForm data={data} update={update} />}
        {data.type === 'approval' && <ApprovalForm data={data} update={update} />}
        {data.type === 'automated' && <AutomatedForm data={data} update={update} />}
        {data.type === 'end' && <EndForm data={data} update={update} />}
      </div>

      {/* Delete */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => deleteNode(node.id)}
          className="w-full py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          Delete Node
        </button>
      </div>
    </aside>
  );
};
