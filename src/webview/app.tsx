import React, { useCallback, useEffect, useRef,useLayoutEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  useReactFlow,
  ReactFlowProvider,
  useOnViewportChange,
  Viewport,
  useUpdateNodeInternals,
  useStore,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import useUndo from 'use-undo';

let nodeId = 1;

const initialEdges: Edge[] = [];

const nodeTypes = {
  custom: CustomNode,
};

function FlowApp() {
  const { getNodes, getEdges} = useReactFlow();

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

  const clipboardRef = useRef<Node[]>([]);

  const isInternalUpdate = useRef(false);
  const isUndoing = useRef(false);
  const isRedoing = useRef(false);
  const _isEditing = useRef(false);

  const { setViewport, getViewport } = useReactFlow();
  const prevViewport = useRef<Viewport>(getViewport());
  const ignoreNextChange = useRef(false);

  useOnViewportChange({
    onChange: (viewport) => {
      if (ignoreNextChange.current) {
        ignoreNextChange.current = false;
        return; // 다음 변경은 무시
      }

      const diffX = Math.abs(viewport.x - prevViewport.current.x);
      if (diffX > 200) {
        ignoreNextChange.current = true; // 다음 onChange 무시
        setViewport({
        x: prevViewport.current.x,
        y: prevViewport.current.y,
        zoom: viewport.zoom,
        }); // 이전 위치로 되돌림
        return;
      }

      prevViewport.current = viewport; // 정상 이동이면 갱신
    },
  });

  const { screenToFlowPosition } = useReactFlow();

  const tracedSetState = (newState: { nodes: Node[]; edges: Edge[] }) => {
    setState(newState);
  };

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  function handleLabelChange(id: string, newLabel: string) {
    const current = nodesRef.current.find((n) => n.id === id);
    const currentLabel = current?.data.label;
    if (currentLabel === newLabel) return;

    const updated = nodesRef.current.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node
    );

    tracedSetState({ nodes: updated, edges: edgesRef.current });
  }

  function handleEditChange(id: string, isEditing: boolean) {
    _isEditing.current = isEditing;
  }

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    if (_isEditing.current) return;

    const filtered = changes.filter(change => {
      return change.type !== 'dimensions';
    });

    const updated = applyNodeChanges(filtered, nodesRef.current);

    if (isInternalUpdate.current || isUndoing.current || isRedoing.current) {
      nodesRef.current = updated;
      return;
    }

    if (filtered.length === 0) return;
    tracedSetState({ nodes: updated, edges: edgesRef.current });
  }, [tracedSetState]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    const updated = applyEdgeChanges(changes, edgesRef.current);
    tracedSetState({ nodes: nodesRef.current, edges: updated });
  }, [tracedSetState]);

  const onConnect = useCallback((connection: Connection) => {
    const newEdges = addEdge({ ...connection, animated: true }, edgesRef.current);
    tracedSetState({ nodes: nodesRef.current, edges: newEdges });
  }, [tracedSetState]);

  const addNode = (e: React.MouseEvent<HTMLButtonElement>) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const canvasPosition = screenToFlowPosition({ x: mouseX, y: mouseY });
    const newId = `${++nodeId}`;

    const newNode: Node = {
      id: newId,
      position: canvasPosition,
      data: {
        label: `New Node`,
        onEditChange: handleEditChange,
        onLabelChange: handleLabelChange,
      },
      type: 'custom',
    };

    isInternalUpdate.current = true;
    tracedSetState({
      nodes: [...nodesRef.current.map(n => ({ ...n })), newNode],
      edges: [...edgesRef.current.map(e => ({ ...e }))],
    });

    setTimeout(() => {
      isInternalUpdate.current = false;
    }, 0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        const selectedNodeIds = getNodes().filter(n => n.selected).map(n => n.id);
        const selectedEdgeIds = getEdges().filter(e => e.selected).map(e => e.id);

        let updatedNodes = nodesRef.current;
        let updatedEdges = edgesRef.current;

        if (selectedNodeIds.length > 0) {
          updatedNodes = updatedNodes.filter(
            (node) => !selectedNodeIds.includes(node.id)
          );
          updatedEdges = updatedEdges.filter(
            (edge) =>
              !selectedNodeIds.includes(edge.source) &&
              !selectedNodeIds.includes(edge.target)
          );
        }

        if (selectedEdgeIds.length > 0) {
          updatedEdges = updatedEdges.filter(
            (edge) => !selectedEdgeIds.includes(edge.id)
          );
        }

        tracedSetState({ nodes: updatedNodes, edges: updatedEdges });
      }

      if (e.ctrlKey && e.key === 'z') {
        if (canUndo) {
          isUndoing.current = true;
          undo();
          setTimeout(() => {
            isUndoing.current = false;
          }, 0);
        }
      } else if (e.ctrlKey && e.key === 'y') {
        if (canRedo) {
          isRedoing.current = true;
          redo();
          setTimeout(() => {
            isRedoing.current = false;
          }, 0);
        }
      }

      if (e.ctrlKey && e.key === 'c') {
        const selected = getNodes().filter(n => n.selected);
        if (selected.length > 0) {
          clipboardRef.current = selected.map(n => ({ ...n }));
        }
      }

      if (e.ctrlKey && e.key === 'v') {
        const copied = clipboardRef.current;
        if (copied.length === 0) return;

        const offset = { x: 40, y: 40 };
        const newNodes = copied.map(original => {
          const newId = `${++nodeId}`;
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
              onLabelChange: handleLabelChange,
              onEditChange: handleEditChange,
            },
            selected: false,
          };
        });

        tracedSetState({
          nodes: [...nodesRef.current.map(n => ({ ...n })), ...newNodes],
          edges: [...edgesRef.current.map(e => ({ ...e }))],
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getNodes, getEdges, canUndo, canRedo, undo, redo, tracedSetState]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <button
        onClick={addNode}
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 16,
          left: 16,
          padding: '8px 14px',
          fontSize: '14px',
          border: '1px solid #555',
          borderRadius: '8px',
          backgroundColor: '#2b2b2b',
          color: 'white',
          fontFamily: '"Noto Sans KR", sans-serif',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          cursor: 'pointer',
        }}
      >
        + 노드 추가
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        nodesDraggable={!_isEditing.current}
        panOnDrag={!_isEditing.current}
        fitView
        selectionOnDrag={true}
        multiSelectionKeyCode="Control"
        panOnScroll={true}
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowApp />
    </ReactFlowProvider>
  );
}
