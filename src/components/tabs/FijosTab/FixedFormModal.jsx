import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { MoneyInput } from '../../common/MoneyInput.jsx';
import { DoubleTapButton } from '../../common/DoubleTapButton.jsx';
import { FIXED_CATEGORIES, QUINCENA_LABELS } from '../../../core/constants.js';

export function FixedFormModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData = null,
  defaultQuincena = '1',
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [q, setQ] = useState(defaultQuincena);
  const [cat, setCat] = useState('Servicios');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setAmount(Number(initialData.amount) || 0);
      setQ(String(initialData.q || defaultQuincena));
      setCat(initialData.cat || 'Servicios');
    } else {
      setName('');
      setAmount(0);
      setQ(defaultQuincena);
      setCat('Servicios');
    }
    setError('');
  }, [initialData, defaultQuincena, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor escribe el nombre de la obligación fija.');
      return;
    }
    if (amount < 0) {
      setError('El valor no puede ser negativo.');
      return;
    }

    onSave({
      name: name.trim(),
      amount,
      q,
      cat,
    });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Obligación Fija' : 'Nueva Obligación Fija'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Nombre */}
        <div>
          <label
            htmlFor="fixed-name"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            Nombre de la obligación *
          </label>
          <input
            id="fixed-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Arriendo, Luz, Gasolina moto..."
            autoFocus={!isEditing}
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

        {/* Valor mensual */}
        <div>
          <label
            htmlFor="fixed-amount"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            Valor mensual habitual *
          </label>
          <MoneyInput
            id="fixed-amount"
            value={amount}
            onChange={setAmount}
            placeholder="0"
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
            Si el valor varía (como los recibos de servicios), pon el promedio o edítalo cada mes.
          </span>
        </div>

        {/* Quincena */}
        <div>
          <label
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            ¿En cuál quincena se paga? *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              onClick={() => setQ('1')}
              style={{
                height: 48,
                borderRadius: 14,
                border: q === '1' ? '2px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                backgroundColor: q === '1' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-subtle)',
                color: q === '1' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              {QUINCENA_LABELS['1']} (15 al 29)
            </button>

            <button
              type="button"
              onClick={() => setQ('2')}
              style={{
                height: 48,
                borderRadius: 14,
                border: q === '2' ? '2px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                backgroundColor: q === '2' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-subtle)',
                color: q === '2' ? 'var(--accent-amber)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              {QUINCENA_LABELS['2']} (30 al 14)
            </button>
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label
            htmlFor="fixed-cat"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            Categoría *
          </label>
          <select
            id="fixed-cat"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
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
              cursor: 'pointer',
            }}
          >
            {FIXED_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Mensaje de error si aplica */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--accent-red)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* Botones de acción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          <button type="submit" className="btn-primary" style={{ width: '100%', height: 50 }}>
            {isEditing ? 'Guardar Cambios' : 'Crear Obligación Fija'}
          </button>

          {isEditing && onDelete && (
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <DoubleTapButton
                onConfirm={() => {
                  onDelete(initialData.id);
                  onClose();
                }}
                label="Eliminar esta obligación fija"
                confirmLabel="¿Eliminar para siempre? Toca otra vez"
                style={{ width: '100%', height: 46 }}
              />
            </div>
          )}
        </div>
      </form>
    </BottomSheet>
  );
}

