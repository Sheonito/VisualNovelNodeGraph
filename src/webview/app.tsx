import React, { useCallback, useEffect, useRef, useState } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './CustomNode';
import useUndo from 'use-undo';

let nodeId = 1;

const initialEdges: Edge[] = [];

const nodeTypes = {
  custom: CustomNode,
};

export default function App() {
  const { project, getNodes, getEdges } = useReactFlow();

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

  // ✅ 최신 상태 ref로 추적
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  const isInternalUpdate = useRef(false);
  const isUndoing = useRef(false);
  const isRedoing = useRef(false);
  const _isEditing = useRef(false);

  const tracedSetState = (newState: { nodes: Node[]; edges: Edge[] }) => {
    console.log('📌 setState 호출됨');
    console.log('새로운 상태:',newState.nodes.length,', ',newState.edges.length);
    setState(newState);
  };

  useEffect(() => {
    console.log('🕒 현재 상태 업데이트됨');
    console.log('present:',state.present.nodes);
    console.log('past length:',state.past.length);
    console.log('future length:',state.future.length);
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  // ✅ 노드 라벨 변경
  function handleLabelChange(id: string, newLabel: string) {
    const current = nodesRef.current.find((n) => n.id === id);
    const currentLabel = current?.data.label;
    console.log('newLabel: ',newLabel);
    console.log('currentLabel: ',currentLabel);


    if (currentLabel === newLabel) {
      console.log(`⚠️ 라벨 동일 → setState 생략됨`);
      return; // 아무것도 안 바뀜
    }

    const updated = nodesRef.current.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node
    );

    tracedSetState({ nodes: updated, edges: edgesRef.current });
  }

  function handleEditChange(id: string, isEditing: boolean) {
    console.log('isEditing:', isEditing);
    _isEditing.current = isEditing;
  }

  const onNodesChange = useCallback((changes: NodeChange[]) => {

    if(_isEditing.current == true)
      return;
    
    const filtered = changes.filter(change => {
      if (change.type === 'position') {
        return change.dragging === true;
      }

      return change.type !== 'dimensions';
    });

    const updated = applyNodeChanges(filtered, nodesRef.current);

    if (isInternalUpdate.current || isUndoing.current || isRedoing.current) {
      nodesRef.current = updated;
      return;
    }

    if (filtered.length === 0)
      return;
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

  const  addNode = (e: React.MouseEvent<HTMLButtonElement>) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const canvasPosition = project({ x: mouseX, y: mouseY });
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

    console.log(`노드 ${newId} 추가됨`);

    isInternalUpdate.current = true;
    tracedSetState({
      nodes: [...nodesRef.current.map(n => ({ ...n })), newNode],
      edges: [...edgesRef.current.map(e => ({ ...e }))],
    });

    setTimeout(() => {
      isInternalUpdate.current = false;
    }, 0); // 다음 프레임에서 다시 허용
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
        console.log('canUndo: ',canUndo);
        console.log('present:',state.present);
        console.log('past length:',state.past.length);
        console.log('future length:',state.future.length);
        if (canUndo) {
          isUndoing.current = true;
          undo()
          setTimeout(() => {
            isUndoing.current = false;
          }, 0);
        };
      } else if (e.ctrlKey && e.key === 'y') {
        if (canRedo) {
          isRedoing.current = true;
          redo()
          setTimeout(() => {
            isRedoing.current = false;
          }, 0);
        };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getNodes, getEdges, canUndo, canRedo, undo, redo, tracedSetState]);


  return (
    <div style={{ width: '100vw', height: '100vh' }}>
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
        nodesDraggable = {!_isEditing.current}
        panOnDrag = {!_isEditing.current}
        fitView
        selectionOnDrag
        multiSelectionKeyCode="Control"
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
