import React from 'react';
import { NodePalette } from './components/sidebar/NodePalette';
import { FlowCanvas } from './components/canvas/FlowCanvas';
import { NodeConfigPanel } from './components/forms/NodeConfigPanel';
import { SimulationPanel } from './components/sandbox/SimulationPanel';

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-screen bg-[#f1f5f9] overflow-hidden selection:bg-blue-100">
      {/* Sidebar background gradient for depth */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 -z-10" />
      
      {/* Left: Node palette with glass effect */}
      <NodePalette />

      {/* Center: Canvas + Sandbox */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex-1 min-h-0 relative">
          <FlowCanvas />
        </div>
        
        {/* Sandbox Panel - Floating or Fixed Bottom */}
        <div className="px-6 pb-6 absolute bottom-0 left-0 right-0 pointer-events-none">
          <div className="pointer-events-auto">
            <SimulationPanel />
          </div>
        </div>
      </div>

      {/* Right: Config panel with glass effect */}
      <NodeConfigPanel />
    </div>
  );
};

export default App;
