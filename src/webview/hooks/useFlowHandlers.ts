import { useCallback } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  EdgeChange,
  NodeChange,
  Node,
  Edge,
} from 'reactflow';

interface UseFlowHandlersProps {
  nodesRef: React.RefObject<Node[]>;
  edgesRef: React.RefObject<Edge[]>;
  setState: (newState: { nodes: Node[]; edges: Edge[] }) => void;
  isEditingRef?: React.RefObject<boolean>;
  isInternalUpdateRef?: React.RefObject<boolean>;
  isUndoingRef?: React.RefObject<boolean>;
  isRedoingRef?: React.RefObject<boolean>;
}

export function useFlowHandlers({
  nodesRef,
  edgesRef,
  setState,
  isEditingRef = { current: false },
  isInternalUpdateRef = { current: false },
  isUndoingRef = { current: false },
  isRedoingRef = { current: false },
}: UseFlowHandlersProps) {
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (isEditingRef.current) return;

      const filtered = changes.filter((change) => change.type !== 'dimensions');
      const updated = applyNodeChanges(filtered, nodesRef.current);

      if (isInternalUpdateRef.current || isUndoingRef.current || isRedoingRef.current) {
        nodesRef.current = updated;
        return;
      }

      if (filtered.length > 0) {
        setState({ nodes: updated, edges: edgesRef.current });
      }
    },
    [nodesRef, edgesRef, setState, isInternalUpdateRef, isUndoingRef, isRedoingRef, isEditingRef]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updated = applyEdgeChanges(changes, edgesRef.current);
      setState({ nodes: nodesRef.current, edges: updated });
    },
    [nodesRef, edgesRef, setState]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge({ ...connection, animated: true }, edgesRef.current);
      setState({ nodes: nodesRef.current, edges: newEdges });
    },
    [nodesRef, edgesRef, setState]
  );

  return {
    onNodesChange,
    onEdgesChange,
    onConnect,
  };
}
