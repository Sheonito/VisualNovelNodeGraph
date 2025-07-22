import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function CustomNode({ data, selected, id }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalLabel = useRef(data.label); // 편집 전 값 저장

  useEffect(() => {
  setLabel(data.label); // undo/redo 등 외부 상태 변경 반영
  }, [data.label]);

  // 포커스 자동
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      resizeTextarea();
    }
  }, [isEditing]);

  // 외부 클릭 → 편집 종료 + 롤백
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const clickedInside = containerRef.current?.contains(e.target as Node);
      if (!clickedInside) {
        setIsEditing(false);
        setLabel(originalLabel.current);
        data.onEditChange?.(id, false);
      }
    }

    if (isEditing) {
      window.addEventListener('mousedown', handleClickOutside, true);
    }
    return () => {
      window.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isEditing]);

  function handleDoubleClick() {
    originalLabel.current = label;
    setIsEditing(true);
    data.onEditChange?.(id, false);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setLabel(e.target.value);
    resizeTextarea();
  }

  function resizeTextarea() {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 줄바꿈 방지
      setIsEditing(false);
      console.log('🔧 data.onLabelChange:', data.onLabelChange);
      data.onEditChange?.(id, false);
      if (data.onLabelChange) {
        console.log('onLabelChange');
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
        minWidth: 150,
        maxWidth: 150, // 글자가 길어질 수 있으므로 살짝 늘림
        position: 'relative',
        borderColor: selected ? '#4FC3F7' : '#555',
        boxShadow: selected ? '0 0 8px rgba(79, 195, 247, 0.6)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        pointerEvents: isEditing ? 'none' : 'auto',
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
        <textarea
          ref={textareaRef}
          value={label}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{
            width: '100%',
            fontSize: 14,
            background: '#333',
            border: '1px solid #777',
            color: 'white',
            padding: '0px 8px',
            borderRadius: 4,
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            minWidth: 150,
            maxWidth: 150,
            resize: 'none',
            overflow: 'hidden',
            textAlign: 'center',
            lineHeight: '20px',
            pointerEvents: 'auto',
          }}
        ></textarea>
      ) : (
        <div
          style={{
            fontSize: 14,
            lineHeight: '20px',
            padding: '0px 8px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            textAlign: 'center',
          }}
        >
          {label}
        </div>
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
