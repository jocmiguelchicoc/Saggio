import React from 'react';
import { CreditCard, Edit3, History, PlusCircle, CheckCircle2, Wifi } from 'lucide-react';
import { formatCOP } from '../../../core/formatters.js';
import { QUINCENA_LABELS, CARD_PAYMENT_TYPES } from '../../../core/constants.js';

export function CardVisualItem({
  card,
  payments = [],
  monthStatus,
  onPayQuota,
  onAbonar,
  onCargo,
  onHistory,
  onEdit,
}) {
  const currentBalance = monthStatus ? monthStatus.currentBalance : 0;
  const isPaidOff = currentBalance <= 0;

  // Totales históricos
  let totalDeudaHistorica = Number(card.initial) || 0;
  let totalPagado = 0;
  let totalCuotas = 0;
  let totalAbonos = 0;
  let totalCargos = 0;

  for (const p of payments) {
    const amt = Number(p.amount) || 0;
    if (p.type === CARD_PAYMENT_TYPES.CARGO) {
      totalDeudaHistorica += amt;
      totalCargos += amt;
    } else if (p.type === CARD_PAYMENT_TYPES.CUOTA) {
      totalPagado += amt;
      totalCuotas += amt;
    } else if (p.type === CARD_PAYMENT_TYPES.ABONO) {
      totalPagado += amt;
      totalAbonos += amt;
    }
  }

  const percentPaid = totalDeudaHistorica > 0
    ? Math.min(100, Math.round((totalPagado / totalDeudaHistorica) * 100))
    : 100;

  // Detección de marca / estilo de tarjeta para acabado metálico
  const cardNameLower = (card.name || '').toLowerCase();
  const isAmex = cardNameLower.includes('american') || cardNameLower.includes('amex');
  const isVisa = cardNameLower.includes('visa');
  const isMaster = cardNameLower.includes('master');

  const cardGradient = isPaidOff
    ? 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)'
    : isAmex
    ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)'
    : isVisa
    ? 'linear-gradient(135deg, #111e38 0%, #0a1120 100%)'
    : isMaster
    ? 'linear-gradient(135deg, #241424 0%, #120b18 100%)'
    : 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)';

  const cardAccentColor = isPaidOff
    ? 'var(--accent-green)'
    : isAmex
    ? '#38bdf8'
    : isVisa
    ? '#60a5fa'
    : isMaster
    ? '#f43f5e'
    : 'var(--accent-blue)';

  return (
    <div
      className="card"
      style={{
        background: cardGradient,
        border: isPaidOff
          ? '1px solid rgba(16, 185, 129, 0.3)'
          : `1px solid rgba(255, 255, 255, 0.1)`,
        borderRadius: 24,
        padding: '22px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isPaidOff
          ? '0 10px 25px rgba(0,0,0,0.4)'
          : `0 14px 34px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
      }}
    >
      {/* Brillo sutil de fondo metálico */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: 999,
          background: `radial-gradient(circle, ${cardAccentColor}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Cabecera de la tarjeta: Chip EMV, Nombre y Botón Editar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Chip EMV simulado */}
          <div
            style={{
              width: 32,
              height: 22,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)',
              border: '1px solid rgba(251, 191, 36, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
              position: 'relative',
            }}
          >
            <div style={{ width: '60%', height: '40%', border: '1px solid rgba(0,0,0,0.25)', borderRadius: 2 }} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {card.name}
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Corte / Pago habitual: {QUINCENA_LABELS[card.q || '1']}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onEdit(card)}
          aria-label="Editar tarjeta"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-secondary)',
            width: 38,
            height: 38,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Edit3 size={16} />
        </button>
      </div>

      {/* Saldo actual y estado de amortización */}
      <div style={{ margin: '14px 0 12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Saldo actual pendiente
          </span>
          {isPaidOff ? (
            <span className="badge badge-paid">
              <CheckCircle2 size={12} /> Saldo Cero
            </span>
          ) : (
            <span style={{ fontSize: '0.78rem', color: cardAccentColor, fontWeight: 700 }}>
              {percentPaid}% amortizado
            </span>
          )}
        </div>

        <div
          className="money tabular-nums"
          style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: isPaidOff ? 'var(--accent-green)' : '#f8fafc',
            lineHeight: 1.1,
          }}
        >
          {formatCOP(currentBalance)}
        </div>
      </div>

      {/* Barra de progreso de amortización */}
      <div className="progress-container" style={{ height: 6, margin: '10px 0 16px 0' }}>
        <div
          className="progress-bar"
          style={{
            width: `${percentPaid}%`,
            background: isPaidOff ? 'var(--accent-green)' : `linear-gradient(90deg, ${cardAccentColor}, #0284c7)`,
          }}
        />
      </div>

      {/* Resumen de movimientos de la tarjeta */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          padding: '12px 14px',
          borderRadius: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Deuda inicial</div>
          <div className="money tabular-nums" style={{ fontSize: '0.94rem', fontWeight: 700 }}>
            {formatCOP(card.initial)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nuevos préstamos</div>
          <div className="money tabular-nums" style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--accent-red)' }}>
            +{formatCOP(totalCargos)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cuotas pagadas</div>
          <div className="money tabular-nums" style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--accent-green)' }}>
            -{formatCOP(totalCuotas)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Abonos a capital</div>
          <div className="money tabular-nums" style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
            -{formatCOP(totalAbonos)}
          </div>
        </div>
      </div>

      {/* Botones de acción táctiles (≥ 44px de altura) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => onPayQuota(card)}
          disabled={isPaidOff}
          className="btn-primary"
          style={{
            height: 48,
            fontSize: '0.9rem',
            opacity: isPaidOff ? 0.45 : 1,
            cursor: isPaidOff ? 'not-allowed' : 'pointer',
          }}
        >
          Pagar cuota
        </button>

        <button
          type="button"
          onClick={() => onAbonar(card)}
          disabled={isPaidOff}
          className="btn-secondary"
          style={{
            height: 48,
            fontSize: '0.9rem',
            color: 'var(--accent-purple)',
            borderColor: 'rgba(139, 92, 246, 0.35)',
            opacity: isPaidOff ? 0.45 : 1,
            cursor: isPaidOff ? 'not-allowed' : 'pointer',
          }}
        >
          Abonar
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          type="button"
          onClick={() => onCargo(card)}
          className="btn-secondary"
          style={{
            height: 44,
            fontSize: '0.84rem',
            color: 'var(--accent-red)',
            borderColor: 'rgba(244, 63, 94, 0.35)',
          }}
        >
          <PlusCircle size={16} />
          <span>Prestar / Usar</span>
        </button>

        <button
          type="button"
          onClick={() => onHistory(card)}
          className="btn-secondary"
          style={{
            height: 44,
            fontSize: '0.84rem',
          }}
        >
          <History size={16} />
          <span>Historial ({payments.length})</span>
        </button>
      </div>
    </div>
  );
}
