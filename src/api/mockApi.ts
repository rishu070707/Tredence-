// ─── Mock API Layer ──────────────────────────────────────────────────────────
// Simulates GET /automations and POST /simulate as specified in the requirements.

import type {
  AutomationAction,
  SimulationResult,
  AppNode,
} from '../types/workflow';
import type { Edge } from '@xyflow/react';

const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'slack_notify', label: 'Slack Notification', params: ['channel', 'message'] },
  { id: 'assign_ticket', label: 'Assign Ticket', params: ['ticketId', 'assignee'] },
];

/** GET /automations — returns available automated actions */
const getAutomations = async (): Promise<AutomationAction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_AUTOMATIONS), 250);
  });
};

/** POST /simulate — accepts workflow JSON, returns step-by-step execution */
const simulateWorkflow = async (workflow: {
  nodes: AppNode[];
  edges: Edge[];
}): Promise<SimulationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { nodes, edges } = workflow;

      // Build adjacency for traversal order
      const adj = new Map<string, string[]>();
      nodes.forEach((n) => adj.set(n.id, []));
      edges.forEach((e) => adj.get(e.source)?.push(e.target));

      // BFS from start nodes to determine execution order
      const startNode = nodes.find((n) => n.type === 'start');
      const visited = new Set<string>();
      const order: string[] = [];

      if (startNode) {
        const queue = [startNode.id];
        while (queue.length > 0) {
          const current = queue.shift()!;
          if (visited.has(current)) continue;
          visited.add(current);
          order.push(current);
          const neighbors = adj.get(current) || [];
          neighbors.forEach((n) => queue.push(n));
        }
      }

      // Generate execution steps
      const steps: SimulationResult['steps'] = order.map((nodeId) => {
        const node = nodes.find((n) => n.id === nodeId)!;
        const data = node.data as any;
        let status: 'success' | 'error' | 'skipped' = 'success';
        let message = 'Executed successfully';

        // Validate based on type
        if (node.type === 'task' && !data.title) {
          status = 'error';
          message = 'Task node is missing a title.';
        }
        if (node.type === 'automated' && !data.action) {
          status = 'error';
          message = 'No automation action selected.';
        }
        if (node.type === 'approval' && !data.approverRole) {
          status = 'error';
          message = 'No approver role assigned.';
        }

        return {
          nodeId: node.id,
          nodeType: data.type,
          label: data.title || data.startTitle || data.endMessage || data.label || 'Unnamed',
          status,
          message,
        };
      });

      // Mark unvisited nodes as skipped
      nodes.forEach((n) => {
        if (!visited.has(n.id)) {
          steps.push({
            nodeId: n.id,
            nodeType: (n.data as any).type,
            label: (n.data as any).label || 'Unnamed',
            status: 'skipped',
            message: 'Node is not reachable from the Start Node.',
          });
        }
      });

      resolve({ steps });
    }, 600);
  });
};

export const mockApi = { getAutomations, simulateWorkflow };
