import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { MoneyInput } from '../../common/MoneyInput.jsx';
import { getCurrentColombiaDate, formatCOP } from '../../../core/formatters.js';

export function FixedPayModal({
  isOpen,
  onClose,
  item,
  onConfirmPayment,
}) {
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(() => getCurrentColombiaDate());
  const [saveAsHabitual, setSaveAsHabitual] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !item) return;
    setAmount(Number(item.amount) || 0);
    setDate(getCurrentColombiaDate());
    // Si el valor actual era 0, sugerimos por defecto guardarlo como habitual
    setSaveAsHabitual(Number(item.amount) === 0);
    setError('');
  }, [isOpen, item]);

  if (!item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = Math.round(Number(amount) || 0);
    if (numAmount <= 0) {
      setError('Por favor ingresa un valor mayor a $0.');
      return;
    }

    if (!date) {
      setError('Por favor selecciona la fecha del pago.');
      return;
    }

    onConfirmPayment({
      item,
      amount: numAmount,
      date,
      saveAsHabitual,
    });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Registrar Pago · ${item.name}`}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label
            htmlFor="fixed-pay-amount"
            style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}
          >
            ¿Cuánto pagaste de {item.name}? *
          </label>
          <MoneyInput
            id="fixed-pay-amount"
            value={amount}
            onChange={setAmount}
            placeholder="0"
            autoFocus
          />
        </div>

        {/* Fila compacta de Fecha y Checkbox Habitual */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10, alignItems: 'center' }}>
          <div>
            <label
              htmlFor="fixed-pay-date"
              style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}
            >
              Fecha del pago *
            </label>
            <input
              id="fixed-pay-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                height: 42,
                padding: '0 10px',
                borderRadius: 10,
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '10px 10px',
              borderRadius: 10,
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
              marginTop: 18,
            }}
          >
            <input
              type="checkbox"
              checked={saveAsHabitual}
              onChange={(e) => setSaveAsHabitual(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--accent-green)', cursor: 'pointer' }}
            />
            <span>Fijar habitual</span>
          </label>
        </div>

        {error && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--accent-red)',
              color: 'var(--accent-red)',
              fontSize: '0.82rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
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
              backgroundColor: 'var(--accent-green)',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              fontWeight: 800,
              fontSize: '0.92rem',
            }}
          >
            Confirmar Pago
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}

