// FlowEditor.tsx
import React, { useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  useOnViewportChange,
  Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';

import { useFlowHandlers } from '../hooks/useFlowHandlers';
import { useFlowKeyEvents } from '../hooks/useFlowKeyEvents';
import type { FlowState } from '../hooks/useFlowState';

const nodeTypes = {
  custom: CustomNode,
};

interface FlowEditorProps {
  flow: FlowState;
}

export default function FlowEditor({ flow }: FlowEditorProps) {
  const {
    nodes,
    edges,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    nodesRef,
    edgesRef,
    isEditingRef,
    nodeIdRef,
  } = flow;

  const clipboardRef = useRef([]);
  const { getNodes, getEdges, setViewport, getViewport } = useReactFlow();

  const isUndoingRef = useRef(false);
  const isRedoingRef = useRef(false);

  const { onNodesChange, onEdgesChange, onConnect } = useFlowHandlers({
    nodesRef,
    edgesRef,
    setState,
    isEditingRef,
    isUndoingRef,
    isRedoingRef,
  });

  useFlowKeyEvents({
    nodesRef,
    edgesRef,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    getNodes,
    getEdges,
    clipboardRef,
    nodeIdRef,
  });

  // 휠 pan 첫 프레임 튐 방지
  const prevViewport = useRef<Viewport>(getViewport());
  const ignoreNextChange = useRef(false);

  useOnViewportChange({
    onChange: (viewport) => {
      if (ignoreNextChange.current) {
        ignoreNextChange.current = false;
        return;
      }

      const diffX = Math.abs(viewport.x - prevViewport.current.x);
      if (diffX > 200) {
        ignoreNextChange.current = true;
        setViewport({
          x: prevViewport.current.x,
          y: prevViewport.current.y,
          zoom: viewport.zoom,
        });
        return;
      }

      prevViewport.current = viewport;
    },
  });

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        nodesDraggable={!isEditingRef.current}
        panOnDrag={!isEditingRef.current}
        selectionOnDrag
        multiSelectionKeyCode="Control"
        panOnScroll
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
