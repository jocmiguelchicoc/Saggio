import React from 'react';
import { History, Zap, DollarSign, FileCheck, Trash2, Calendar } from 'lucide-react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { formatCOP } from '../../../core/formatters.js';

export function CreditHistoryModal({
  isOpen,
  onClose,
  credit,
  payments = [],
  onDeletePayment,
}) {
  if (!credit) return null;

  // Ordenar cronológicamente descendente (más reciente primero)
  const sortedPayments = [...payments].sort((a, b) => {
    const da = a.date || a.createdAt || '';
    const db = b.date || b.createdAt || '';
    return db.localeCompare(da);
  });

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Historial del Crédito">
      <div style={{ padding: '0 4px 16px' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Registro completo de cuotas ordinarias, abonos extraordinarios a capital y calibraciones
          oficiales de extractos.
        </p>

        {sortedPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            No hay pagos registrados aún para este crédito.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedPayments.map((p) => {
              const isAbono = p.type === 'abono';
              const isExtracto = p.type === 'sincronizacion_extracto';
              const isAjuste = p.type === 'ajuste_manual';

              const badgeColor = isAbono
                ? '#fbbf24'
                : isExtracto
                ? '#a855f7'
                : isAjuste
                ? '#94a3b8'
                : '#34d399';

              const badgeBg = isAbono
                ? 'rgba(245, 158, 11, 0.12)'
                : isExtracto
                ? 'rgba(168, 85, 247, 0.12)'
                : isAjuste
                ? 'rgba(148, 163, 184, 0.12)'
                : 'rgba(16, 185, 129, 0.12)';

              const typeLabel = isAbono
                ? '⚡ Abono a Capital'
                : isExtracto
                ? '📄 Sincronización Extracto'
                : isAjuste
                ? '⚙️ Ajuste Manual'
                : '💵 Cuota Ordinaria';

              return (
                <div
                  key={p.id || p.createdAt || Math.random()}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 16,
                    padding: '14px 16px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      {typeLabel}
                    </span>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.date || (p.createdAt && p.createdAt.slice(0, 10)) || ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      {Number(p.amount) > 0 ? (
                        <span className="money tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {formatCOP(p.amount)}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          Calibración
                        </span>
                      )}
                    </div>

                    {p.saldoResultante !== undefined && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Saldo posterior: <strong style={{ color: 'var(--text-primary)' }}>{formatCOP(p.saldoResultante)}</strong>
                      </span>
                    )}
                  </div>

                  {/* Cuotas ahorradas o pagadas */}
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {p.cuotasAhorradas ? (
                      <strong style={{ color: '#fbbf24' }}>
                        ¡Recortó {p.cuotasAhorradas} cuotas de plazo! (Quedaron {p.cuotasPendientes || credit.termTotal - (p.cuotasPagadas || 0)} pendientes)
                      </strong>
                    ) : p.cuotasPagadas ? (
                      <span>
                        Progreso: Cuota {p.cuotasPagadas} de {credit.termTotal}
                      </span>
                    ) : null}
                  </div>

                  {/* Notas */}
                  {p.notes && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {p.notes}
                    </div>
                  )}

                  {/* Botón de borrar registro si tiene id */}
                  {p.id && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('¿Seguro que deseas eliminar este registro del historial?')) {
                            onDeletePayment(p.id);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.72rem',
                          padding: '4px 6px',
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Eliminar registro</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ width: '100%', height: 46, fontSize: '0.85rem' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

