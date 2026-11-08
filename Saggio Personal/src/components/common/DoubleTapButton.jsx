import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

export function DoubleTapButton({
  onConfirm,
  label = 'Eliminar',
  confirmLabel = '¿Seguro? Toca otra vez',
  icon: Icon = Trash2,
  className = '',
  style = {},
  variant = 'danger', // 'danger' | 'subtle'
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isConfirming) return;

    const timer = setTimeout(() => {
      setIsConfirming(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [isConfirming]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isConfirming) {
      setIsConfirming(false);
      onConfirm();
    } else {
      setIsConfirming(true);
    }
  };

  const isDanger = variant === 'danger';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      style={{
        minHeight: 44,
        minWidth: 44,
        padding: '8px 14px',
        borderRadius: 12,
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: isConfirming
          ? 'var(--accent-red)'
          : isDanger
          ? 'rgba(239, 68, 68, 0.12)'
          : 'var(--bg-subtle)',
        color: isConfirming
          ? '#ffffff'
          : isDanger
          ? 'var(--accent-red)'
          : 'var(--text-secondary)',
        border: isConfirming
          ? '1px solid var(--accent-red)'
          : isDanger
          ? '1px solid rgba(239, 68, 68, 0.3)'
          : '1px solid var(--border-subtle)',
        transform: isConfirming ? 'scale(1.02)' : 'scale(1)',
        ...style,
      }}
    >
      {isConfirming ? (
        <>
          <AlertTriangle size={16} />
          <span>{confirmLabel}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={16} />}
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}

