import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Settings } from 'lucide-react';

export function Header({
  activeTab,
  monthLabel,
  selectedYear,
  onPrev,
  onNext,
  onReset,
  onOpenSettings,
  isCurrentPeriod,
}) {
  const isAnioTab = activeTab === 'anio';
  const displayTitle = isAnioTab ? `Año ${selectedYear}` : monthLabel;

  return (
    <header className="app-header">
      <button
        type="button"
        className="header-arrow-btn"
        onClick={onPrev}
        aria-label="Anterior"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        type="button"
        className="header-title-btn"
        onClick={onReset}
        title="Toca para volver al período actual"
      >
        <span>{displayTitle}</span>
        {!isCurrentPeriod && (
          <span style={{ fontSize: '0.75rem', opacity: 0.7, display: 'inline-flex', alignItems: 'center' }}>
            <RotateCcw size={14} style={{ marginLeft: 4 }} />
          </span>
        )}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          className="header-arrow-btn"
          onClick={onNext}
          aria-label="Siguiente"
        >
          <ChevronRight size={24} />
        </button>

        {onOpenSettings && (
          <button
            type="button"
            className="header-arrow-btn"
            onClick={onOpenSettings}
            title="Configurar mi sueldo"
            aria-label="Configurar sueldo"
            style={{ color: 'var(--accent-blue)' }}
          >
            <Settings size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
