// ─── Zustand Workflow Store ──────────────────────────────────────────────────
// Single centralized store for nodes, edges, selection, history, and validation.

import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react';
import type { AppNode, AppNodeData, ValidationError } from '../types/workflow';
import { validateWorkflow } from '../utils/validation';

interface WorkflowStore {
  // State
  nodes: AppNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  validationErrors: ValidationError[];
  history: { past: { nodes: AppNode[]; edges: Edge[] }[]; future: { nodes: AppNode[]; edges: Edge[] }[] };

  // Canvas callbacks
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Node CRUD
  addNode: (node: AppNode) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<AppNodeData>) => void;

  // Selection
  onNodeSelect: (nodeId: string | null) => void;

  // Setters
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: Edge[]) => void;

  // History
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Workflow
  clearWorkflow: () => void;
}

const MAX_HISTORY = 50;

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  validationErrors: [],
  history: { past: [], future: [] },

  // ── Canvas callbacks ────────────────────────────────────────────────────
  onNodesChange: (changes) => {
    const nodes = applyNodeChanges(changes, get().nodes) as AppNode[];
    set({ nodes, validationErrors: validateWorkflow(nodes, get().edges) });
  },

  onEdgesChange: (changes) => {
    const edges = applyEdgeChanges(changes, get().edges);
    set({ edges, validationErrors: validateWorkflow(get().nodes, edges) });
  },

  onConnect: (connection) => {
    get().saveToHistory();
    const edges = addEdge(
      {
        ...connection,
        animated: true,
        style: { stroke: '#64748b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
      },
      get().edges,
    );
    set({ edges, validationErrors: validateWorkflow(get().nodes, edges) });
  },

  // ── Node CRUD ───────────────────────────────────────────────────────────
  addNode: (node) => {
    get().saveToHistory();
    const nodes = [...get().nodes, node];
    set({ nodes, validationErrors: validateWorkflow(nodes, get().edges) });
  },

  deleteNode: (nodeId) => {
    get().saveToHistory();
    const nodes = get().nodes.filter((n) => n.id !== nodeId);
    const edges = get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
    set({
      nodes,
      edges,
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      validationErrors: validateWorkflow(nodes, edges),
    });
  },

  updateNodeData: (nodeId, data) => {
    const nodes = get().nodes.map((n) =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...data } as AppNodeData } : n,
    );
    set({ nodes });
  },

  // ── Selection ───────────────────────────────────────────────────────────
  onNodeSelect: (nodeId) => set({ selectedNodeId: nodeId }),

  // ── Setters ─────────────────────────────────────────────────────────────
  setNodes: (nodes) => set({ nodes, validationErrors: validateWorkflow(nodes, get().edges) }),
  setEdges: (edges) => set({ edges, validationErrors: validateWorkflow(get().nodes, edges) }),

  // ── History (Undo / Redo) ───────────────────────────────────────────────
  saveToHistory: () => {
    const { nodes, edges, history } = get();
    set({ history: { past: [...history.past, { nodes, edges }].slice(-MAX_HISTORY), future: [] } });
  },

  undo: () => {
    const { nodes, edges, history } = get();
    if (history.past.length === 0) return;
    const prev = history.past[history.past.length - 1];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      validationErrors: validateWorkflow(prev.nodes, prev.edges),
      history: { past: history.past.slice(0, -1), future: [{ nodes, edges }, ...history.future] },
    });
  },

  redo: () => {
    const { nodes, edges, history } = get();
    if (history.future.length === 0) return;
    const next = history.future[0];
    set({
      nodes: next.nodes,
      edges: next.edges,
      validationErrors: validateWorkflow(next.nodes, next.edges),
      history: { past: [...history.past, { nodes, edges }], future: history.future.slice(1) },
    });
  },

  clearWorkflow: () => {
    get().saveToHistory();
    set({ nodes: [], edges: [], selectedNodeId: null, validationErrors: [] });
  },
}));
