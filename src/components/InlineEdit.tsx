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
      <input
        ref={inputRef}
        type={type}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white text-gray-900 border border-blue-300 rounded px-1 -mx-1 outline-none ring-2 ring-blue-200 w-full ${className}`}
        aria-label={ariaLabel}
        min={type === 'number' ? 1 : undefined}
      />
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
