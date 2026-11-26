import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../../common/BottomSheet.jsx';
import { MoneyInput } from '../../common/MoneyInput.jsx';
import { DoubleTapButton } from '../../common/DoubleTapButton.jsx';
import { formatCOP, getCurrentColombiaDate, formatDateColombian } from '../../../core/formatters.js';
import { Wallet, Sparkles, Plus, Trash2, Edit2, ArrowRight } from 'lucide-react';

export function CashModal({
  isOpen,
  onClose,
  quincena = '1',
  availableBalance = 0,
  cashMoves = [],
  initialMove = null,
  onSave,
  onDelete,
}) {
  const isQ1 = quincena === '1';
  const qTitle = isQ1 ? 'Quincena del 15' : 'Quincena del 30';

  const [activeMove, setActiveMove] = useState(null);
  const [amount, setAmount] = useState(0);
  const [name, setName] = useState('Dinero para mí en efectivo');
  const [date, setDate] = useState(() => getCurrentColombiaDate());
  const [error, setError] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Inicializar estado al abrir o cambiar de movimiento seleccionado
  useEffect(() => {
    if (!isOpen) return;

    if (initialMove) {
      setActiveMove(initialMove);
      setAmount(Number(initialMove.amount) || 0);
      setName(initialMove.name || 'Dinero para mí en efectivo');
      setDate(initialMove.date || getCurrentColombiaDate());
      setIsAddingNew(false);
    } else if (cashMoves.length === 1 && !isAddingNew) {
      // Si solo hay un movimiento existente, abrirlo directamente para editar
      const single = cashMoves[0];
      setActiveMove(single);
      setAmount(Number(single.amount) || 0);
      setName(single.name || 'Dinero para mí en efectivo');
      setDate(single.date || getCurrentColombiaDate());
    } else if (cashMoves.length === 0 || isAddingNew) {
      setActiveMove(null);
      setAmount(availableBalance > 0 ? availableBalance : 0);
      setName('Dinero para mí en efectivo');
      setDate(getCurrentColombiaDate());
    }
    setError('');
  }, [isOpen, initialMove, cashMoves, availableBalance, isAddingNew]);

  if (!isOpen) return null;

  const isEditing = Boolean(activeMove && activeMove.id);

  const handleSelectToEdit = (move) => {
    setActiveMove(move);
    setAmount(Number(move.amount) || 0);
    setName(move.name || 'Dinero para mí en efectivo');
    setDate(move.date || getCurrentColombiaDate());
    setIsAddingNew(false);
    setError('');
  };

  const handleStartAddNew = () => {
    setActiveMove(null);
    setAmount(availableBalance > 0 ? availableBalance : 0);
    setName('Dinero para mí en efectivo');
    setDate(getCurrentColombiaDate());
    setIsAddingNew(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Ingresa un valor mayor a $0.');
      return;
    }
    if (!date) {
      setError('Selecciona una fecha.');
      return;
    }

    try {
      await onSave({
        id: isEditing ? activeMove.id : undefined,
        kind: 'efectivo',
        name: name.trim() || 'Dinero para mí en efectivo',
        amount,
        cat: 'Efectivo personal',
        date,
        q: String(quincena),
      });
      onClose();
    } catch (err) {
      console.error('Error al guardar efectivo:', err);
      setError('Ocurrió un error al guardar. Intenta de nuevo.');
    }
  };

  const handleDelete = async () => {
    if (!activeMove?.id) return;
    try {
      await onDelete(activeMove.id);
      onClose();
    } catch (err) {
      console.error('Error al eliminar efectivo:', err);
      setError('Ocurrió un error al eliminar.');
    }
  };

  // Si hay múltiples movimientos y el usuario no está editando ni agregando
  const showList = cashMoves.length > 1 && !isEditing && !isAddingNew;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Dinero para mí en efectivo"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 16 }}>
        {/* Subtítulo informativo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: -6 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {qTitle} · Apartado para tus gastos personales
          </span>
          {availableBalance > 0 && !isEditing && (
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                color: '#38bdf8',
                padding: '2px 8px',
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              Saldo disponible: {formatCOP(availableBalance)}
            </span>
          )}
        </div>

        {/* Vista de lista si hay más de 1 retiro registrado */}
        {showList ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Retiros en efectivo registrados en esta quincena:
            </div>
            {cashMoves.map((m) => (
              <div
                key={m.id}
                onClick={() => handleSelectToEdit(m)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatCOP(m.amount)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {m.name} • {formatDateColombian(m.date)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontSize: '0.78rem', fontWeight: 700 }}>
                  <span>Editar</span>
                  <Edit2 size={14} />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleStartAddNew}
              className="btn-secondary"
              style={{
                width: '100%',
                height: 46,
                borderRadius: 12,
                justifyContent: 'center',
                gap: 8,
                fontWeight: 700,
                color: '#34d399',
                borderColor: 'rgba(52, 211, 153, 0.3)',
                backgroundColor: 'rgba(52, 211, 153, 0.08)',
              }}
            >
              <Plus size={16} />
              <span>Apartar otro dinero en efectivo</span>
            </button>
          </div>
        ) : (
          /* Formulario de registro o edición */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Si veníamos de una lista con varios movimientos, botón para regresar */}
            {cashMoves.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setActiveMove(null);
                  setIsAddingNew(false);
                }}
                style={{
                  alignSelf: 'flex-start',
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: 4,
                }}
              >
                ← Ver todos los retiros ({cashMoves.length})
              </button>
            )}

            {/* Banner explicativo amigable */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                backgroundColor: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Wallet size={20} color="#34d399" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.35 }}>
                Este valor se descuenta de tu cuenta bancaria y queda guardado como <strong>dinero en efectivo para ti</strong> por si se te ofrece algo.
              </div>
            </div>

            {/* Input de Valor */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label
                  htmlFor="cash-amount"
                  style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}
                >
                  ¿Cuánto vas a quedarte en efectivo? *
                </label>
                {availableBalance > 0 && !isEditing && (
                  <button
                    type="button"
                    onClick={() => setAmount(availableBalance)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#34d399',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Todo el saldo ({formatCOP(availableBalance)})</span>
                  </button>
                )}
              </div>

              <MoneyInput
                id="cash-amount"
                value={amount}
                onChange={setAmount}
                placeholder="0"
                autoFocus
              />
            </div>

            {/* Fecha */}
            <div>
              <label
                htmlFor="cash-date"
                style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}
              >
                Fecha del retiro / apartado *
              </label>
              <input
                id="cash-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  height: 48,
                  padding: '0 14px',
                  borderRadius: 12,
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            {/* Concepto o Nota */}
            <div>
              <label
                htmlFor="cash-name"
                style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}
              >
                Descripción / Concepto
              </label>
              <input
                id="cash-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Dinero para mí en efectivo, salidas, bolsillo..."
                style={{
                  width: '100%',
                  height: 48,
                  padding: '0 14px',
                  borderRadius: 12,
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{ color: 'var(--accent-red)', fontSize: '0.78rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              {isEditing && (
                <DoubleTapButton
                  onConfirm={handleDelete}
                  label="Eliminar"
                  confirmLabel="¿Confirmar?"
                  className="btn-danger"
                  style={{
                    flex: '0 0 110px',
                    height: 48,
                    borderRadius: 12,
                    fontSize: '0.85rem',
                  }}
                />
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: '#059669',
                  borderColor: '#10b981',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Wallet size={18} />
                <span>{isEditing ? 'Actualizar Efectivo' : 'Guardar Efectivo'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </BottomSheet>
  );
}
