import React from 'react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { DoubleTapButton } from '../../common/DoubleTapButton.jsx';
import { formatCOP, formatDateFriendly } from '../../../core/formatters.js';
import { CARD_PAYMENT_TYPES } from '../../../core/constants.js';
import { CreditCard, ArrowDownRight, ArrowUpRight, History } from 'lucide-react';

export function CardHistoryModal({
  isOpen,
  onClose,
  card,
  payments = [],
  onDeletePayment,
}) {
  if (!card) return null;

  // Ordenar los más recientes primero
  const sortedPayments = [...payments].sort((a, b) => (b.date > a.date ? 1 : -1));

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Historial - ${card.name}`}>
      {sortedPayments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
          <History size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>No hay pagos ni movimientos registrados</p>
          <span style={{ fontSize: '0.8rem' }}>
            Los pagos de cuotas, abonos y nuevos préstamos que hagas aparecerán aquí.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sortedPayments.map((p) => {
            const isCargo = p.type === CARD_PAYMENT_TYPES.CARGO;
            const isAbono = p.type === CARD_PAYMENT_TYPES.ABONO;

            const badgeText = isCargo
              ? 'Préstamo / Cargo'
              : isAbono
              ? 'Abono a capital'
              : 'Cuota mensual';

            const badgeBg = isCargo
              ? 'rgba(239, 68, 68, 0.15)'
              : isAbono
              ? 'rgba(168, 85, 247, 0.15)'
              : 'rgba(56, 189, 248, 0.15)';

            const badgeColor = isCargo
              ? 'var(--accent-red)'
              : isAbono
              ? 'var(--accent-purple)'
              : 'var(--accent-blue)';

            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 14,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isCargo ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          padding: '2px 8px',
                          borderRadius: 9999,
                        }}
                      >
                        {badgeText}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {formatDateFriendly(p.date)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    className="money tabular-nums"
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: isCargo ? 'var(--accent-red)' : 'var(--accent-green)',
                      textAlign: 'right',
                    }}
                  >
                    {isCargo ? `+${formatCOP(p.amount)}` : `-${formatCOP(p.amount)}`}
                  </div>

                  <DoubleTapButton
                    onConfirm={() => onDeletePayment(p.id)}
                    label=""
                    confirmLabel="¿Borrar?"
                    style={{ minWidth: 38, width: 38, height: 38, padding: 0 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BottomSheet>
  );
}

