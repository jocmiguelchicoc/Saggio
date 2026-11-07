import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  PieChart,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileJson,
  ChevronDown,
  ChevronUp,
  Home,
  Zap,
  Utensils,
  Car,
  CreditCard,
  Tv,
  Heart,
  GraduationCap,
  Users,
  AlertTriangle,
  Tag,
  Layers,
} from 'lucide-react';
import { calculateAnnualSummary } from '../../../core/calculations.js';
import { formatCOP } from '../../../core/formatters.js';
import { backupRepository } from '../../../data/repositories/backupRepository.js';

function getCategoryIcon(catName = '') {
  const norm = catName.toLowerCase();
  if (norm.includes('viv') || norm.includes('arrien')) return <Home size={15} />;
  if (norm.includes('serv') || norm.includes('luz') || norm.includes('agua') || norm.includes('gas') || norm.includes('inter')) return <Zap size={15} />;
  if (norm.includes('alim') || norm.includes('comid') || norm.includes('merc')) return <Utensils size={15} />;
  if (norm.includes('trans') || norm.includes('moto') || norm.includes('gasol')) return <Car size={15} />;
  if (norm.includes('tarjet') || norm.includes('credit')) return <CreditCard size={15} />;
  if (norm.includes('suscrip') || norm.includes('netfl')) return <Tv size={15} />;
  if (norm.includes('salud') || norm.includes('medic')) return <Heart size={15} />;
  if (norm.includes('educ')) return <GraduationCap size={15} />;
  if (norm.includes('fam')) return <Users size={15} />;
  if (norm.includes('imprev')) return <AlertTriangle size={15} />;
  return <Tag size={15} />;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function AnioTab({ period, data }) {
  const { selectedYear, currentRealYM } = period;
  const { cards, allCardPayments, allFixedPayments, allMoves, settings } = data;

  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState({ state: 'idle', message: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleCategory = (catName) => {
    setExpandedCategory((prev) => (prev === catName ? null : catName));
  };

  const annual = calculateAnnualSummary({
    year: selectedYear,
    cards,
    allCardPayments,
    allFixedPayments,
    allMoves,
    settings,
    currentYM: currentRealYM,
  });

  // Exportar copia de seguridad en JSON
  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const backup = await backupRepository.exportData();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `saggio-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setImportStatus({ state: 'success', message: 'Copia exportada exitosamente.' });
      setTimeout(() => setImportStatus({ state: 'idle', message: '' }), 4000);
    } catch (err) {
      setImportStatus({ state: 'error', message: 'Error al exportar: ' + err.message });
    } finally {
      setIsExporting(false);
    }
  };

  // Importar copia de seguridad desde JSON
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus({ state: 'loading', message: 'Leyendo archivo...' });
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed.data || !parsed.data.cards || !parsed.data.fixed) {
        throw new Error('El archivo no tiene el formato de copia válido de Saggio.');
      }

      await backupRepository.importData(parsed);
      setImportStatus({
        state: 'success',
        message: '¡Datos restaurados con éxito! Recargando la aplicación...',
      });

      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      setImportStatus({
        state: 'error',
        message: 'No se pudo importar la copia: ' + (err.message || 'Archivo dañado.'),
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 20 }}>
      {/* 1. Tarjeta principal anual */}
      <div className="card-hero" style={{ margin: 0 }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Total Gastado en {selectedYear}
        </div>
        <div
          className="money tabular-nums"
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#f8fafc',
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          {formatCOP(annual.totalYearSpent)}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: 14 }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Ingresos</div>
            <div className="money tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
              {formatCOP(annual.totalYearIncome)}
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: 14 }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Balance</div>
            <div
              className="money tabular-nums"
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: annual.yearBalance >= 0 ? '#38bdf8' : '#f43f5e',
                marginTop: 2,
              }}
            >
              {formatCOP(annual.yearBalance)}
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: 14 }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Promedio</div>
            <div className="money tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>
              {formatCOP(annual.monthlyAverageSpent)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sección "¿En qué lo gastaste?" (Ranking por categorías con desglose detallado) */}
      <div className="card" style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieChart size={20} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>¿En qué lo gastaste?</h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Toca para ver desglose
          </span>
        </div>

        {annual.categoriesList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '18px 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No hay gastos registrados en el año {selectedYear}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {annual.categoriesList.map((item, idx) => {
              const isExpanded = expandedCategory === item.category;
              const hasSubItems = Array.isArray(item.subItems) && item.subItems.length > 0;

              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: 14,
                    padding: '8px 10px',
                    backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                    border: isExpanded ? '1px solid var(--border-subtle)' : '1px solid transparent',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Fila principal clickeable */}
                  <div
                    onClick={() => toggleCategory(item.category)}
                    style={{
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--accent-blue)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {getCategoryIcon(item.category)}
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.category}
                        </span>
                        {hasSubItems && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            ({item.subItems.length})
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="money tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {formatCOP(item.amount)}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 34, textAlign: 'right' }}>
                          {item.percentage.toFixed(0)}%
                        </span>
                        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginLeft: 2 }}>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso de categoría */}
                    <div
                      style={{
                        height: 7,
                        borderRadius: 99,
                        backgroundColor: 'var(--bg-subtle)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(2, item.percentage))}%`,
                          borderRadius: 99,
                          background:
                            idx === 0
                              ? 'linear-gradient(90deg, #38bdf8, #0ea5e9)'
                              : idx === 1
                              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                              : idx === 2
                              ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                              : 'linear-gradient(90deg, #a855f7, #9333ea)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Desglose desplegable de la categoría */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: '12px 14px',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: 12,
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--card-inner-bevel)',
                        animation: 'fadeIn 0.2s ease-out',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                        Desglose en {item.category} ({selectedYear})
                      </div>

                      {!hasSubItems ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>
                          Sin conceptos individuales registrados.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {item.subItems.map((sub, sIdx) => (
                            <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                                  <span
                                    style={{
                                      fontSize: '0.84rem',
                                      fontWeight: 600,
                                      color: 'var(--text-primary)',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {sub.name}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      padding: '1px 6px',
                                      borderRadius: 6,
                                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                      color: 'var(--text-muted)',
                                      fontWeight: 600,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {sub.count} {sub.count === 1 ? 'pago' : 'pagos'}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                  <strong className="money tabular-nums" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                                    {formatCOP(sub.amount)}
                                  </strong>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 34, textAlign: 'right', fontWeight: 600 }}>
                                    {sub.percentage.toFixed(0)}%
                                  </span>
                                </div>
                              </div>

                              {/* Micro-barra de distribución interna */}
                              <div
                                style={{
                                  height: 4,
                                  borderRadius: 99,
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${Math.min(100, Math.max(2, sub.percentage))}%`,
                                    borderRadius: 99,
                                    backgroundColor: 'var(--accent-blue)',
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Sección "Mes a mes" (12 filas con barras proporcionales y acumulado) */}
      <div className="card" style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <BarChart3 size={20} color="var(--accent-green)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Gasto Mes a Mes</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {annual.monthData.map((m) => {
            const monthName = MONTH_NAMES[m.monthIndex - 1];
            const barWidthPercent = annual.maxMonthSpent > 0
              ? (m.spent / annual.maxMonthSpent) * 100
              : 0;

            return (
              <div
                key={m.ym}
                style={{
                  opacity: m.isFuture ? 0.4 : 1,
                  padding: '8px 10px',
                  borderRadius: 12,
                  backgroundColor: m.isFuture ? 'transparent' : 'var(--bg-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {monthName}
                    </span>
                    {m.isFuture && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>(Próximo)</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="money tabular-nums" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCOP(m.spent)}
                    </span>
                    <span
                      className="money tabular-nums"
                      style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 90, textAlign: 'right' }}
                      title="Gasto acumulado del año hasta este mes"
                    >
                      Acum: {formatCOP(m.accumulated)}
                    </span>
                  </div>
                </div>

                {/* Barra proporcional al mes con mayor gasto del año */}
                <div
                  style={{
                    height: 6,
                    borderRadius: 99,
                    backgroundColor: 'rgba(148, 163, 184, 0.15)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(0, barWidthPercent))}%`,
                      borderRadius: 99,
                      backgroundColor: m.isFuture ? 'var(--text-muted)' : 'var(--accent-blue)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Sección Copias de Seguridad (Exportar / Importar JSON) */}
      <div className="card" style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ShieldCheck size={20} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Copias de Seguridad</h3>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 14 }}>
          Tus datos se guardan de forma privada y local en tu celular/computador. Puedes descargar una copia de seguridad en JSON o restaurarla en cualquier momento.
        </p>

        {importStatus.message && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              marginBottom: 14,
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor:
                importStatus.state === 'error'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : importStatus.state === 'success'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(56, 189, 248, 0.15)',
              color:
                importStatus.state === 'error'
                  ? 'var(--accent-red)'
                  : importStatus.state === 'success'
                  ? 'var(--accent-green)'
                  : 'var(--accent-blue)',
            }}
          >
            {importStatus.state === 'error' ? (
              <AlertCircle size={16} />
            ) : importStatus.state === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <FileJson size={16} />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isExporting}
            className="btn-primary"
            style={{
              height: 48,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Download size={18} />
            <span>{isExporting ? 'Exportando...' : 'Exportar Copia'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
            style={{
              height: 48,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Upload size={18} />
            <span>Importar Copia</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
