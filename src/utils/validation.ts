// ─── Graph Validation Utilities ──────────────────────────────────────────────
// Pure functions — no React, no store, easily testable.

import type { AppNode, ValidationError } from '../types/workflow';
import type { Edge } from '@xyflow/react';

export function validateWorkflow(nodes: AppNode[], edges: Edge[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. Must have exactly one Start Node
  const starts = nodes.filter((n) => n.type === 'start');
  if (starts.length === 0) {
    errors.push({ message: 'Workflow must have a Start Node.', severity: 'error' });
  } else if (starts.length > 1) {
    errors.push({ message: 'Only one Start Node is allowed.', severity: 'error' });
  }

  // 2. Should have at least one End Node
  const ends = nodes.filter((n) => n.type === 'end');
  if (ends.length === 0 && nodes.length > 0) {
    errors.push({ message: 'Workflow should have an End Node.', severity: 'warning' });
  }

  // 3. Connectivity — every non-start must have an incoming edge, every non-end must have an outgoing edge
  for (const node of nodes) {
    const hasIncoming = edges.some((e) => e.target === node.id);
    const hasOutgoing = edges.some((e) => e.source === node.id);

    if (node.type === 'start' && !hasOutgoing) {
      errors.push({ nodeId: node.id, message: `Start Node has no outgoing connection.`, severity: 'error' });
    } else if (node.type === 'end' && !hasIncoming) {
      errors.push({ nodeId: node.id, message: `End Node has no incoming connection.`, severity: 'error' });
    } else if (node.type !== 'start' && node.type !== 'end') {
      if (!hasIncoming) {
        errors.push({ nodeId: node.id, message: `"${(node.data as any).label}" has no incoming connection.`, severity: 'warning' });
      }
      if (!hasOutgoing) {
        errors.push({ nodeId: node.id, message: `"${(node.data as any).label}" has no outgoing connection.`, severity: 'warning' });
      }
    }
  }

  // 4. Cycle detection (DFS)
  if (detectCycle(nodes, edges)) {
    errors.push({ message: 'Cycle detected — workflow must be acyclic.', severity: 'error' });
  }

  return errors;
}

function detectCycle(nodes: AppNode[], edges: Edge[]): boolean {
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => adj.get(e.source)?.push(e.target));

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  nodes.forEach((n) => color.set(n.id, WHITE));

  function dfs(u: string): boolean {
    color.set(u, GRAY);
    for (const v of adj.get(u) || []) {
      if (color.get(v) === GRAY) return true;  // back-edge → cycle
      if (color.get(v) === WHITE && dfs(v)) return true;
    }
    color.set(u, BLACK);
    return false;
  }

  for (const node of nodes) {
    if (color.get(node.id) === WHITE && dfs(node.id)) return true;
  }
  return false;
}
