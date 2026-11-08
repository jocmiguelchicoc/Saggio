import React, { useState } from 'react';
import { Plus, CreditCard, Landmark } from 'lucide-react';
import { CardVisualItem } from './CardVisualItem.jsx';
import { CardFormModal } from './CardFormModal.jsx';
import { CardPayModal } from './CardPayModal.jsx';
import { CardHistoryModal } from './CardHistoryModal.jsx';
import { CreditosTab } from '../CreditosTab/CreditosTab.jsx';
import { EmptyState } from '../../common/EmptyState.jsx';
import { calculateCardsSummary, calculateCardMonthStatus } from '../../../core/calculations.js';
import { formatCOP } from '../../../core/formatters.js';
import { cardsRepository } from '../../../data/repositories/cardsRepository.js';
import { CARD_PAYMENT_TYPES } from '../../../core/constants.js';

export function TarjetasTab({ period, data, subTab: controlledSubTab, onSelectSubTab }) {
  const { selectedYM } = period;
  const { cards, allCardPayments, credits = [] } = data;

  const [internalSubTab, setInternalSubTab] = useState('tarjetas');
  const currentSubTab = controlledSubTab !== undefined ? controlledSubTab : internalSubTab;
  const handleSubTabChange = (val) => {
    if (onSelectSubTab) onSelectSubTab(val);
    setInternalSubTab(val);
  };

  // Estados de modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payTargetCard, setPayTargetCard] = useState(null);
  const [payMode, setPayMode] = useState(CARD_PAYMENT_TYPES.CUOTA);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyTargetCard, setHistoryTargetCard] = useState(null);

  // Cálculos globales
  const summary = calculateCardsSummary(cards, allCardPayments, selectedYM);

  // Total de nuevos préstamos/cargos de todas las tarjetas
  const totalCargosOverall = allCardPayments
    .filter((p) => p.type === CARD_PAYMENT_TYPES.CARGO)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Handlers para tarjetas
  const handleOpenCreate = () => {
    setEditingCard(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (card) => {
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleSaveCard = async (cardData) => {
    if (editingCard && editingCard.id) {
      await cardsRepository.update(editingCard.id, cardData);
    } else {
      await cardsRepository.create(cardData);
    }
  };

  const handleDeleteCard = async (cardId) => {
    await cardsRepository.delete(cardId);
  };

  // Handlers para pagos y préstamos
  const handleOpenPayQuota = (card) => {
    setPayTargetCard(card);
    setPayMode(CARD_PAYMENT_TYPES.CUOTA);
    setIsPayOpen(true);
  };

  const handleOpenAbonar = (card) => {
    setPayTargetCard(card);
    setPayMode(CARD_PAYMENT_TYPES.ABONO);
    setIsPayOpen(true);
  };

  const handleOpenCargo = (card) => {
    setPayTargetCard(card);
    setPayMode(CARD_PAYMENT_TYPES.CARGO);
    setIsPayOpen(true);
  };

  const handleConfirmPayment = async (paymentData) => {
    await cardsRepository.addPayment(paymentData);
  };

  // Handlers para historial
  const handleOpenHistory = (card) => {
    setHistoryTargetCard(card);
    setIsHistoryOpen(true);
  };

  const handleDeletePayment = async (paymentId) => {
    await cardsRepository.deletePayment(paymentId);
  };

  return (
    <div>
      {/* Selector superior tipo Switch: Tarjetas vs Crédito AV Villas */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--bg-card)',
          padding: '4px',
          borderRadius: 14,
          marginBottom: 18,
          border: '1px solid var(--border-subtle)',
          gap: 6,
        }}
      >
        <button
          type="button"
          onClick={() => handleSubTabChange('tarjetas')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 42,
            borderRadius: 10,
            border: 'none',
            backgroundColor: currentSubTab === 'tarjetas' ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
            color: currentSubTab === 'tarjetas' ? '#60a5fa' : 'var(--text-muted)',
            fontWeight: currentSubTab === 'tarjetas' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <CreditCard size={17} />
          <span>Tarjetas ({cards.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubTabChange('creditos')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 42,
            borderRadius: 10,
            border: 'none',
            backgroundColor: currentSubTab === 'creditos' ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
            color: currentSubTab === 'creditos' ? '#60a5fa' : 'var(--text-muted)',
            fontWeight: currentSubTab === 'creditos' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Landmark size={17} />
          <span>Crédito AV Villas ({credits.length})</span>
        </button>
      </div>

      {/* Si está en la pestaña de Créditos, mostramos la vista dedicada de Créditos */}
      {currentSubTab === 'creditos' ? (
        <CreditosTab period={period} data={data} />
      ) : (
        <>
          {/* Cabecera de la sección de tarjetas con botón de agregar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Mis Tarjetas
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {cards.length} {cards.length === 1 ? 'tarjeta activa' : 'tarjetas activas'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="btn-primary"
              style={{ height: 44, padding: '0 14px', fontSize: '0.85rem' }}
            >
              <Plus size={18} />
              <span>Nueva tarjeta</span>
            </button>
          </div>

      {/* Resumen superior global limpio */}
      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          marginBottom: 18,
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Deuda total actual
          </div>
          <div className="money tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-red)' }}>
            {formatCOP(summary.totalDebt)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Deuda inicial total
          </div>
          <div className="money tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCOP(summary.totalInitial)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total pagado histórico
          </div>
          <div className="money tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-green)' }}>
            {formatCOP(summary.totalPaidOverall)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Nuevos préstamos / uso
          </div>
          <div className="money tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
            +{formatCOP(totalCargosOverall)}
          </div>
        </div>
      </div>

      {/* Lista de tarjetas o estado vacío */}
      {cards.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No tienes tarjetas agregadas"
          description="Agrega tu primera tarjeta de crédito con lo que debes hoy para empezar a llevar el control."
          actionText="Agregar tarjeta"
          onAction={handleOpenCreate}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cards.map((card) => {
            const cardPayments = allCardPayments.filter((p) => p.cardId === card.id);
            const monthStatus = calculateCardMonthStatus(card, cardPayments, selectedYM);

            return (
              <CardVisualItem
                key={card.id}
                card={card}
                payments={cardPayments}
                monthStatus={monthStatus}
                onPayQuota={handleOpenPayQuota}
                onAbonar={handleOpenAbonar}
                onCargo={handleOpenCargo}
                onHistory={handleOpenHistory}
                onEdit={handleOpenEdit}
              />
            );
          })}
        </div>
      )}

      {/* Modales */}
      <CardFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        initialData={editingCard}
      />

      <CardPayModal
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        card={payTargetCard}
        monthStatus={
          payTargetCard
            ? calculateCardMonthStatus(
                payTargetCard,
                allCardPayments.filter((p) => p.cardId === payTargetCard.id),
                selectedYM
              )
            : null
        }
        mode={payMode}
        onConfirmPayment={handleConfirmPayment}
      />

      <CardHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        card={historyTargetCard}
        payments={
          historyTargetCard
            ? allCardPayments.filter((p) => p.cardId === historyTargetCard.id)
            : []
        }
        onDeletePayment={handleDeletePayment}
      />
        </>
      )}
    </div>
  );
}
