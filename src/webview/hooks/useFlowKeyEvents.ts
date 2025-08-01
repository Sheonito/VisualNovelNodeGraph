import { useEffect } from 'react';
import { Node, Edge } from 'reactflow';

interface UseFlowKeyEventsProps {
  nodesRef: React.RefObject<Node[]>;
  edgesRef: React.RefObject<Edge[]>;
  setState: (state: { nodes: Node[]; edges: Edge[] }) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  getNodes: () => Node[];
  getEdges: () => Edge[];
  clipboardRef: React.RefObject<Node[]>;
  nodeIdRef: React.RefObject<number>;
  isEditingRef?: React.RefObject<boolean>;
}

export function useFlowKeyEvents({
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
}: UseFlowKeyEventsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌫ Delete
      if (e.key === 'Delete') {
        const selectedNodeIds = getNodes().filter(n => n.selected).map(n => n.id);
        const selectedEdgeIds = getEdges().filter(e => e.selected).map(e => e.id);

        let updatedNodes = nodesRef.current;
        let updatedEdges = edgesRef.current;

        if (selectedNodeIds.length > 0) {
          updatedNodes = updatedNodes.filter(node => !selectedNodeIds.includes(node.id));
          updatedEdges = updatedEdges.filter(
            edge => !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
          );
        }

        if (selectedEdgeIds.length > 0) {
          updatedEdges = updatedEdges.filter(edge => !selectedEdgeIds.includes(edge.id));
        }

        setState({ nodes: updatedNodes, edges: updatedEdges });
      }

      // ⌘ Ctrl + Z
      if (e.ctrlKey && e.key === 'z') {
        if (canUndo) undo();
      }

      // ⌘ Ctrl + Y
      if (e.ctrlKey && e.key === 'y') {
        if (canRedo) redo();
      }

      // ⌘ Ctrl + C
      if (e.ctrlKey && e.key === 'c') {
        const selected = getNodes().filter(n => n.selected);
        if (selected.length > 0) {
          clipboardRef.current = selected.map(n => ({ ...n }));
        }
      }

      // ⌘ Ctrl + V
      if (e.ctrlKey && e.key === 'v') {
        const copied = clipboardRef.current;
        if (copied.length === 0) return;

        const offset = { x: 40, y: 40 };
        const newNodes = copied.map(original => {
          const newId = `${++nodeIdRef.current}`;
          return {
            ...original,
            id: newId,
            position: {
              x: original.position.x + offset.x,
              y: original.position.y + offset.y,
            },
            data: {
              ...original.data,
              label: original.data.label + ' (복사됨)',
              // 이벤트 핸들러는 외부에서 주입
            },
            selected: false,
          };
        });

        setState({
          
          nodes: [...nodesRef.current.map(n => ({ ...n })), ...newNodes],
          edges: [...edgesRef.current.map(e => ({ ...e }))],
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
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
  ]);
}
