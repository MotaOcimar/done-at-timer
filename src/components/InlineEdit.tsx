import React, { useState, useEffect, useRef } from 'react';

interface InlineEditProps {
  value: string | number;
  onSave: (value: string) => void;
  className?: string;
  type?: 'text' | 'number';
  ariaLabel?: string;
}

export const InlineEdit = ({
  value,
  onSave,
  className = '',
  type = 'text',
  ariaLabel,
}: InlineEditProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentValue(String(value));
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = currentValue.trim();

    // Validation
    if (!trimmed) {
      // Revert if empty
      setCurrentValue(String(value));
      setIsEditing(false);
      return;
    }

    if (type === 'number') {
      const num = parseInt(trimmed, 10);
      if (isNaN(num) || num <= 0) {
        // Revert if invalid number
        setCurrentValue(String(value));
        setIsEditing(false);
        return;
      }
    }

    if (trimmed !== String(value)) {
      onSave(trimmed);
    } else {
        setCurrentValue(String(value));
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      e.stopPropagation(); // Prevent bubbling if necessary
      setCurrentValue(String(value));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <span className="inline-grid items-center align-bottom">
        <span className="invisible row-start-1 col-start-1 px-1 -mx-1 whitespace-pre font-[inherit] text-inherit">
          {currentValue || ' '}
        </span>
        <input
          ref={inputRef}
          type={type === 'number' ? 'text' : type}
          inputMode={type === 'number' ? 'numeric' : undefined}
          pattern={type === 'number' ? '[0-9]*' : undefined}
          size={1}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className={`row-start-1 col-start-1 bg-transparent text-inherit border-b border-blue-500/30 focus:border-blue-500/60 outline-none px-1 -mx-1 min-w-0 transition-colors font-[inherit] ${className}`}
          aria-label={ariaLabel}
        />
      </span>
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`cursor-pointer hover:bg-black/5 rounded px-1 -mx-1 transition-colors border border-transparent ${className}`}
      role="button"
      tabIndex={0}
      aria-label={`Edit ${ariaLabel}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
    >
      {value}
    </span>
  );
};
