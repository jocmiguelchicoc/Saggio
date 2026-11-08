import React, { useState } from 'react';
import { Landmark, Plus, FileText, Info } from 'lucide-react';
import { CreditoCard } from './CreditoCard.jsx';
import { UploadExtractModal } from './UploadExtractModal.jsx';
import { CreditAbonoModal } from './CreditAbonoModal.jsx';
import { CreditPayModal } from './CreditPayModal.jsx';
import { CreditAdjustModal } from './CreditAdjustModal.jsx';
import { CreditHistoryModal } from './CreditHistoryModal.jsx';
import { EmptyState } from '../../common/EmptyState.jsx';
import { formatCOP } from '../../../core/formatters.js';
import { creditsRepository } from '../../../data/repositories/creditsRepository.js';
import { fixedRepository } from '../../../data/repositories/fixedRepository.js';

export function CreditosTab({ period, data }) {
  const { selectedYM } = period;
  const { credits = [], allCreditPayments = [], fixedList = [] } = data;

  // Estados de modales
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAbonoOpen, setIsAbonoOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeCredit, setActiveCredit] = useState(null);

  // Crédito principal (Banco AV Villas)
  const primaryCredit = credits[0] || null;

  // Cálculos consolidados de créditos
  const totalBalance = credits.reduce((sum, c) => sum + (Number(c.currentBalance) || 0), 0);
  const totalOriginal = credits.reduce((sum, c) => sum + (Number(c.originalAmount) || 0), 0);
  const totalPaymentsPaid = allCreditPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalCuotasAhorradas = allCreditPayments
    .filter((p) => p.type === 'abono')
    .reduce((sum, p) => sum + (Number(p.cuotasAhorradas) || 0), 0);

  // Handlers para abrir modales
  const handleOpenUpload = (credit) => {
    setActiveCredit(credit);
    setIsUploadOpen(true);
  };

  const handleOpenAbono = (credit) => {
    setActiveCredit(credit);
    setIsAbonoOpen(true);
  };

  const handleOpenPay = (credit) => {
    setActiveCredit(credit);
    setIsPayOpen(true);
  };

  const handleOpenAdjust = (credit) => {
    setActiveCredit(credit);
    setIsAdjustOpen(true);
  };

  const handleOpenHistory = (credit) => {
    setActiveCredit(credit);
    setIsHistoryOpen(true);
  };

  // Confirmación de sincronización por Extracto PDF
  const handleConfirmSync = async (parsedData) => {
    if (!activeCredit) return;
    await creditsRepository.syncFromExtract(activeCredit.id, parsedData);
  };

  // Confirmación de Abono a Capital
  const handleConfirmAbono = async (abonoData) => {
    await creditsRepository.addPayment(abonoData);
  };

  // Confirmación de Pago de Cuota (con sincronización opcional con Gastos Fijos)
  const handleConfirmPay = async (payData) => {
    await creditsRepository.addPayment(payData);

    // Si existe un gasto fijo enlazado ("Cuota Banco AV Villas") y no está marcado como pagado este mes,
    // sincronizarlo automáticamente para que se descuente también de Gastos Fijos
    try {
      const fixedMatch = fixedList.find(
        (f) =>
          f.name.toLowerCase().includes('av villas') ||
          (activeCredit && activeCredit.fixedLinkedName && f.name.toLowerCase().includes(activeCredit.fixedLinkedName.toLowerCase()))
      );
      if (fixedMatch) {
        await fixedRepository.markPaid(fixedMatch, payData.ym, payData.date, payData.amount);
      }
    } catch (err) {
      console.warn('Sincronización con fijos no requerida o ya completada:', err);
    }
  };

  // Confirmación de Ajuste Manual
  const handleConfirmAdjust = async (creditId, adjustData) => {
    await creditsRepository.adjustManually(creditId, adjustData);
  };

  // Eliminación de registro del historial
  const handleDeletePayment = async (paymentId) => {
    await creditsRepository.deletePayment(paymentId);
  };

  return (
    <div>
      {/* Resumen superior global */}
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
            Saldo capital actual
          </div>
          <div className="money tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-red)' }}>
            {formatCOP(totalBalance)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Desembolso inicial
          </div>
          <div className="money tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCOP(totalOriginal)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total pagado acumulado
          </div>
          <div className="money tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-green)' }}>
            {formatCOP(totalPaymentsPaid)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Plazo ahorrado
          </div>
          <div className="money tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
            {totalCuotasAhorradas} cuotas menos
          </div>
        </div>
      </div>

      {/* Lista de Créditos Bancarios */}
      {credits.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No hay créditos registrados"
          description="Aún no tienes créditos bancarios registrados."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {credits.map((credit) => {
            const payments = allCreditPayments.filter((p) => p.creditId === credit.id);
            return (
              <CreditoCard
                key={credit.id}
                credit={credit}
                payments={payments}
                onOpenUpload={() => handleOpenUpload(credit)}
                onOpenAbono={() => handleOpenAbono(credit)}
                onOpenPay={() => handleOpenPay(credit)}
                onOpenAdjust={() => handleOpenAdjust(credit)}
                onOpenHistory={() => handleOpenHistory(credit)}
              />
            );
          })}
        </div>
      )}

      {/* Banner explicativo de calibración con PDF */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '16px',
          borderRadius: 16,
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          marginTop: 10,
        }}
      >
        <Info size={20} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.5' }}>
          <strong>Cero cálculos a ciegas:</strong> Puedes subir en cualquier momento el extracto mensual en PDF de tu banco
          tocando <em>"Subir Extracto PDF"</em>. La app lee directamente las cifras oficiales expedidas por Banco AV Villas y
          recalibra tu saldo exacto, cuotas e intereses sin desvíos.
        </div>
      </div>

      {/* Modales */}
      <UploadExtractModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        credit={activeCredit}
        onConfirmSync={handleConfirmSync}
      />

      <CreditAbonoModal
        isOpen={isAbonoOpen}
        onClose={() => setIsAbonoOpen(false)}
        credit={activeCredit}
        onConfirmAbono={handleConfirmAbono}
      />

      <CreditPayModal
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        credit={activeCredit}
        onConfirmPay={handleConfirmPay}
      />

      <CreditAdjustModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        credit={activeCredit}
        onConfirmAdjust={handleConfirmAdjust}
      />

      <CreditHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        credit={activeCredit}
        payments={
          activeCredit
            ? allCreditPayments.filter((p) => p.creditId === activeCredit.id)
            : []
        }
        onDeletePayment={handleDeletePayment}
      />
    </div>
  );
}

