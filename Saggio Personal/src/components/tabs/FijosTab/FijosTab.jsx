import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle2 } from 'lucide-react';
import { FixedItem } from './FixedItem.jsx';
import { FixedFormModal } from './FixedFormModal.jsx';
import { FixedPayModal } from './FixedPayModal.jsx';
import { calculateFixedMonthStatus } from '../../../core/calculations.js';
import { formatCOP, getCurrentColombiaDate } from '../../../core/formatters.js';
import { fixedRepository } from '../../../data/repositories/fixedRepository.js';
import { creditsRepository } from '../../../data/repositories/creditsRepository.js';

export function FijosTab({ period, data }) {
  const { selectedYM, currentRealYM, currentRealQuincena } = period;
  const { fixedList, allFixedPayments, settings } = data;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultQ, setModalDefaultQ] = useState('1');
  const [editingItem, setEditingItem] = useState(null);

  // Estado para el modal de pago libre o de fijos en cero
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payTargetItem, setPayTargetItem] = useState(null);

  const fixedPaymentsInMonth = allFixedPayments.filter((fp) => fp.ym === selectedYM);
  const status = calculateFixedMonthStatus(fixedList, fixedPaymentsInMonth);

  const isCurrentMonth = selectedYM === currentRealYM;

  // 1. Quincena del 15
  const itemsQ1 = status.items.filter((item) => item.q === '1');
  const totalQ1 = itemsQ1.reduce((sum, item) => sum + item.amount, 0);
  const paidQ1 = itemsQ1.filter((item) => item.isPaid).reduce((sum, item) => sum + item.amount, 0);
  const pendingQ1 = Math.max(0, totalQ1 - paidQ1);
  const countPaidQ1 = itemsQ1.filter((item) => item.isPaid).length;

  // 2. Quincena del 30
  const itemsQ2 = status.items.filter((item) => item.q === '2');
  const totalQ2 = itemsQ2.reduce((sum, item) => sum + item.amount, 0);
  const paidQ2 = itemsQ2.filter((item) => item.isPaid).reduce((sum, item) => sum + item.amount, 0);
  const pendingQ2 = Math.max(0, totalQ2 - paidQ2);
  const countPaidQ2 = itemsQ2.filter((item) => item.isPaid).length;

  const handleOpenCreate = (q = '1') => {
    setEditingItem(null);
    setModalDefaultQ(q);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setModalDefaultQ(item.q);
    setIsModalOpen(true);
  };

  const handleSaveFixed = async (fixedData) => {
    if (editingItem && editingItem.id) {
      await fixedRepository.update(editingItem.id, fixedData);
    } else {
      await fixedRepository.create(fixedData);
    }
  };

  const handleDeleteFixed = async (id) => {
    await fixedRepository.delete(id);
  };

  const handleTogglePay = async (item) => {
    if (item.isPaid) {
      await fixedRepository.unmarkPaid(item.id, selectedYM);
      // Si se desmarca la cuota de AV Villas, revertir pago en creditPayments si fue registrado automáticamente
      if (item.name.toLowerCase().includes('av villas')) {
        try {
          const payments = await creditsRepository.getPayments('av_villas_personal');
          const synced = payments.find((p) => p.ym === selectedYM && p.type === 'cuota' && p.notes && p.notes.includes('Gastos Fijos'));
          if (synced && synced.id) {
            await creditsRepository.deletePayment(synced.id);
          }
        } catch (err) {
          console.warn('Error al desmarcar pago de crédito sincronizado:', err);
        }
      }
    } else {
      // Si la obligación está en cero, abrimos el modal para pedir el valor pagado
      if ((Number(item.amount) || 0) === 0) {
        setPayTargetItem(item);
        setIsPayModalOpen(true);
      } else {
        const today = getCurrentColombiaDate();
        await fixedRepository.markPaid(item, selectedYM, today);

        // Si es la cuota de Banco AV Villas, sincronizar automáticamente con el módulo de Créditos
        if (item.name.toLowerCase().includes('av villas')) {
          try {
            const credit = await creditsRepository.getById('av_villas_personal');
            if (credit) {
              const payments = await creditsRepository.getPayments('av_villas_personal');
              const alreadyPaid = payments.some((p) => p.ym === selectedYM && p.type === 'cuota');
              if (!alreadyPaid) {
                await creditsRepository.addPayment({
                  creditId: 'av_villas_personal',
                  type: 'cuota',
                  ym: selectedYM,
                  amount: item.amount || credit.nextQuotaAmount || 340000,
                  date: today,
                  notes: 'Cuota pagada automáticamente desde Gastos Fijos (Quincena 30)',
                });
              }
            }
          } catch (err) {
            console.warn('Error al sincronizar cuota fija con crédito:', err);
          }
        }
      }
    }
  };

  const handleConfirmPayModal = async ({ item, amount, date, saveAsHabitual }) => {
    await fixedRepository.markPaid(item, selectedYM, date, amount);
    if (saveAsHabitual) {
      await fixedRepository.update(item.id, { amount });
    }

    if (item.name.toLowerCase().includes('av villas')) {
      try {
        const credit = await creditsRepository.getById('av_villas_personal');
        if (credit) {
          const payments = await creditsRepository.getPayments('av_villas_personal');
          const alreadyPaid = payments.some((p) => p.ym === selectedYM && p.type === 'cuota');
          if (!alreadyPaid) {
            await creditsRepository.addPayment({
              creditId: 'av_villas_personal',
              type: 'cuota',
              ym: selectedYM,
              amount: Number(amount) || credit.nextQuotaAmount || 340000,
              date: date || getCurrentColombiaDate(),
              notes: 'Cuota pagada automáticamente desde Gastos Fijos (Quincena 30)',
            });
          }
        }
      } catch (err) {
        console.warn('Error al sincronizar cuota fija modal con crédito:', err);
      }
    }
  };

  const renderQuincenaGroupedList = (items, emptyMessage) => {
    if (items.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {emptyMessage}
        </div>
      );
    }

    const paidItems = items.filter((item) => item.isPaid);
    const zeroItems = items.filter((item) => !item.isPaid && (Number(item.amount) || 0) === 0);
    const pendingItems = items.filter((item) => !item.isPaid && (Number(item.amount) || 0) > 0);

    const paidTotal = paidItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const pendingTotal = pendingItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 1. Lo que vas pagando (arriba) */}
        {paidItems.length > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
                padding: '0 4px',
              }}
            >
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: 'var(--accent-green)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <CheckCircle2 size={14} />
                Lo que vas pagando ({paidItems.length})
              </span>
              <span className="money tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                {formatCOP(paidTotal)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {paidItems.map((item) => (
                <FixedItem
                  key={item.id}
                  item={item}
                  onTogglePay={handleTogglePay}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteFixed}
                />
              ))}
            </div>
          </div>
        )}

        {/* 2. En ceros / Por definir ($0) */}
        {zeroItems.length > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
                marginTop: paidItems.length > 0 ? 6 : 0,
                padding: '0 4px',
              }}
            >
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                En ceros / Por definir ($0) ({zeroItems.length})
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Toca para pagar o asignar valor
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {zeroItems.map((item) => (
                <FixedItem
                  key={item.id}
                  item={item}
                  onTogglePay={handleTogglePay}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteFixed}
                />
              ))}
            </div>
          </div>
        )}

        {/* 3. Por pagar (debajo de los que están en cero) */}
        {pendingItems.length > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
                marginTop: (paidItems.length > 0 || zeroItems.length > 0) ? 6 : 0,
                padding: '0 4px',
              }}
            >
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: 'var(--accent-amber)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Por pagar ({pendingItems.length})
              </span>
              <span className="money tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                {formatCOP(pendingTotal)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendingItems.map((item) => (
                <FixedItem
                  key={item.id}
                  item={item}
                  onTogglePay={handleTogglePay}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteFixed}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Cabecera general */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Obligaciones Fijas
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {status.countPaid} de {status.countTotal} pagadas este mes
          </span>
        </div>
      </div>

      {/* Resumen superior consolidado */}
      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 20,
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Fijos</div>
          <div className="money tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
            {formatCOP(status.totalAmount)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pagado</div>
          <div className="money tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-green)' }}>
            {formatCOP(status.paidAmount)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Falta</div>
          <div className="money tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
            {formatCOP(status.pendingAmount)}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECCIÓN 1: QUINCENA DEL 15 */}
      {/* ========================================================= */}
      <div
        className="card"
        style={{
          borderRadius: 20,
          padding: '16px',
          marginBottom: 22,
          border: isCurrentMonth && currentRealQuincena === '1' ? '1.5px solid rgba(56, 189, 248, 0.45)' : '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        {/* Cabecera Quincena del 15 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Quincena del 15
                </h3>
                {isCurrentMonth && currentRealQuincena === '1' && (
                  <span className="badge badge-now">Ahora</span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Cubre pagos del 15 al 29 · ({countPaidQ1} de {itemsQ1.length} pagadas)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenCreate('1')}
            className="btn-primary"
            style={{ height: 38, padding: '0 12px', fontSize: '0.8rem', borderRadius: 10 }}
          >
            <Plus size={16} />
            <span>Agregar</span>
          </button>
        </div>

        {/* Subtotales Quincena del 15 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 6,
            padding: '10px 12px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 12,
            textAlign: 'center',
            marginBottom: 14,
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Q15</div>
            <div className="money tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
              {formatCOP(totalQ1)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pagado</div>
            <div className="money tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-green)' }}>
              {formatCOP(paidQ1)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Falta</div>
            <div className="money tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
              {formatCOP(pendingQ1)}
            </div>
          </div>
        </div>

        {/* Lista desglosada y agrupada de items de Quincena del 15 */}
        {renderQuincenaGroupedList(itemsQ1, 'No hay gastos fijos configurados para la Quincena del 15.')}
      </div>

      {/* ========================================================= */}
      {/* SECCIÓN 2: QUINCENA DEL 30 */}
      {/* ========================================================= */}
      <div
        className="card"
        style={{
          borderRadius: 20,
          padding: '16px',
          marginBottom: 20,
          border: isCurrentMonth && currentRealQuincena === '2' ? '1.5px solid rgba(245, 158, 11, 0.45)' : '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        {/* Cabecera Quincena del 30 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Quincena del 30
                </h3>
                {isCurrentMonth && currentRealQuincena === '2' && (
                  <span className="badge badge-now">Ahora</span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Cubre pagos del 30 al 14 · ({countPaidQ2} de {itemsQ2.length} pagadas)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenCreate('2')}
            className="btn-primary"
            style={{
              height: 38,
              padding: '0 12px',
              fontSize: '0.8rem',
              borderRadius: 10,
              backgroundColor: 'var(--accent-amber)',
            }}
          >
            <Plus size={16} />
            <span>Agregar</span>
          </button>
        </div>

        {/* Subtotales Quincena del 30 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 6,
            padding: '10px 12px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 12,
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Q30</div>
            <div className="money tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
              {formatCOP(totalQ2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pagado</div>
            <div className="money tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-green)' }}>
              {formatCOP(paidQ2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Falta</div>
            <div className="money tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
              {formatCOP(pendingQ2)}
            </div>
          </div>
        </div>

        {/* Nota informativa de aportes de hermanos para el arriendo */}
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: 10,
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Aporte arriendo hermanos (a favor):</span>
          <strong className="money tabular-nums" style={{ color: 'var(--accent-green)', fontWeight: 800 }}>
            + {formatCOP(settings?.contributionsQ2 !== undefined ? settings.contributionsQ2 : 600000)}
          </strong>
        </div>

        {/* Lista desglosada y agrupada de items de Quincena del 30 */}
        {renderQuincenaGroupedList(itemsQ2, 'No hay gastos fijos configurados para la Quincena del 30.')}
      </div>

      {/* Modal para crear / editar configuración */}
      <FixedFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFixed}
        onDelete={handleDeleteFixed}
        initialData={editingItem}
        defaultQuincena={modalDefaultQ}
      />

      {/* Modal para ingresar monto al pagar un fijo en cero o libre */}
      <FixedPayModal
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false);
          setPayTargetItem(null);
        }}
        item={payTargetItem}
        onConfirmPayment={handleConfirmPayModal}
      />
    </div>
  );
}
