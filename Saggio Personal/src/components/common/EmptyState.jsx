import React from 'react';

export function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
      }}
    >
      {Icon && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            color: 'var(--accent-blue)',
          }}
        >
          <Icon size={28} />
        </div>
      )}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: 280, marginBottom: actionText ? 20 : 0 }}>
        {description}
      </p>
      {actionText && onAction && (
        <button type="button" className="btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}

