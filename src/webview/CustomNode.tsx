import React from 'react';
import { Handle, Position } from 'reactflow';

export default function CustomNode({ data }: any) {
  return (
    <div
      style={{
        padding: 8,
        border: '1px solid #555',
        borderRadius: 4,
        backgroundColor: '#222',
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        minWidth: 80,
        maxWidth: 140,
        position: 'relative', // ✅ 필수
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
