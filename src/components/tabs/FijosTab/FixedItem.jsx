import React from 'react';
import { Check, Edit2, Home, Car, Zap, Tag } from 'lucide-react';
import { DoubleTapButton } from '../../common/DoubleTapButton.jsx';
import { formatCOP } from '../../../core/formatters.js';

function getCategoryIcon(catName = '') {
  const norm = catName.toLowerCase();
  if (norm.includes('viv') || norm.includes('arrien')) return <Home size={15} />;
  if (norm.includes('trans') || norm.includes('moto') || norm.includes('carro')) return <Car size={15} />;
  if (norm.includes('serv')) return <Zap size={15} />;
  return <Tag size={15} />;
}

export function FixedItem({
  item,
  onTogglePay,
  onEdit,
  onDelete,
}) {
  const isPaid = item.isPaid;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: 18,
        backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
        border: isPaid ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
        boxShadow: isPaid ? 'none' : 'var(--card-inner-bevel)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Botón circular de check + Nombre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <button
          type="button"
          onClick={() => onTogglePay(item)}
          aria-label={isPaid ? 'Desmarcar como pagado' : 'Marcar como pagado'}
          style={{
            width: 38,
            height: 38,
            minWidth: 38,
            borderRadius: 9999,
            backgroundColor: isPaid ? 'var(--accent-green)' : 'transparent',
            border: isPaid ? '2px solid var(--accent-green)' : '2px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: isPaid ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {isPaid && <Check size={20} strokeWidth={3} />}
        </button>

        <div
          onClick={() => onEdit(item)}
          style={{ cursor: 'pointer', flex: 1, minWidth: 0, overflow: 'hidden' }}
          title="Toca para editar"
        >
          <div
            style={{
              fontSize: '0.98rem',
              fontWeight: 700,
              color: isPaid ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: isPaid ? 'line-through' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}
          >
            {item.name}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {getCategoryIcon(item.cat)}
              {item.cat}
            </span>
            <span>•</span>
            <span>Q{item.q === '1' ? '15' : '30'}</span>
          </div>
        </div>
      </div>

      {/* Valor, estado de pago y botón de borrado rápido */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
        {!isPaid && (Number(item.amount) || 0) === 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePay(item);
            }}
            className="btn-secondary"
            style={{
              height: 32,
              padding: '0 10px',
              fontSize: '0.78rem',
              borderRadius: 8,
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: 'var(--accent-blue)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>$0 · Pagar</span>
          </button>
        ) : (
          <div
            onClick={() => onEdit(item)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <div
              className="money tabular-nums"
              style={{
                fontSize: '0.96rem',
                fontWeight: 800,
                color: isPaid ? 'var(--accent-green)' : 'var(--text-primary)',
                textDecoration: isPaid ? 'line-through' : 'none',
                whiteSpace: 'nowrap',
                lineHeight: 1.15,
              }}
            >
              {formatCOP(item.amount)}
            </div>
            {isPaid && item.paidRecord?.date && (
              <span
                style={{
                  fontSize: '0.66rem',
                  color: 'var(--accent-green)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  marginTop: 2,
                  letterSpacing: '0.01em',
                }}
              >
                Pagado {item.paidRecord.date.slice(5)}
              </span>
            )}
          </div>
        )}

        <DoubleTapButton
          onConfirm={() => onDelete(item.id)}
          label=""
          confirmLabel="¿Borrar?"
          style={{ minWidth: 36, width: 36, height: 36, padding: 0, flexShrink: 0 }}
        />
      </div>
    </div>
  );
}
