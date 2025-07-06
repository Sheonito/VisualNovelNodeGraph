import React, { useCallback } from 'react';
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

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    []
  );

  const addNode = () => {
    const newId = `${++nodeId}`;
    setNodes((nds) => [
      ...nds,
      {
        id: newId,
        position: {
          x: Math.random() * 500 + 100,
          y: Math.random() * 300 + 100,
        },
        data: { label: `노드 ${newId}` },
        type: 'custom',
      },
    ]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button
        onClick={addNode}
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 10,
          left: 10,
          padding: '8px 12px',
          fontSize: '14px',
        }}
      >
        ➕ 노드 추가
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        nodesDraggable={true}         // ✅ 노드 드래그 허용
        elementsSelectable={true}     // ✅ 노드 선택 가능
        nodesConnectable={true}       // ✅ 포트 연결 허용
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
