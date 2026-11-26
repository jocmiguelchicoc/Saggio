import React, { useState } from 'react';
import { PlusCircle, MinusCircle, ArrowUpDown, Wallet } from 'lucide-react';
import { MoveFormModal } from './MoveFormModal.jsx';
import { EmptyState } from '../../common/EmptyState.jsx';
import { DoubleTapButton } from '../../common/DoubleTapButton.jsx';
import { formatCOP, formatDateFriendly } from '../../../core/formatters.js';
import { movesRepository } from '../../../data/repositories/movesRepository.js';

export function ExtrasTab({ period, data }) {
  const { selectedYM } = period;
  const { allMoves } = data;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultKind, setModalDefaultKind] = useState('ingreso');
  const [editingMove, setEditingMove] = useState(null);

  // Filtrar movimientos del mes seleccionado
  const movesInMonth = allMoves
    .filter((m) => m.date && m.date.startsWith(selectedYM))
    .sort((a, b) => (b.date > a.date ? 1 : -1));

  const totalExtraIncome = movesInMonth
    .filter((m) => m.kind === 'ingreso')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const totalUnexpected = movesInMonth
    .filter((m) => m.kind === 'imprevisto')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const totalCash = movesInMonth
    .filter((m) => m.kind === 'efectivo')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const balance = totalExtraIncome - totalUnexpected;

  const handleOpenAdd = (kind) => {
    setEditingMove(null);
    setModalDefaultKind(kind);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (move) => {
    setEditingMove(move);
    setModalDefaultKind(move.kind);
    setIsModalOpen(true);
  };

  const handleSaveMove = async (moveData) => {
    if (editingMove && editingMove.id) {
      await movesRepository.update(editingMove.id, moveData);
    } else {
      await movesRepository.create(moveData);
    }
  };

  const handleDeleteMove = async (id) => {
    await movesRepository.delete(id);
  };

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Extras e Imprevistos
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {movesInMonth.length} movimientos este mes
          </span>
        </div>
      </div>

      {/* Resumen superior */}
      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: totalCash > 0 ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 16,
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ingresos Extra</div>
          <div className="money tabular-nums" style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--accent-green)' }}>
            +{formatCOP(totalExtraIncome)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Imprevistos</div>
          <div className="money tabular-nums" style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--accent-red)' }}>
            -{formatCOP(totalUnexpected)}
          </div>
        </div>
        {totalCash > 0 && (
          <div>
            <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>En Efectivo</div>
            <div className="money tabular-nums" style={{ fontSize: '0.98rem', fontWeight: 800, color: '#34d399' }}>
              {formatCOP(totalCash)}
            </div>
          </div>
        )}
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Diferencia</div>
          <div
            className="money tabular-nums"
            style={{
              fontSize: '0.98rem',
              fontWeight: 800,
              color: balance >= 0 ? 'var(--accent-blue)' : 'var(--accent-red)',
            }}
          >
            {formatCOP(balance)}
          </div>
        </div>
      </div>

      {/* 3 Botones de acción directa: Ingreso Extra, Imprevisto y Efectivo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
        <button
          type="button"
          onClick={() => handleOpenAdd('ingreso')}
          className="btn-secondary"
          style={{
            height: 50,
            backgroundColor: 'var(--accent-green-subtle)',
            borderColor: 'rgba(16, 185, 129, 0.35)',
            color: 'var(--accent-green)',
            fontWeight: 700,
            borderRadius: 16,
            padding: '0 6px',
            fontSize: '0.8rem',
            gap: 6,
          }}
        >
          <PlusCircle size={18} />
          <span>Ingreso</span>
        </button>

        <button
          type="button"
          onClick={() => handleOpenAdd('imprevisto')}
          className="btn-secondary"
          style={{
            height: 50,
            backgroundColor: 'var(--accent-red-subtle)',
            borderColor: 'rgba(244, 63, 94, 0.35)',
            color: 'var(--accent-red)',
            fontWeight: 700,
            borderRadius: 16,
            padding: '0 6px',
            fontSize: '0.8rem',
            gap: 6,
          }}
        >
          <MinusCircle size={18} />
          <span>Imprevisto</span>
        </button>

        <button
          type="button"
          onClick={() => handleOpenAdd('efectivo')}
          className="btn-secondary"
          style={{
            height: 50,
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            borderColor: 'rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontWeight: 700,
            borderRadius: 16,
            padding: '0 6px',
            fontSize: '0.8rem',
            gap: 6,
          }}
        >
          <Wallet size={18} />
          <span>Efectivo</span>
        </button>
      </div>

      {/* Lista de movimientos del mes */}
      {movesInMonth.length === 0 ? (
        <EmptyState
          icon={ArrowUpDown}
          title="Sin movimientos este mes"
          description="Registra la plata extra que te llegue (trabajo extra, regalos) o gastos imprevistos para que no te descuadren las cuentas."
          actionText="+ Registrar primer movimiento"
          onAction={() => handleOpenAdd('ingreso')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {movesInMonth.map((m) => {
            const isIngreso = m.kind === 'ingreso';
            const isEfectivo = m.kind === 'efectivo';

            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 16,
                  backgroundColor: 'var(--bg-card)',
                  border: isEfectivo ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                }}
              >
                <div
                  onClick={() => handleOpenEdit(m)}
                  style={{ flex: 1, minWidth: 0, cursor: 'pointer', paddingRight: 8 }}
                  title="Toca para editar"
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.96rem',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {isEfectivo && <Wallet size={16} color="#34d399" />}
                    <span>{m.name}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {m.cat} · {formatDateFriendly(m.date)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    className="money tabular-nums"
                    onClick={() => handleOpenEdit(m)}
                    style={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: isIngreso ? 'var(--accent-green)' : isEfectivo ? '#34d399' : 'var(--accent-red)',
                      textAlign: 'right',
                      cursor: 'pointer',
                    }}
                  >
                    {isIngreso ? `+${formatCOP(m.amount)}` : isEfectivo ? `💵 ${formatCOP(m.amount)}` : `-${formatCOP(m.amount)}`}
                  </div>

                  <DoubleTapButton
                    onConfirm={() => handleDeleteMove(m.id)}
                    label=""
                    confirmLabel="¿Borrar?"
                    style={{ minWidth: 36, width: 36, height: 36, padding: 0 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <MoveFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMove}
        onDelete={handleDeleteMove}
        initialData={editingMove}
        defaultKind={modalDefaultKind}
      />
    </div>
  );
}
