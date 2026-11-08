import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { MoneyInput } from '../../common/MoneyInput.jsx';
import { DoubleTapButton } from '../../common/DoubleTapButton.jsx';
import { QUINCENA_LABELS } from '../../../core/constants.js';

export function CardFormModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData = null,
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [name, setName] = useState('');
  const [initialDebt, setInitialDebt] = useState(0);
  const [q, setQ] = useState('1');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setInitialDebt(Number(initialData.initial) || 0);
      setQ(String(initialData.q || '1'));
    } else {
      setName('');
      setInitialDebt(0);
      setQ('1');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor escribe el nombre de la tarjeta.');
      return;
    }
    if (initialDebt < 0) {
      setError('La deuda inicial no puede ser negativa.');
      return;
    }

    onSave({
      name: name.trim(),
      initial: initialDebt,
      monthly: 0,
      q,
    });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Nombre de la tarjeta */}
        <div>
          <label
            htmlFor="card-name"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            Nombre de la tarjeta *
          </label>
          <input
            id="card-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. American Express (*2900)"
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

        {/* Deuda inicial */}
        <div>
          <label
            htmlFor="card-initial"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            Deuda actual inicial *
          </label>
          <MoneyInput
            id="card-initial"
            value={initialDebt}
            onChange={setInitialDebt}
            placeholder="0"
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
            Lo que debes hoy en esta tarjeta según tu extracto o app del banco.
          </span>
        </div>

        {/* Quincena de pago */}
        <div>
          <label
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            ¿En cuál quincena sueles pagarla?
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
              {QUINCENA_LABELS['1']} (días 15 al 29)
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
              {QUINCENA_LABELS['2']} (días 30 al 14)
            </button>
          </div>
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
            {isEditing ? 'Guardar Cambios' : 'Crear Tarjeta'}
          </button>

          {isEditing && onDelete && (
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <DoubleTapButton
                onConfirm={() => {
                  onDelete(initialData.id);
                  onClose();
                }}
                label="Eliminar esta tarjeta"
                confirmLabel="¿Eliminar tarjeta y sus pagos? Toca otra vez"
                style={{ width: '100%', height: 46 }}
              />
            </div>
          )}
        </div>
      </form>
    </BottomSheet>
  );
}
