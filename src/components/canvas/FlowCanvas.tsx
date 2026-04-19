// ─── Flow Canvas ─────────────────────────────────────────────────────────────
// Core workspace: drag-and-drop, connections, auto-layout, undo/redo toolbar.

import React, { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Panel,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../store/workflowStore';
import {
  StartNode,
  TaskNode,
  ApprovalNode,
  AutomatedStepNode,
  EndNode,
} from '../nodes/CustomNodes';
import type { NodeType, AppNode } from '../../types/workflow';
import dagre from 'dagre';

// Register custom node types
const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedStepNode,
  end: EndNode,
};

// ── Default data per node type ────────────────────────────────────────────────
function defaultDataForType(type: NodeType): any {
  switch (type) {
    case 'start':
      return { type: 'start', label: 'Start', startTitle: 'Workflow Start', metadata: [] };
    case 'task':
      return { type: 'task', label: 'New Task', title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] };
    case 'approval':
      return { type: 'approval', label: 'Approval', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 };
    case 'automated':
      return { type: 'automated', label: 'Automation', title: 'Automated Step', action: '', actionParams: {} };
    case 'end':
      return { type: 'end', label: 'End', endMessage: 'Workflow Complete', summaryFlag: true };
  }
}

// ── Auto-layout with dagre ────────────────────────────────────────────────────
function applyLayout(nodes: AppNode[], edges: any[], direction = 'TB') {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100 });
  nodes.forEach((n) => g.setNode(n.id, { width: 260, height: 100 }));
  edges.forEach((e: any) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((n) => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - 130, y: pos.y - 50 } };
  });
}

// ── Inner component (needs ReactFlowProvider above it) ────────────────────────
const CanvasInner: React.FC = () => {
  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addNode, onNodeSelect,
    setNodes, setEdges,
    undo, redo, clearWorkflow, saveToHistory,
  } = useWorkflowStore();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const node: AppNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: defaultDataForType(type),
      };
      addNode(node);
    },
    [addNode, screenToFlowPosition],
  );

  const handleLayout = useCallback(() => {
    saveToHistory();
    const laid = applyLayout([...nodes], [...edges]);
    setNodes(laid);
  }, [nodes, edges, saveToHistory, setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onNodeClick={(_, node) => onNodeSelect(node.id)}
      onPaneClick={() => onNodeSelect(null)}
      nodeTypes={nodeTypes}
      deleteKeyCode={['Backspace', 'Delete']}
      fitView
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
      <Controls />
      <MiniMap zoomable pannable nodeStrokeWidth={3} />

      {/* Toolbar */}
      <Panel position="top-right" className="flex gap-1.5">
        <ToolBtn onClick={undo} label="Undo" />
        <ToolBtn onClick={redo} label="Redo" />
        <ToolBtn onClick={handleLayout} label="Auto-layout" />
        <ToolBtn onClick={clearWorkflow} label="Clear" danger />
      </Panel>
    </ReactFlow>
  );
};

const ToolBtn = ({ onClick, label, danger }: { onClick: () => void; label: string; danger?: boolean }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border shadow-sm transition-colors
      ${danger
        ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      }`}
  >
    {label}
  </button>
);

// ── Exported wrapper ──────────────────────────────────────────────────────────
export const FlowCanvas: React.FC = () => (
  <ReactFlowProvider>
    <CanvasInner />
  </ReactFlowProvider>
);
