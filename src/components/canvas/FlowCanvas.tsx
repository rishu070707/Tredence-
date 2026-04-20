// ─── Neo-Brutalist Flow Canvas ───────────────────────────────────────────────
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
      return { type: 'start', label: 'START', startTitle: 'INITIALIZE_FLOW', metadata: [] };
    case 'task':
      return { type: 'task', label: 'NEW_TASK', title: 'OPERATOR_STEP', description: '', assignee: '', dueDate: '', customFields: [] };
    case 'approval':
      return { type: 'approval', label: 'VERIFY', title: 'QUALITY_GATE', approverRole: 'Manager', autoApproveThreshold: 0 };
    case 'automated':
      return { type: 'automated', label: 'AUTOMATE', title: 'SYSTEM_CALL', action: '', actionParams: {} };
    case 'end':
      return { type: 'end', label: 'TERMINATED', endMessage: 'SEQUENCE_COMPLETE', summaryFlag: true };
  }
}

function applyLayout(nodes: AppNode[], edges: any[], direction = 'TB') {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 100, ranksep: 120 });
  nodes.forEach((n) => g.setNode(n.id, { width: 260, height: 120 }));
  edges.forEach((e: any) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((n) => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - 130, y: pos.y - 60 } };
  });
}

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
      minZoom={0.2}
      maxZoom={1.5}
    >
      <Background variant={BackgroundVariant.Lines} gap={40} size={1} color="rgba(0,0,0,0.05)" />
      <Controls showInteractive={false} position="top-left" />
      <MiniMap pannable zoomable />

      {/* Brutal Toolbar */}
      <Panel position="top-right" className="flex gap-2 p-2">
        <ToolBtn onClick={undo} label="UNDO" />
        <ToolBtn onClick={redo} label="REDO" />
        <ToolBtn onClick={handleLayout} label="AUTO_LAYOUT" />
        <ToolBtn onClick={clearWorkflow} label="PURGE" danger />
      </Panel>
    </ReactFlow>
  );
};

const ToolBtn = ({ onClick, label, danger }: { onClick: () => void; label: string; danger?: boolean }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-[11px] font-black uppercase border-[3px] border-black shadow-[4px_4px_0_0_#000]
      active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all
      ${danger
        ? 'bg-[#f87171] text-black hover:bg-red-500'
        : 'bg-white text-black hover:bg-[#fcd34d]'
      }`}
  >
    {label}
  </button>
);

export const FlowCanvas: React.FC = () => (
  <ReactFlowProvider>
    <CanvasInner />
  </ReactFlowProvider>
);
