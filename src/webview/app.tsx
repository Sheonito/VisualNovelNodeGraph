import React, { useRef } from 'react';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import FlowControls from './components/FlowControls';
import FlowEditor from './components/FlowEditor';
import { useFlowState } from './hooks/useFlowState';

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

function AppContent() {
  const { screenToFlowPosition } = useReactFlow();
  const flow = useFlowState(); // ✅ 상태 여기서만 생성
  const { nodesRef, edgesRef, setState } = flow;

  // 편집 중 상태 추적
  function handleEditChange(id: string, isEditing: boolean) {
    flow.isEditingRef.current = isEditing;
  }

  // 라벨 변경 → undo 적용
  function handleLabelChange(id: string, newLabel: string) {
    const current = nodesRef.current.find((n) => n.id === id);
    if (current?.data.label === newLabel) return;

    const updated = nodesRef.current.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node
    );

    setState({ nodes: updated, edges: [...edgesRef.current] });
  }

  // 3. 노드 생성 시 위 핸들러들을 전달
  const handleAddNode = () => {
    const position = screenToFlowPosition({ x: 300, y: 300 });
    const newId = `${++flow.nodeIdRef.current}`;

    const newNode = {
      id: newId,
      position,
      data: {
        label: 'New Node',
        onEditChange: handleEditChange,
        onLabelChange: handleLabelChange,
      },
      type: 'custom',
    };

    setState({
      nodes: [...nodesRef.current, newNode],
      edges: [...edgesRef.current],
    });
  };

  

  return (
    <>
      <FlowControls onAddNode={handleAddNode} />
      <FlowEditor flow={flow} /> {/* ✅ props로 전달 */}
    </>
  );
}
