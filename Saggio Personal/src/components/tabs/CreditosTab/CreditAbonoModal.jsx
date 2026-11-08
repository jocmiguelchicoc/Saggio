import React, { useState, useEffect } from 'react';
import { Zap, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { MoneyInput } from '../../common/MoneyInput.jsx';
import { formatCOP, getCurrentColombiaDate } from '../../../core/formatters.js';

export function CreditAbonoModal({
  isOpen,
  onClose,
  credit,
  onConfirmAbono,
}) {
  const [amount, setAmount] = useState(0);
  const [cuotasAhorradas, setCuotasAhorradas] = useState(0);
  const [date, setDate] = useState(getCurrentColombiaDate());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(0);
      setCuotasAhorradas(0);
      setDate(getCurrentColombiaDate());
      setNotes('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!credit) return null;

  const currentBalance = Number(credit.currentBalance) || 0;
  const currentTermRemaining = Number(credit.currentTermRemaining) || 43;

  // Cálculo sugerido de cuotas reducidas basado en el abono a capital promedio (~$140.000)
  const handleAmountChange = (val) => {
    setAmount(val);
    if (val > 0) {
      // Estimación orientativa: amortización promedio de capital en las cuotas actuales
      const avgCapitalPerQuota = 145000;
      const suggestedQuotas = Math.round(val / avgCapitalPerQuota);
      setCuotasAhorradas(Math.min(currentTermRemaining, Math.max(1, suggestedQuotas)));
    } else {
      setCuotasAhorradas(0);
    }
  };

  const nuevoSaldo = Math.max(0, currentBalance - (Number(amount) || 0));
  const nuevasCuotasRestantes = Math.max(0, currentTermRemaining - (Number(cuotasAhorradas) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    setIsSubmitting(true);
    try {
      await onConfirmAbono({
        creditId: credit.id,
        type: 'abono',
        amount: Number(amount),
        cuotasAhorradas: Number(cuotasAhorradas) || 0,
        saldoResultante: nuevoSaldo,
        date: date || getCurrentColombiaDate(),
        ym: (date || getCurrentColombiaDate()).slice(0, 7),
        notes: notes || 'Abono extraordinario a capital (reducción de plazo)',
      });
      onClose();
    } catch (err) {
      console.error('Error al registrar abono:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Abono Extraordinario a Capital">
      <form onSubmit={handleSubmit} style={{ padding: '0 4px 16px' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Los abonos a capital van <strong>100% a reducir tu deuda principal</strong> y recortan directamente
          el número de cuotas restantes para que termines de pagar mucho más rápido.
        </p>

        {/* Saldo Actual */}
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
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Saldo capital actual</div>
            <div className="money tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatCOP(currentBalance)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cuotas pendientes</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
              {currentTermRemaining} cuotas
            </div>
          </div>
        </div>

        {/* Campo Valor del Abono */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Valor del Abono Extraordinario *
          </label>
          <MoneyInput
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            autoFocus
          />
        </div>

        {/* Campo Cuotas Reducidas de Plazo */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Cuotas que te redujo el banco *
            </label>
            <span style={{ fontSize: '0.72rem', color: '#fbbf24' }}>
              (Abono con reducción de plazo)
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 14,
              border: '1px solid var(--border-subtle)',
              padding: '0 16px',
              height: 52,
            }}
          >
            <input
              type="number"
              min="0"
              max={currentTermRemaining}
              value={cuotasAhorradas || ''}
              onChange={(e) => setCuotasAhorradas(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              cuotas ahorradas
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Sugerencia estimada basada en tu abono. Puedes ajustar el número exacto según tu app de AV Villas.
          </div>
        </div>

        {/* Fecha del Abono */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Fecha del Abono
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

        {/* Notas Opcionales */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Nota o Concepto (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Abono con prima de servicios / ahorro personal"
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

        {/* Vista previa del Impacto */}
        {amount > 0 && (
          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 14,
              padding: '14px 16px',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={15} />
              <span>Impacto del Abono</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#f1f5f9', lineHeight: '1.5' }}>
              <div>Nuevo saldo de capital: <strong style={{ color: '#34d399' }}>{formatCOP(nuevoSaldo)}</strong></div>
              <div>Cuotas restantes: <strong style={{ color: '#38bdf8' }}>{nuevasCuotasRestantes} de {credit.termTotal}</strong> (ahorras {cuotasAhorradas} meses)</div>
            </div>
          </div>
        )}

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
            style={{
              flex: 2,
              height: 48,
              fontSize: '0.88rem',
              fontWeight: 700,
              backgroundColor: '#f59e0b',
              color: '#000000',
              border: 'none',
            }}
          >
            {isSubmitting ? 'Registrando...' : 'Aplicar Abono a Capital'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
