import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { MoneyInput } from '../../common/MoneyInput.jsx';
import { formatCOP, getCurrentColombiaDate } from '../../../core/formatters.js';

export function CreditPayModal({
  isOpen,
  onClose,
  credit,
  onConfirmPay,
}) {
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(getCurrentColombiaDate());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && credit) {
      const defaultAmount = Number(credit.nextQuotaAmount) || Number(credit.monthlyQuotaEstimate) || 334035;
      setAmount(defaultAmount);
      setDate(getCurrentColombiaDate());
      setNotes('Pago Cuota mensual ordinaria');
      setIsSubmitting(false);
    }
  }, [isOpen, credit]);

  if (!credit) return null;

  const currentBalance = Number(credit.currentBalance) || 0;
  const currentTermPaid = Number(credit.currentTermPaid) || 0;
  const currentTermRemaining = Number(credit.currentTermRemaining) || 43;

  // Cálculo estimativo del capital amortizado en esta cuota
  const rateEA = Number(credit.rateEA) || 24.90;
  const monthlyRate = Math.pow(1 + rateEA / 100, 1 / 12) - 1;
  const interestPart = Math.round(currentBalance * monthlyRate);
  const insurancePart = Number(credit.insuranceMonthly) || 33444;
  const capitalAmortizado = Math.max(0, (Number(amount) || 0) - interestPart - insurancePart);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    setIsSubmitting(true);
    try {
      const ym = (date || getCurrentColombiaDate()).slice(0, 7);
      await onConfirmPay({
        creditId: credit.id,
        type: 'cuota',
        amount: Number(amount),
        capitalAmortizado,
        intereses: interestPart,
        seguros: insurancePart,
        date: date || getCurrentColombiaDate(),
        ym,
        cuotasPagadas: Math.min(credit.termTotal, currentTermPaid + 1),
        cuotasPendientes: Math.max(0, currentTermRemaining - 1),
        notes: notes || 'Pago cuota mensual ordinaria',
      });
      onClose();
    } catch (err) {
      console.error('Error al registrar pago de cuota:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Registrar Cuota Mensual">
      <form onSubmit={handleSubmit} style={{ padding: '0 4px 16px' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Registra el pago de tu cuota de <strong>Banco AV Villas</strong>. Esta cuota avanza tu progreso
          en 1 mes y amortiza capital según el interés mensual y seguros.
        </p>

        {/* Info Cuota */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 14,
            border: '1px solid var(--border-subtle)',
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cuota actual</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
              Cuota #{currentTermPaid + 1} de {credit.termTotal}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Saldo actual</div>
            <div className="money tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatCOP(currentBalance)}
            </div>
          </div>
        </div>

        {/* Valor Pagado */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Valor Total Pagado *
          </label>
          <MoneyInput
            value={amount}
            onChange={setAmount}
            placeholder="0"
            autoFocus
          />
        </div>

        {/* Desglose Estimado */}
        {amount > 0 && (
          <div
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 14,
              padding: '12px 14px',
              marginBottom: 16,
              fontSize: '0.78rem',
              color: '#cbd5e1',
            }}
          >
            <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: 4 }}>
              Distribución calculada de la cuota:
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span>Abono real a Capital:</span>
              <strong style={{ color: '#34d399' }}>{formatCOP(capitalAmortizado)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span>Interés corriente ({credit.rateEA}% EA):</span>
              <span style={{ color: '#f87171' }}>{formatCOP(interestPart)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span>Seguros (Vida + Desempleo):</span>
              <span style={{ color: '#94a3b8' }}>{formatCOP(insurancePart)}</span>
            </div>
          </div>
        )}

        {/* Fecha de Pago */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Fecha de Pago
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 14,
              border: '1px solid var(--border-subtle)',
              padding: '0 16px',
              height: 50,
            }}
          >
            <Calendar size={18} style={{ color: 'var(--text-muted)', marginRight: 10 }} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
              }}
            />
          </div>
        </div>

        {/* Notas */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Nota / Referencia
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Pago AvalPay PSE / Bancolombia"
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 14,
              border: '1px solid var(--border-subtle)',
              padding: '12px 16px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: 10 }}>
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
            disabled={!amount || amount <= 0 || isSubmitting}
            className="btn-primary"
            style={{ flex: 2, height: 48, fontSize: '0.88rem', fontWeight: 700 }}
          >
            {isSubmitting ? 'Guardando...' : 'Confirmar Pago'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}

