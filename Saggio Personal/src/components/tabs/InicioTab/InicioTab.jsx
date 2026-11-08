import React from 'react';
import { calculateMonthOverview } from '../../../core/calculations.js';
import { formatCOP } from '../../../core/formatters.js';
import { QUINCENA_LABELS } from '../../../core/constants.js';
import { Calendar, CreditCard, Landmark, CalendarCheck2, ArrowUpDown, ChevronRight, Wallet, ShieldCheck } from 'lucide-react';

export function InicioTab({ period, data, onNavigateTab, onOpenSettings }) {
  const { selectedYM, currentRealYM, currentRealQuincena } = period;
  const { cards, allCardPayments, fixedList, allFixedPayments, allMoves, settings, credits = [] } = data;

  const fixedPaymentsInMonth = allFixedPayments.filter((fp) => fp.ym === selectedYM);
  const movesInMonth = allMoves.filter((m) => m.date && m.date.startsWith(selectedYM));

  const overview = calculateMonthOverview({
    cards,
    allCardPayments,
    fixedList,
    fixedPaymentsInMonth,
    movesInMonth,
    settings,
    ym: selectedYM,
    currentYM: currentRealYM,
  });

  const isCurrentMonth = selectedYM === currentRealYM;

  // Datos reales de Quincena del 15
  const q1 = overview.q1;
  const hasSalaryQ1 = q1.salary > 0;
  const spentPercentQ1 = q1.totalIncome > 0 ? Math.min(100, Math.round((q1.spent / q1.totalIncome) * 100)) : 0;

  // Datos reales de Quincena del 30
  const q2 = overview.q2;
  const hasSalaryQ2 = q2.salary > 0;
  const spentPercentQ2 = q2.totalIncome > 0 ? Math.min(100, Math.round((q2.spent / q2.totalIncome) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. Tarjeta principal del mes: Estilo Fintech Hero (Stitch AI / Linear) */}
      <div className="card-hero" style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src="/brand/saggio-isotipo.png"
              alt="Saggio"
              style={{ width: 24, height: 24, objectFit: 'contain', filter: 'drop-shadow(0 2px 5px rgba(16, 185, 129, 0.3))' }}
            />
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Te queda este mes
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#38bdf8',
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
          >
            <Wallet size={14} />
            <span>{hasSalaryQ1 || hasSalaryQ2 ? 'Editar Sueldo' : '+ Configurar Sueldo'}</span>
          </button>
        </div>

        <div
          className="money tabular-nums"
          style={{
            fontSize: '2.6rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: overview.remainingThisMonth >= 0 ? '#38bdf8' : '#f43f5e',
            lineHeight: 1.1,
            marginBottom: 20,
            textShadow: overview.remainingThisMonth >= 0 ? '0 0 28px rgba(56, 189, 248, 0.3)' : '0 0 28px rgba(244, 63, 94, 0.3)',
          }}
        >
          {formatCOP(overview.remainingThisMonth)}
        </div>

        {/* 2 Columnas: Ingresos y Gastado del mes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px 14px', borderRadius: 16 }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ingresos del mes
            </div>
            <div className="money tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
              {formatCOP(overview.totalIncome)}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Sueldo + aportes + extras</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px 14px', borderRadius: 16 }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Gastado del mes
            </div>
            <div className="money tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
              {formatCOP(overview.totalSpent)}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Lo que has pagado</span>
          </div>
        </div>
      </div>

      {/* Línea informativa de deuda total en tarjetas */}
      <div
        onClick={() => onNavigateTab && onNavigateTab('tarjetas')}
        className="card"
        style={{
          padding: '14px 18px',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderRadius: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: 'var(--accent-amber-subtle)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={18} />
          </div>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Deuda total en tarjetas de crédito:
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong className="money tabular-nums" style={{ color: 'var(--accent-amber)', fontWeight: 800, fontSize: '0.98rem' }}>
            {formatCOP(overview.totalCardDebt)}
          </strong>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Control por Quincenas
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {isCurrentMonth ? `Hoy en Quincena ${currentRealQuincena}` : 'Mes visualizado'}
        </span>
      </div>

      {/* 2. Bloque Quincena del 15 */}
      <div
        className="card"
        style={{
          borderRadius: 22,
          padding: '18px',
          margin: 0,
          border: isCurrentMonth && currentRealQuincena === '1' ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid var(--border-subtle)',
          boxShadow: isCurrentMonth && currentRealQuincena === '1' ? '0 0 20px rgba(56, 189, 248, 0.12)' : 'var(--card-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'var(--accent-blue-subtle)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Quincena del 15
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Sueldo del 15 · Cubre pagos del 15 al 29
              </span>
            </div>
          </div>
          {isCurrentMonth && currentRealQuincena === '1' && (
            <span className="badge badge-now">En curso</span>
          )}
        </div>

        {/* Cifra destacada: Te queda en la Quincena del 15 */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Te queda en esta quincena
          </div>
          <div
            className="money tabular-nums"
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: q1.remaining >= 0 ? 'var(--accent-blue)' : 'var(--accent-red)',
              lineHeight: 1.15,
              marginTop: 2,
            }}
          >
            {formatCOP(q1.remaining)}
          </div>
        </div>

        {/* Micro-barra de progreso de consumo de la quincena */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>Consumo de la quincena</span>
            <span className="tabular-nums" style={{ fontWeight: 700 }}>{spentPercentQ1}% gastado</span>
          </div>
          <div className="progress-container" style={{ margin: 0, height: 6 }}>
            <div
              className="progress-bar"
              style={{
                width: `${spentPercentQ1}%`,
                background: spentPercentQ1 > 85 ? 'var(--accent-red)' : 'var(--accent-blue)',
              }}
            />
          </div>
        </div>

        {/* Detalle de Ingresos vs Gastado de la Quincena 15 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 10,
            padding: '12px 14px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 16,
            marginBottom: 14,
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Ingresos Q15</div>
            <div className="money tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: 2 }}>
              {formatCOP(q1.totalIncome)}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
              <span>• Sueldo fijo: {formatCOP(q1.salary)}</span>
              {q1.extraIncomes > 0 && <span>• Extras: +{formatCOP(q1.extraIncomes)}</span>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Gastado Q15</div>
            <div className="money tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
              {formatCOP(q1.spent)}
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
              {q1.spent > 0 ? 'Pagos realizados' : 'Sin pagos aún'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('fijos')}
          className="btn-secondary"
          style={{ width: '100%', height: 44, fontSize: '0.84rem', justifyContent: 'space-between', padding: '0 16px', borderRadius: 12 }}
        >
          <span>Ver pagos de Quincena del 15 en Fijos</span>
          <ChevronRight size={16} color="var(--text-muted)" />
        </button>
      </div>

      {/* 3. Bloque Quincena del 30 */}
      <div
        className="card"
        style={{
          borderRadius: 22,
          padding: '18px',
          margin: 0,
          border: isCurrentMonth && currentRealQuincena === '2' ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid var(--border-subtle)',
          boxShadow: isCurrentMonth && currentRealQuincena === '2' ? '0 0 20px rgba(245, 158, 11, 0.12)' : 'var(--card-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'var(--accent-amber-subtle)',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Quincena del 30
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Sueldo del 30 · Cubre pagos del 30 al 14
              </span>
            </div>
          </div>
          {isCurrentMonth && currentRealQuincena === '2' && (
            <span className="badge" style={{ backgroundColor: 'var(--accent-amber-subtle)', color: 'var(--accent-amber)', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
              En curso
            </span>
          )}
        </div>

        {/* Cifra destacada: Te queda en la Quincena del 30 */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Te queda en esta quincena
          </div>
          <div
            className="money tabular-nums"
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: q2.remaining >= 0 ? 'var(--accent-amber)' : 'var(--accent-red)',
              lineHeight: 1.15,
              marginTop: 2,
            }}
          >
            {formatCOP(q2.remaining)}
          </div>
        </div>

        {/* Micro-barra de progreso de consumo de la quincena */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>Consumo de la quincena</span>
            <span className="tabular-nums" style={{ fontWeight: 700 }}>{spentPercentQ2}% gastado</span>
          </div>
          <div className="progress-container" style={{ margin: 0, height: 6 }}>
            <div
              className="progress-bar"
              style={{
                width: `${spentPercentQ2}%`,
                background: spentPercentQ2 > 85 ? 'var(--accent-red)' : 'var(--accent-amber)',
              }}
            />
          </div>
        </div>

        {/* Detalle de Ingresos vs Gastado de la Quincena 30 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 10,
            padding: '12px 14px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 16,
            marginBottom: 14,
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Ingresos Q30</div>
            <div className="money tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: 2 }}>
              {formatCOP(q2.totalIncome)}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
              <span>• Sueldo fijo: {formatCOP(q2.salary)}</span>
              {q2.sena > 0 && <span>• Sonda Colombia: {formatCOP(q2.sena)}</span>}
              {q2.contributions > 0 && <span>• Hermanos arriendo: {formatCOP(q2.contributions)}</span>}
              {q2.extraIncomes > 0 && <span>• Extras: +{formatCOP(q2.extraIncomes)}</span>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Gastado Q30</div>
            <div className="money tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
              {formatCOP(q2.spent)}
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
              {q2.spent > 0 ? 'Arriendo y cuentas' : 'Sin pagos aún'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('fijos')}
          className="btn-secondary"
          style={{ width: '100%', height: 44, fontSize: '0.84rem', justifyContent: 'space-between', padding: '0 16px', borderRadius: 12 }}
        >
          <span>Ver pagos de Quincena del 30 en Fijos</span>
          <ChevronRight size={16} color="var(--text-muted)" />
        </button>
      </div>

      {/* 4. Accesos directos a tus cuentas */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: 6, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
        Acceso directo a tus cuentas
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Tarjetas */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('tarjetas')}
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            margin: 0,
            cursor: 'pointer',
            borderRadius: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: 'var(--accent-blue-subtle)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700 }}>Tarjetas de Crédito</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {overview.cardsSummary.totalPendingThisMonth > 0
                  ? `Cuotas pendientes este mes: ${formatCOP(overview.cardsSummary.totalPendingThisMonth)}`
                  : 'Todas las cuotas al día'}
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        {/* Crédito Banco AV Villas */}
        {credits && credits.length > 0 && (
          <div
            onClick={() => onNavigateTab && onNavigateTab('tarjetas', 'creditos')}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 18px',
              margin: 0,
              cursor: 'pointer',
              borderRadius: 18,
              border: '1px solid rgba(59, 130, 246, 0.25)',
              backgroundColor: 'rgba(19, 29, 46, 0.65)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Landmark size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>
                  Créditos Bancarios
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {credits[0].bank || 'Banco AV Villas'}: Saldo <strong style={{ color: '#38bdf8' }}>{formatCOP(credits[0].currentBalance)}</strong> · Cuotas: {credits[0].currentTermPaid}/{credits[0].termTotal} ({credits[0].currentTermRemaining} restantes)
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#34d399',
                  fontWeight: 700,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  padding: '2px 8px',
                  borderRadius: 999,
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                Al día
              </span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          </div>
        )}

        {/* Fijos */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('fijos')}
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            margin: 0,
            cursor: 'pointer',
            borderRadius: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: 'var(--accent-green-subtle)',
                color: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarCheck2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700 }}>Obligaciones Fijas</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {overview.fixedSummary.countPaid} de {overview.fixedSummary.countTotal} pagadas este mes
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        {/* Extras */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('extras')}
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            margin: 0,
            cursor: 'pointer',
            borderRadius: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: 'var(--accent-purple-subtle)',
                color: 'var(--accent-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowUpDown size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700 }}>Extras e Imprevistos</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {overview.extraIncomes > 0 || overview.unexpectedSpentThisMonth > 0
                  ? `Extras: +${formatCOP(overview.extraIncomes)} · Imprevistos: -${formatCOP(overview.unexpectedSpentThisMonth)}`
                  : 'Registra imprevistos o plata extra'}
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
}
