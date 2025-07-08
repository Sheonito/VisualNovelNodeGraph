import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function CustomNode({ data, selected }: NodeProps) {
  return (
    <div
      style={{
        padding: 8,
        border: '2px solid',
        borderRadius: 6,
        backgroundColor: '#222',
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        minWidth: 80,
        maxWidth: 140,
        position: 'relative',
        borderColor: selected ? '#4FC3F7' : '#555', // ✅ 선택 시 하늘색
        boxShadow: selected ? '0 0 8px rgba(79, 195, 247, 0.6)' : 'none', // ✅ glow 효과
        transition: 'border-color 0.2s, box-shadow 0.2s', // 부드럽게
      }}
    >
      {/* 입력 포트 */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#888',
          width: 10,
          height: 10,
          borderRadius: '50%',
        }}
        isConnectable={true}
      />

      <div>{data.label}</div>

      {/* 출력 포트 */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#888',
          width: 10,
          height: 10,
          borderRadius: '50%',
        }}
        isConnectable={true}
      />
    </div>
  );
}