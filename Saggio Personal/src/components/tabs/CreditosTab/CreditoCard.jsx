import React from 'react';
import { Landmark, FileText, Zap, DollarSign, Sliders, History, CheckCircle2, ShieldCheck, TrendingDown } from 'lucide-react';
import { formatCOP } from '../../../core/formatters.js';
import { calculateCreditMetrics } from '../../../core/calculations.js';

export function CreditoCard({
  credit,
  payments = [],
  onOpenUpload,
  onOpenAbono,
  onOpenPay,
  onOpenAdjust,
  onOpenHistory,
}) {
  const metrics = calculateCreditMetrics(credit, payments);

  if (!metrics) return null;

  const {
    originalAmount,
    currentBalance,
    capitalAmortizado,
    termTotal,
    termPaid,
    termRemaining,
    porcentajePagado,
    totalCuotasAhorradas,
    nextMonthInterest,
    insuranceMonthly,
    estimatedQuota,
    estimatedCapital,
  } = metrics;

  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(145deg, #131d2e 0%, #0d1522 100%)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 24,
        padding: '24px',
        position: 'relative',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
        marginBottom: 20,
      }}
    >
      {/* Cabecera del Banco y Estado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171',
            }}
          >
            <Landmark size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {credit.name || 'Crédito Banco AV Villas'}
              </h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              No. {credit.accountNumber || '34822625'} · Tasa {credit.rateEA || 24.9}% E.A.
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            borderRadius: 999,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          <ShieldCheck size={14} />
          <span>Al día</span>
        </div>
      </div>

      {/* Saldo Capital Actual */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Saldo de Capital Actual
        </div>
        <div
          className="money tabular-nums"
          style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.5px',
            marginTop: 4,
          }}
        >
          {formatCOP(currentBalance)}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: 2 }}>
          Monto original: {formatCOP(originalAmount)} · Pagado a capital: <strong style={{ color: '#34d399' }}>{formatCOP(capitalAmortizado)}</strong>
        </div>
      </div>

      {/* Barra de Progreso de Cuotas */}
      <div style={{ marginBottom: 22, backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '14px 16px', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>
            Cuotas: {termPaid} de {termTotal} pagadas ({porcentajePagado}%)
          </span>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
            Faltan {termRemaining} cuotas
          </span>
        </div>

        {/* Track y barra */}
        <div
          style={{
            width: '100%',
            height: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${porcentajePagado}%`,
              background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
              borderRadius: 999,
              transition: 'width 0.4s ease-out',
            }}
          />
        </div>

        {totalCuotasAhorradas > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 10,
              fontSize: '0.75rem',
              color: '#fbbf24',
              fontWeight: 600,
            }}
          >
            <Zap size={14} />
            <span>
              ¡Has adelantado <strong>{totalCuotasAhorradas} cuotas</strong> de plazo gracias a tus abonos a capital!
            </span>
          </div>
        )}
      </div>

      {/* Grid de Métricas de la Próxima Cuota */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 14,
            padding: '12px 14px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
            Próxima cuota estimada
          </div>
          <div className="money tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>
            {formatCOP(estimatedQuota)}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
            Vence: {credit.nextDueDate || '02 de Diciembre de 2026'}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 14,
            padding: '12px 14px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
            Desglose cuota próx.
          </div>
          <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: 4, lineHeight: '1.4' }}>
            <div>Capital: <strong style={{ color: '#34d399' }}>{formatCOP(estimatedCapital)}</strong></div>
            <div>Interés: <span style={{ color: '#f87171' }}>{formatCOP(nextMonthInterest)}</span></div>
            <div>Seguros: <span style={{ color: '#94a3b8' }}>{formatCOP(insuranceMonthly)}</span></div>
          </div>
        </div>
      </div>

      {/* Botonera de Acciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {/* Subir Extracto PDF */}
        <button
          type="button"
          onClick={onOpenUpload}
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 46,
            borderRadius: 14,
            border: '1px solid rgba(59, 130, 246, 0.4)',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <FileText size={18} />
          <span>Subir Extracto PDF (Recalibrar)</span>
        </button>

        {/* Abono a Capital */}
        <button
          type="button"
          onClick={onOpenAbono}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            height: 42,
            borderRadius: 12,
            border: '1px solid rgba(245, 158, 11, 0.35)',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            color: '#fbbf24',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          <Zap size={16} />
          <span>Abono a Capital</span>
        </button>

        {/* Registrar Cuota Mensual */}
        <button
          type="button"
          onClick={onOpenPay}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            height: 42,
            borderRadius: 12,
            border: '1px solid rgba(16, 185, 129, 0.35)',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: '#34d399',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          <DollarSign size={16} />
          <span>Pagar Cuota</span>
        </button>

        {/* Ajustar Saldo / Cuotas */}
        <button
          type="button"
          onClick={onOpenAdjust}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            height: 38,
            borderRadius: 12,
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          <Sliders size={15} />
          <span>Ajustar Manual</span>
        </button>

        {/* Historial de Pagos */}
        <button
          type="button"
          onClick={onOpenHistory}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            height: 38,
            borderRadius: 12,
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          <History size={15} />
          <span>Historial ({payments.length})</span>
        </button>
      </div>
    </div>
  );
}
