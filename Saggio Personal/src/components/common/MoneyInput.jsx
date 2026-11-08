import React from 'react';
import { parseCOP } from '../../core/formatters.js';

export function MoneyInput({
  value,
  onChange,
  placeholder = '0',
  id,
  name,
  disabled = false,
  autoFocus = false,
}) {
  // Formatear valor visual con puntos de miles (ej. 500.000)
  const displayValue = value ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

  const handleChange = (e) => {
    const raw = e.target.value;
    const num = parseCOP(raw);
    onChange(num);
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: 14,
        border: '1px solid var(--border-subtle)',
        padding: '0 16px',
        height: 52,
        transition: 'border-color 0.2s',
      }}
    >
      <span
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          marginRight: 6,
          userSelect: 'none',
        }}
      >
        $
      </span>
      <input
        type="text"
        inputMode="numeric"
        id={id}
        name={name}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        className="money tabular-nums"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}
      />
    </div>
  );
}
