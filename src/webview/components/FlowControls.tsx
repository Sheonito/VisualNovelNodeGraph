import React from 'react';
import { useReactFlow } from 'reactflow';

interface FlowControlsProps {
  onAddNode: () => void;
}

export default function FlowControls({ onAddNode }: FlowControlsProps) {
  return (
    <button
      onClick={onAddNode}
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
  );
}
