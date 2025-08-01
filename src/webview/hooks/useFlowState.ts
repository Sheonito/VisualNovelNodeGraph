import { useEffect, useRef } from 'react';
import useUndo from 'use-undo';
import type { Node, Edge } from 'reactflow';

export type FlowState = ReturnType<typeof useFlowState>;

export function useFlowState() {
  const [
    state,
    {
      set: setState,
      undo,
      redo,
      canUndo,
      canRedo,
    },
  ] = useUndo<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: [],
  });

  const nodes = state.present.nodes;
  const edges = state.present.edges;

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const isEditingRef = useRef(false);
  const nodeIdRef = useRef(0);

  useEffect(() => {
    console.log(nodes);
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  return {
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
  };
}
