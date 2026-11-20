import React from 'react';
import {
  Calendar,
  CreditCard,
  Landmark,
  TrendingDown,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { formatCOP, formatDateColombian } from '../../../core/formatters.js';

export function QuincenaDetailModal({
  isOpen,
  onClose,
  quincena = '1',
  selectedYM = '2026-11',
  quincenaData = {},
  onNavigateFijos,
}) {
  if (!isOpen) return null;

  const isQ1 = quincena === '1';
  const qTitle = isQ1 ? 'Quincena del 15' : 'Quincena del 30';
  const qDateRange = isQ1 ? 'Cubre pagos realizados del 15 al 29' : 'Cubre pagos realizados del 30 al 14';

  const {
    salary = 0,
    extraIncomes = 0,
    totalIncome = 0,
    spent = 0,
    remaining = 0,
    paidItems = [],
    extraIncomesList = [],
    contributions = 0,
    senaSupport = 0,
  } = quincenaData;

  const hasPaidItems = paidItems && paidItems.length > 0;
  const hasExtraIncomes = extraIncomesList && extraIncomesList.length > 0;

  // Icono y estilos por tipo de pago
  const getItemBadge = (item) => {
    switch (item.type) {
      case 'credito':
        return {
          icon: <Landmark size={18} />,
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: 'rgba(239, 68, 68, 0.3)',
          label: item.typeLabel || 'Crédito Bancario',
        };
      case 'tarjeta':
        return {
          icon: <CreditCard size={18} />,
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: 'rgba(245, 158, 11, 0.3)',
          label: item.typeLabel || 'Tarjeta de Crédito',
        };
      case 'imprevisto':
        return {
          icon: <TrendingDown size={18} />,
          bg: 'rgba(236, 72, 153, 0.15)',
          color: '#f472b6',
          border: 'rgba(236, 72, 153, 0.3)',
          label: 'Gasto Imprevisto',
        };
      case 'fijo':
      default:
        return {
          icon: <Calendar size={18} />,
          bg: 'rgba(56, 189, 248, 0.15)',
          color: '#38bdf8',
          border: 'rgba(56, 189, 248, 0.3)',
          label: item.typeLabel || 'Obligación Fija',
        };
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Movimientos · ${qTitle}`}>
      <div style={{ padding: '0 4px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Subtítulo con fecha */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: -6 }}>
          {qDateRange}
        </div>

        {/* 1. Mini KPIs de la Quincena */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            padding: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 16,
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Ingresos Q */}
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Ingresos Q
            </div>
            <div className="money tabular-nums" style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: 2 }}>
              {formatCOP(totalIncome)}
            </div>
          </div>

          {/* Gastado Q */}
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Gastado Q
            </div>
            <div className="money tabular-nums" style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
              {formatCOP(spent)}
            </div>
          </div>

          {/* Te queda libre */}
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Te queda
            </div>
            <div
              className="money tabular-nums"
              style={{
                fontSize: '0.98rem',
                fontWeight: 800,
                color: remaining >= 0 ? (isQ1 ? 'var(--accent-blue)' : 'var(--accent-amber)') : 'var(--accent-red)',
                marginTop: 2,
              }}
            >
              {formatCOP(remaining)}
            </div>
          </div>
        </div>

        {/* 2. Lista de Pagos Realizados en esta quincena */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pagos Realizados ({paidItems.length})
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Descontados del flujo de caja
            </span>
          </div>

          {!hasPaidItems ? (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 16,
                border: '1px dashed var(--border-subtle)',
              }}
            >
              <CheckCircle2 size={28} style={{ color: 'var(--accent-green)', opacity: 0.7, margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Sin pagos registrados aún en esta quincena
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Cuando pagues una cuota de crédito, tarjeta o gasto fijo entre el {isQ1 ? '15 y el 29' : '30 y el 14'}, aparecerá listado aquí con su fecha y monto exacto.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {paidItems.map((item) => {
                const badge = getItemBadge(item);
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 14,
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          minWidth: 38,
                          borderRadius: 10,
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {badge.icon}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              color: badge.color,
                              fontWeight: 700,
                              backgroundColor: badge.bg,
                              padding: '1px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {badge.label}
                          </span>
                          {item.date && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              • {formatDateColombian(item.date)}
                            </span>
                          )}
                          {item.notes && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                color: '#94a3b8',
                                fontStyle: 'italic',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '160px',
                              }}
                            >
                              ({item.notes})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                      <div className="money tabular-nums" style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f87171' }}>
                        -{formatCOP(item.amount)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Desglose de Ingresos de esta quincena */}
        <div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Ingresos de la Quincena
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Sueldo base */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Wallet size={16} color="var(--accent-green)" />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Sueldo fijo ({isQ1 ? 'Día 15' : 'Día 30'})
                </span>
              </div>
              <span className="money tabular-nums" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                +{formatCOP(salary)}
              </span>
            </div>

            {/* Sonda SENA si aplica en Q2 */}
            {!isQ1 && senaSupport > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Sparkles size={16} color="#38bdf8" />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Apoyo SENA - Sonda Colombia
                  </span>
                </div>
                <span className="money tabular-nums" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                  +{formatCOP(senaSupport)}
                </span>
              </div>
            )}

            {/* Aportes hermanos en Q2 */}
            {!isQ1 && contributions > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={16} color="#fbbf24" />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Aportes Arriendo Hermanos
                  </span>
                </div>
                <span className="money tabular-nums" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                  +{formatCOP(contributions)}
                </span>
              </div>
            )}

            {/* Ingresos extras registrados con fecha en esta quincena */}
            {hasExtraIncomes &&
              extraIncomesList.map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: 12,
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <ArrowUpRight size={16} color="var(--accent-green)" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {inc.name || 'Ingreso Extra'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {inc.date ? formatDateColombian(inc.date) : ''} {inc.notes ? `• ${inc.notes}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="money tabular-nums" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-green)', flexShrink: 0, marginLeft: 8 }}>
                    +{formatCOP(inc.amount)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* 4. Botón inferior para ir a Obligaciones Fijas */}
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onNavigateFijos) onNavigateFijos();
          }}
          className="btn-secondary"
          style={{
            width: '100%',
            height: 46,
            fontSize: '0.85rem',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderRadius: 14,
            marginTop: 4,
          }}
        >
          <span>Ver todas las obligaciones fijas de este mes</span>
          <ChevronRight size={18} color="var(--text-muted)" />
        </button>
      </div>
    </BottomSheet>
  );
}
