import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { MoneyInput } from '../../common/MoneyInput.jsx';
import { formatCOP, getCurrentColombiaDate } from '../../../core/formatters.js';
import { CARD_PAYMENT_TYPES } from '../../../core/constants.js';

export function CardPayModal({
  isOpen,
  onClose,
  card,
  monthStatus,
  mode = CARD_PAYMENT_TYPES.CUOTA, // 'cuota', 'abono', 'cargo'
  onConfirmPayment,
}) {
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(() => getCurrentColombiaDate());
  const [error, setError] = useState('');

  const currentBalance = monthStatus ? monthStatus.currentBalance : 0;
  const isCargo = mode === CARD_PAYMENT_TYPES.CARGO;
  const isCuota = mode === CARD_PAYMENT_TYPES.CUOTA;
  const isAbono = mode === CARD_PAYMENT_TYPES.ABONO;

  useEffect(() => {
    if (!isOpen || !card) return;

    setDate(getCurrentColombiaDate());
    setError('');
    setAmount(0); // Monto libre para que el usuario escriba lo que va a pagar
  }, [isOpen, card, mode]);

  if (!card) return null;

  // Cálculo del nuevo saldo proyectado
  let projectedBalance = currentBalance;
  if (isCargo) {
    projectedBalance = currentBalance + (Number(amount) || 0);
  } else {
    projectedBalance = Math.max(0, currentBalance - (Number(amount) || 0));
  }

  const getTitle = () => {
    if (isCuota) return `Pagar Cuota - ${card.name}`;
    if (isAbono) return `Abonar a Capital - ${card.name}`;
    return `Prestar / Usar Tarjeta - ${card.name}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Ingresa un valor mayor a $0.');
      return;
    }

    if (!isCargo && amount > currentBalance) {
      setError(`El valor no puede ser mayor que el saldo actual (${formatCOP(currentBalance)}).`);
      return;
    }

    if (!date) {
      setError('Por favor selecciona una fecha.');
      return;
    }

    onConfirmPayment({
      cardId: card.id,
      type: mode,
      amount,
      date,
    });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Resumen de saldo y proyección */}
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Saldo actual</div>
            <div className="money tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              {formatCOP(currentBalance)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nuevo saldo proyectado</div>
            <div
              className="money tabular-nums"
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: isCargo
                  ? 'var(--accent-red)'
                  : projectedBalance === 0
                  ? 'var(--accent-green)'
                  : 'var(--accent-blue)',
              }}
            >
              {formatCOP(projectedBalance)}
            </div>
          </div>
        </div>

        {/* Monto */}
        <div>
          <label
            htmlFor="pay-amount"
            style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}
          >
            {isCargo ? '¿Cuánto prestaste / compraste con la tarjeta? *' : '¿Cuánto vas a pagar? *'}
          </label>
          <MoneyInput
            id="pay-amount"
            value={amount}
            onChange={setAmount}
            placeholder="0"
            autoFocus
          />
          {isCargo && (
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', marginTop: 4, display: 'block' }}>
              ⚠️ Este valor se sumará a la deuda actual de tu tarjeta.
            </span>
          )}
        </div>

        {/* Fecha */}
        <div>
          <label
            htmlFor="pay-date"
            style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}
          >
            Fecha del movimiento *
          </label>
          <input
            id="pay-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              height: 42,
              padding: '0 12px',
              borderRadius: 12,
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none',
            }}
          />
        </div>

        {/* Mensaje de error si aplica */}
        {error && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--accent-red)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* Botón de confirmar */}
        <div style={{ marginTop: 4, display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, height: 44, borderRadius: 12, fontSize: '0.88rem' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            style={{
              flex: 1.5,
              height: 44,
              borderRadius: 12,
              backgroundColor: isCargo ? 'var(--accent-red)' : isAbono ? 'var(--accent-purple)' : 'var(--accent-blue)',
              fontWeight: 800,
              fontSize: '0.88rem',
            }}
          >
            {isCargo ? 'Registrar Préstamo' : isAbono ? 'Registrar Abono' : 'Registrar Cuota'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
