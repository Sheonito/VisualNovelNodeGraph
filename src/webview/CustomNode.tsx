import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function CustomNode({ data, selected, id }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalLabel = useRef(data.label); // 편집 전 값 저장용

  // 포커스 자동 설정
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // 외부 클릭 감지 → 수정 종료 + 롤백
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const clickedInside = containerRef.current?.contains(e.target as Node);
      if (!clickedInside) {
        setIsEditing(false);
        setLabel(originalLabel.current); // 원래 값으로 롤백
      }
    }

    if (isEditing) {
      window.addEventListener('mousedown', handleClickOutside, true); // ✅ capture 단계
    }

    return () => {
      window.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isEditing]);

  function handleDoubleClick() {
    originalLabel.current = data.label; // 현재 값을 저장
    setIsEditing(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLabel(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (data.onLabelChange) {
        data.onLabelChange(id, label);
      }
    }
  }

  return (
    <div
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
      style={{
        padding: 8,
        border: '2px solid',
        borderRadius: 6,
        backgroundColor: '#222',
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        minWidth: 100,
        maxWidth: 100,
        position: 'relative',
        borderColor: selected ? '#4FC3F7' : '#555',
        boxShadow: selected ? '0 0 8px rgba(79, 195, 247, 0.6)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
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

      {isEditing ? (
        <input
          ref={inputRef}
          value={label}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            fontSize: 14,
            background: '#333',
            border: '1px solid #777',
            color: 'white',
            padding: '0px 6px',         // ✅ 위아래 padding 제거
            borderRadius: 4,
            boxSizing: 'border-box',
            height: '20px',             // ✅ 높이 고정 (기존 div와 같게)
            lineHeight: '20px',         // ✅ 텍스트 수직 정렬 보정
            display: 'block',
          }}
        />
      ) : (
        <div>{label}</div>
      )}

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
