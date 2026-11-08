import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { MoneyInput } from '../../common/MoneyInput.jsx';
import { DoubleTapButton } from '../../common/DoubleTapButton.jsx';
import { getCurrentColombiaDate } from '../../../core/formatters.js';
import { UNEXPECTED_CATEGORIES, EXTRA_INCOME_CATEGORIES } from '../../../core/constants.js';

export function MoveFormModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData = null,
  defaultKind = 'ingreso', // 'ingreso' | 'imprevisto'
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [kind, setKind] = useState(defaultKind);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [cat, setCat] = useState('');
  const [date, setDate] = useState(() => getCurrentColombiaDate());
  const [error, setError] = useState('');

  const isIngreso = kind === 'ingreso';
  const categoriesList = isIngreso ? EXTRA_INCOME_CATEGORIES : UNEXPECTED_CATEGORIES;

  useEffect(() => {
    if (initialData) {
      setKind(initialData.kind || defaultKind);
      setName(initialData.name || '');
      setAmount(Number(initialData.amount) || 0);
      setCat(initialData.cat || (initialData.kind === 'ingreso' ? EXTRA_INCOME_CATEGORIES[0] : UNEXPECTED_CATEGORIES[0]));
      setDate(initialData.date || getCurrentColombiaDate());
    } else {
      setKind(defaultKind);
      setName('');
      setAmount(0);
      setCat(defaultKind === 'ingreso' ? EXTRA_INCOME_CATEGORIES[0] : UNEXPECTED_CATEGORIES[0]);
      setDate(getCurrentColombiaDate());
    }
    setError('');
  }, [initialData, defaultKind, isOpen]);

  // Si cambia el tipo, ajustar la categoría por defecto
  const handleKindChange = (newKind) => {
    setKind(newKind);
    setCat(newKind === 'ingreso' ? EXTRA_INCOME_CATEGORIES[0] : UNEXPECTED_CATEGORIES[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Escribe el concepto o descripción.');
      return;
    }
    if (amount <= 0) {
      setError('Ingresa un valor mayor a $0.');
      return;
    }
    if (!date) {
      setError('Selecciona una fecha.');
      return;
    }

    onSave({
      kind,
      name: name.trim(),
      amount,
      cat: cat || (isIngreso ? 'Otro' : 'Otros'),
      date,
    });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Movimiento' : isIngreso ? 'Nuevo Ingreso Extra' : 'Nuevo Imprevisto'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Selector de Tipo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            type="button"
            onClick={() => handleKindChange('ingreso')}
            style={{
              height: 46,
              borderRadius: 14,
              border: isIngreso ? '2px solid var(--accent-green)' : '1px solid var(--border-subtle)',
              backgroundColor: isIngreso ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-subtle)',
              color: isIngreso ? 'var(--accent-green)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            + Ingreso Extra
          </button>

          <button
            type="button"
            onClick={() => handleKindChange('imprevisto')}
            style={{
              height: 46,
              borderRadius: 14,
              border: !isIngreso ? '2px solid var(--accent-red)' : '1px solid var(--border-subtle)',
              backgroundColor: !isIngreso ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-subtle)',
              color: !isIngreso ? 'var(--accent-red)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            − Gasto Imprevisto
          </button>
        </div>

        {/* Concepto / Nombre */}
        <div>
          <label
            htmlFor="move-name"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            {isIngreso ? '¿De qué fue el ingreso?' : '¿En qué se gastó?'} *
          </label>
          <input
            id="move-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isIngreso ? 'Ej. Trabajo del sábado, Venta bicicleta...' : 'Ej. Arreglo moto, Farmacia, Taxi...'}
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

        {/* Valor */}
        <div>
          <label
            htmlFor="move-amount"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            Valor *
          </label>
          <MoneyInput
            id="move-amount"
            value={amount}
            onChange={setAmount}
            placeholder="0"
          />
        </div>

        {/* Categoría */}
        <div>
          <label
            htmlFor="move-cat"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            Categoría *
          </label>
          <select
            id="move-cat"
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
            {categoriesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label
            htmlFor="move-date"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}
          >
            Fecha *
          </label>
          <input
            id="move-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
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

        {/* Error */}
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

        {/* Botones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              height: 50,
              backgroundColor: isIngreso ? 'var(--accent-green)' : 'var(--accent-red)',
            }}
          >
            {isEditing ? 'Guardar Cambios' : isIngreso ? 'Registrar Ingreso Extra' : 'Registrar Imprevisto'}
          </button>

          {isEditing && onDelete && (
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <DoubleTapButton
                onConfirm={() => {
                  onDelete(initialData.id);
                  onClose();
                }}
                label="Eliminar este movimiento"
                confirmLabel="¿Eliminar? Toca otra vez"
                style={{ width: '100%', height: 46 }}
              />
            </div>
          )}
        </div>
      </form>
    </BottomSheet>
  );
}

