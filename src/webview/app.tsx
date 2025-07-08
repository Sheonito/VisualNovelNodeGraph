import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './CustomNode';

let nodeId = 1;

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: '시작 노드' },
    type: 'custom',
  },
];

const initialEdges: Edge[] = [];

const nodeTypes = {
  custom: CustomNode,
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { project, getNodes } = useReactFlow();

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    []
  );

  const addNode = (e: React.MouseEvent<HTMLButtonElement>) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const canvasPosition = project({ x: mouseX, y: mouseY });
    const newId = `${++nodeId}`;

    setNodes((nds) => [
      ...nds,
      {
        id: newId,
        position: canvasPosition,
        data: { label: `노드 ${newId}` },
        type: 'custom',
      },
    ]);
  };

  const { getEdges } = useReactFlow();
  // ✅ Delete 키로 선택 노드의 연결 edge 제거
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        const selectedEdgeIds = getEdges()
          .filter((edge) => edge.selected)
          .map((edge) => edge.id);

        if (selectedEdgeIds.length === 0) return;

        setEdges((eds) => eds.filter((edge) => !selectedEdgeIds.includes(edge.id)));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button
        onClick={addNode}
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 16,
          left: 16,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          fontSize: '14px',
          fontWeight: '500',
          border: '1px solid #555',
          borderRadius: '8px',
          backgroundColor: '#2b2b2b',
          color: 'white',
          fontFamily: '"Noto Sans KR", sans-serif',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          transition: 'background 0.2s, transform 0.1s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#3c3c3c')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2b2b2b')}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24">
          <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
        </svg>
        <span>노드 추가</span>
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        elementsSelectable={true}
        nodesConnectable={true}
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
