import React, { useState, useEffect } from 'react';
import { Sliders, CheckCircle2 } from 'lucide-react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { MoneyInput } from '../../common/MoneyInput.jsx';
import { formatCOP } from '../../../core/formatters.js';

export function CreditAdjustModal({
  isOpen,
  onClose,
  credit,
  onConfirmAdjust,
}) {
  const [balance, setBalance] = useState(0);
  const [termPaid, setTermPaid] = useState(0);
  const [nextQuota, setNextQuota] = useState(0);
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && credit) {
      setBalance(Number(credit.currentBalance) || 0);
      setTermPaid(Number(credit.currentTermPaid) || 0);
      setNextQuota(Number(credit.nextQuotaAmount) || 334035);
      setNextDueDate(credit.nextDueDate || '02 de Diciembre de 2026');
      setNotes('Ajuste de calibración');
      setIsSubmitting(false);
    }
  }, [isOpen, credit]);

  if (!credit) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmAdjust(credit.id, {
        currentBalance: Number(balance),
        currentTermPaid: Number(termPaid),
        nextQuotaAmount: Number(nextQuota),
        nextDueDate,
        notes: notes || 'Ajuste manual de calibración por el usuario',
      });
      onClose();
    } catch (err) {
      console.error('Error al guardar ajuste:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Calibración Manual de Crédito">
      <form onSubmit={handleSubmit} style={{ padding: '0 4px 16px' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Modifica manualmente el saldo o el contador de cuotas si necesitas corregir algún valor
          sin subir un PDF.
        </p>

        {/* Saldo Capital */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Saldo de Capital Actual
          </label>
          <MoneyInput
            value={balance}
            onChange={setBalance}
            placeholder="0"
          />
        </div>

        {/* Cuotas Pagadas */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Cuotas Pagadas (de {credit.termTotal})
          </label>
          <input
            type="number"
            min="0"
            max={credit.termTotal}
            value={termPaid}
            onChange={(e) => setTermPaid(parseInt(e.target.value, 10) || 0)}
            style={{
              width: '100%',
              height: 50,
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 14,
              border: '1px solid var(--border-subtle)',
              padding: '0 16px',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 700,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Próxima Cuota */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Valor de la Próxima Cuota
          </label>
          <MoneyInput
            value={nextQuota}
            onChange={setNextQuota}
            placeholder="0"
          />
        </div>

        {/* Fecha Límite */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Fecha Límite de Pago Próxima
          </label>
          <input
            type="text"
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
            placeholder="Ej. 02 de Diciembre de 2026"
            style={{
              width: '100%',
              height: 50,
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 14,
              border: '1px solid var(--border-subtle)',
              padding: '0 16px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, height: 48, fontSize: '0.85rem' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ flex: 2, height: 48, fontSize: '0.88rem', fontWeight: 700 }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Calibración'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
