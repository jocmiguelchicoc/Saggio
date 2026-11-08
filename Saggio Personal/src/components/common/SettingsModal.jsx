import React, { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet.jsx';
import { MoneyInput } from './MoneyInput.jsx';
import { getCurrentColombiaYM } from '../../core/formatters.js';

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) {
  const [q1, setQ1] = useState(0);
  const [q2, setQ2] = useState(0);
  const [contributionsQ2, setContributionsQ2] = useState(600000); // 600k por defecto de hermanos
  const [senaQ2, setSenaQ2] = useState(1300000); // 1.3M patrocinio Sonda Colombia SENA
  const [senaUntil, setSenaUntil] = useState('2027-04'); // hasta abril 2027
  const [since, setSince] = useState(() => getCurrentColombiaYM());

  useEffect(() => {
    if (settings) {
      setQ1(Number(settings.q1) || 0);
      setQ2(Number(settings.q2) || 0);
      setContributionsQ2(
        settings.contributionsQ2 !== undefined ? Number(settings.contributionsQ2) : 600000
      );
      setSenaQ2(
        settings.senaQ2 !== undefined ? Number(settings.senaQ2) : 1300000
      );
      setSenaUntil(settings.senaUntil || '2027-04');
      setSince(settings.since || getCurrentColombiaYM());
    } else {
      setQ1(0);
      setQ2(0);
      setContributionsQ2(600000);
      setSenaQ2(1300000);
      setSenaUntil('2027-04');
      setSince(getCurrentColombiaYM());
    }
  }, [settings, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      q1,
      q2,
      contributionsQ2,
      senaQ2,
      senaUntil: senaUntil || '2027-04',
      since: since || getCurrentColombiaYM(),
    });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Configuración de mi Sueldo e Ingresos">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Configura tus ingresos fijos habituales. De aquí se irá descontando automáticamente lo que pagas para saber exactamente cuánta plata te va quedando libre.
        </p>

        {/* Sueldo Quincena 15 */}
        <div>
          <label
            htmlFor="salary-q1"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            Mi sueldo de la Quincena del 15 *
          </label>
          <MoneyInput
            id="salary-q1"
            value={q1}
            onChange={setQ1}
            placeholder="0"
          />
        </div>

        {/* Sueldo Quincena 30 */}
        <div>
          <label
            htmlFor="salary-q2"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            Mi sueldo de la Quincena del 30 *
          </label>
          <MoneyInput
            id="salary-q2"
            value={q2}
            onChange={setQ2}
            placeholder="0"
          />
        </div>

        {/* Aporte arriendo hermanos en Quincena 30 */}
        <div>
          <label
            htmlFor="salary-contrib"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}
          >
            Aporte arriendo de mis hermanos (Quincena del 30)
          </label>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
            $300.000 de tu hermana + $300.000 de tu hermano = $600.000 para el arriendo.
          </span>
          <MoneyInput
            id="salary-contrib"
            value={contributionsQ2}
            onChange={setContributionsQ2}
            placeholder="600000"
          />
        </div>

        {/* Apoyo sostenimiento SENA · Sonda Colombia (Quincena 30) */}
        <div>
          <label
            htmlFor="salary-sena"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}
          >
            Apoyo SENA · Sonda Colombia (Quincena del 30)
          </label>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
            75% del sostenimiento de etapa lectiva patrocinada. Activo hasta abril 2027.
          </span>
          <MoneyInput
            id="salary-sena"
            value={senaQ2}
            onChange={setSenaQ2}
            placeholder="1300000"
          />
        </div>

        {/* Hasta qué mes llega el apoyo SENA */}
        <div>
          <label
            htmlFor="salary-sena-until"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}
          >
            Vigencia apoyo Sonda Colombia hasta el mes:
          </label>
          <input
            id="salary-sena-until"
            type="month"
            value={senaUntil}
            onChange={(e) => setSenaUntil(e.target.value)}
            style={{
              width: '100%',
              height: 52,
              padding: '0 16px',
              borderRadius: 14,
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 600,
              outline: 'none',
            }}
          />
        </div>

        {/* Contar desde el mes */}
        <div>
          <label
            htmlFor="salary-since"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            Contar estos ingresos fijos desde el mes:
          </label>
          <input
            id="salary-since"
            type="month"
            value={since}
            onChange={(e) => setSince(e.target.value)}
            style={{
              width: '100%',
              height: 52,
              padding: '0 16px',
              borderRadius: 14,
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 600,
              outline: 'none',
            }}
          />
        </div>

        {/* Botón Guardar */}
        <div style={{ marginTop: 10 }}>
          <button type="submit" className="btn-primary" style={{ width: '100%', height: 50 }}>
            Guardar Configuración
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
