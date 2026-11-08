import React from 'react';
import { Calendar, CreditCard, Plus, Check, CheckCircle2 } from 'lucide-react';
import { formatCOP } from '../../../core/formatters.js';
import { QUINCENA_LABELS } from '../../../core/constants.js';
import { DoubleTapButton } from '../../common/DoubleTapButton.jsx';

export function QuincenaBlock({
  qNumber,
  isCurrentNow,
  cards = [],
  fixedItems = [],
  onPayCard,
  onToggleFixed,
  onAddExpense,
  onEditFixed,
  onDeleteFixed,
}) {
  const label = QUINCENA_LABELS[qNumber];

  // Calcular totales de la quincena
  let totalQuincena = 0;
  let paidQuincena = 0;

  // Cuotas de tarjetas
  for (const c of cards) {
    if (c.currentBalance > 0) {
      totalQuincena += c.monthlyQuota;
      paidQuincena += c.cuotasPaidInMonth;
    }
  }

  // Obligaciones fijas
  for (const f of fixedItems) {
    totalQuincena += f.amount;
    if (f.isPaid) {
      paidQuincena += f.amount;
    }
  }

  const pendingQuincena = Math.max(0, totalQuincena - paidQuincena);

  return (
    <div
      className="card"
      style={{
        borderRadius: 20,
        padding: '18px 16px',
        marginBottom: 16,
        border: isCurrentNow ? '1.5px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-card)',
        position: 'relative',
      }}
    >
      {/* Cabecera del bloque */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: qNumber === '1' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: qNumber === '1' ? 'var(--accent-blue)' : 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={18} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {label}
              </h3>
              {isCurrentNow && <span className="badge badge-now">Ahora</span>}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {qNumber === '1' ? 'Sueldo 15 · Cubre días 15 al 29' : 'Sueldo 30 · Cubre días 30 al 14'}
            </span>
          </div>
        </div>

        {/* Resumen de la quincena */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Falta por pagar</div>
          <div
            className="money tabular-nums"
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: pendingQuincena === 0 ? 'var(--accent-green)' : 'var(--accent-amber)',
            }}
          >
            {formatCOP(pendingQuincena)}
          </div>
        </div>
      </div>

      {/* Lista de pagos de esta quincena */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {/* 1. Tarjetas asignadas a esta quincena */}
        {cards.map((card) => {
          const isQuotaPaid = card.isQuotaFulfilled;
          const isCardPaidOff = card.currentBalance <= 0;

          return (
            <div
              key={`card-${card.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 14,
                backgroundColor: isQuotaPaid ? 'rgba(30, 41, 59, 0.3)' : 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                opacity: isQuotaPaid ? 0.75 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: isQuotaPaid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    color: isQuotaPaid ? 'var(--accent-green)' : 'var(--accent-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CreditCard size={16} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: isQuotaPaid ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: isQuotaPaid ? 'line-through' : 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {card.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Cuota tarjeta · {isCardPaidOff ? 'Totalmente pagada' : `Saldo: ${formatCOP(card.currentBalance)}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  className="money tabular-nums"
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: isQuotaPaid ? 'var(--accent-green)' : 'var(--text-primary)',
                    textDecoration: isQuotaPaid ? 'line-through' : 'none',
                    textAlign: 'right',
                  }}
                >
                  {formatCOP(isQuotaPaid ? card.cuotasPaidInMonth : card.pendingQuota || card.monthlyQuota)}
                </div>

                {isQuotaPaid ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.72rem',
                      color: 'var(--accent-green)',
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={16} /> Al día
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPayCard(card)}
                    className="btn-primary"
                    style={{
                      height: 36,
                      padding: '0 12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      borderRadius: 10,
                    }}
                  >
                    Pagar
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* 2. Obligaciones fijas asignadas a esta quincena */}
        {fixedItems.map((item) => {
          const isPaid = item.isPaid;

          return (
            <div
              key={`fixed-${item.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 14,
                backgroundColor: isPaid ? 'rgba(30, 41, 59, 0.3)' : 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                opacity: isPaid ? 0.75 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                {/* Círculo para marcar como pagado */}
                <button
                  type="button"
                  onClick={() => onToggleFixed(item)}
                  aria-label={isPaid ? 'Desmarcar' : 'Marcar pagado'}
                  style={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    borderRadius: 9999,
                    backgroundColor: isPaid ? 'var(--accent-green)' : 'transparent',
                    border: isPaid ? '2px solid var(--accent-green)' : '2px solid var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {isPaid && <Check size={16} strokeWidth={3} />}
                </button>

                <div
                  onClick={() => onEditFixed(item)}
                  style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                  title="Toca para editar"
                >
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: isPaid ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: isPaid ? 'line-through' : 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {item.cat}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  className="money tabular-nums"
                  onClick={() => onEditFixed(item)}
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: isPaid ? 'var(--accent-green)' : 'var(--text-primary)',
                    textDecoration: isPaid ? 'line-through' : 'none',
                    textAlign: 'right',
                    cursor: 'pointer',
                  }}
                >
                  {formatCOP(item.amount)}
                </div>

                <DoubleTapButton
                  onConfirm={() => onDeleteFixed(item.id)}
                  label=""
                  confirmLabel="¿Borrar?"
                  style={{ minWidth: 32, width: 32, height: 32, padding: 0 }}
                />
              </div>
            </div>
          );
        })}

        {cards.length === 0 && fixedItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No hay gastos programados para esta quincena.
          </div>
        )}
      </div>

      {/* Botón directo para agregar gastos a esta quincena */}
      <button
        type="button"
        onClick={() => onAddExpense(qNumber)}
        className="btn-secondary"
        style={{
          width: '100%',
          height: 44,
          fontSize: '0.85rem',
          fontWeight: 700,
          borderRadius: 12,
          borderStyle: 'dashed',
        }}
      >
        <Plus size={16} />
        <span>Agregar gasto a la {label}</span>
      </button>
    </div>
  );
}

