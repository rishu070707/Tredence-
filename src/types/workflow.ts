// ─── Node Data Types ─────────────────────────────────────────────────────────
// @ts-nocheck
import type { Node } from '@xyflow/react';

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface StartNodeData extends Record<string, unknown> {
  type: 'start';
  label: string;
  startTitle: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData extends Record<string, unknown> {
  type: 'task';
  label: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData extends Record<string, unknown> {
  type: 'approval';
  label: string;
  title: string;
  approverRole: 'Manager' | 'HRBP' | 'Director';
  autoApproveThreshold: number;
}

export interface AutomatedStepNodeData extends Record<string, unknown> {
  type: 'automated';
  label: string;
  title: string;
  action: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData extends Record<string, unknown> {
  type: 'end';
  label: string;
  endMessage: string;
  summaryFlag: boolean;
}

export type AppNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | EndNodeData;

export type AppNode = Node<AppNodeData>;

// ─── API Types ───────────────────────────────────────────────────────────────

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationStep {
  nodeId: string;
  nodeType: NodeType;
  label: string;
  status: 'success' | 'skipped' | 'error';
  message: string;
}

export interface SimulationResult {
  steps: SimulationStep[];
}

// ─── Validation Types ────────────────────────────────────────────────────────

export interface ValidationError {
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning';
}
