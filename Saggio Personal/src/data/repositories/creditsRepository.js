import { db } from '../db.js';

export const creditsRepository = {
  /**
   * Obtiene todos los créditos bancarios registrados
   */
  async getAll() {
    return await db.credits.toArray();
  },

  /**
   * Obtiene un crédito por su ID
   */
  async getById(id) {
    return await db.credits.get(id);
  },

  /**
   * Guarda o actualiza los datos principales de un crédito
   */
  async save(creditData) {
    await db.credits.put(creditData);
    return creditData;
  },

  /**
   * Obtiene el historial de pagos y abonos de un crédito
   */
  async getPayments(creditId) {
    return await db.creditPayments.where('creditId').equals(creditId).reverse().sortBy('date');
  },

  /**
   * Registra un nuevo pago (cuota ordinaria o abono extraordinario)
   */
  async addPayment(paymentData) {
    const id = await db.creditPayments.add({
      ...paymentData,
      createdAt: new Date().toISOString(),
    });

    // Actualizar el saldo y cuotas en la tabla principal del crédito si aplica
    const credit = await this.getById(paymentData.creditId);
    if (credit) {
      const updates = {};
      if (paymentData.type === 'cuota') {
        updates.currentTermPaid = Math.min(credit.termTotal, (credit.currentTermPaid || 0) + 1);
        updates.currentTermRemaining = Math.max(0, credit.termTotal - updates.currentTermPaid);
        if (paymentData.capitalAmortizado) {
          updates.currentBalance = Math.max(0, (credit.currentBalance || 0) - paymentData.capitalAmortizado);
        }
      } else if (paymentData.type === 'abono') {
        const abonoAmount = Number(paymentData.amount) || 0;
        updates.currentBalance = Math.max(0, (credit.currentBalance || 0) - abonoAmount);
        if (paymentData.cuotasAhorradas) {
          updates.currentTermPaid = Math.min(credit.termTotal, (credit.currentTermPaid || 0) + paymentData.cuotasAhorradas);
          updates.currentTermRemaining = Math.max(0, credit.termTotal - updates.currentTermPaid);
        }
      }
      if (Object.keys(updates).length > 0) {
        await db.credits.update(paymentData.creditId, updates);
      }
    }

    return id;
  },

  /**
   * Sincroniza y recalibra el crédito a partir de un extracto oficial de AV Villas
   */
  async syncFromExtract(creditId, extract) {
    const current = await this.getById(creditId);
    if (!current) return null;

    const updates = {
      currentBalance: extract.capitalTotal,
      currentTermPaid: extract.cuotasPagadas,
      currentTermRemaining: extract.cuotasPendientes,
      nextQuotaAmount: extract.proximaCuota,
      nextDueDate: extract.fechaLimitePago,
      lastSyncCorte: extract.fechaCorte,
      lastSyncAt: new Date().toISOString(),
    };

    await db.credits.update(creditId, updates);

    // Registrar en el historial que se sincronizó con el extracto
    await db.creditPayments.add({
      creditId,
      type: 'sincronizacion_extracto',
      fechaCorte: extract.fechaCorte,
      ym: extract.ym,
      amount: extract.totalPagadoPeriodo || extract.proximaCuota,
      saldoResultante: extract.capitalTotal,
      cuotasPagadas: extract.cuotasPagadas,
      cuotasPendientes: extract.cuotasPendientes,
      date: new Date().toISOString().slice(0, 10),
      notes: `Sincronización oficial extracto corte ${extract.fechaCorteFormatted}`,
      createdAt: new Date().toISOString(),
    });

    return { ...current, ...updates };
  },

  /**
   * Ajuste manual directo de saldo o cuotas
   */
  async adjustManually(creditId, { currentBalance, currentTermPaid, nextQuotaAmount, notes }) {
    const current = await this.getById(creditId);
    if (!current) return null;

    const termPaid = Number(currentTermPaid) || current.currentTermPaid;
    const termRemaining = Math.max(0, current.termTotal - termPaid);

    const updates = {
      currentBalance: Math.round(Number(currentBalance)),
      currentTermPaid: termPaid,
      currentTermRemaining: termRemaining,
      nextQuotaAmount: Math.round(Number(nextQuotaAmount) || current.nextQuotaAmount),
      lastManualAdjustAt: new Date().toISOString(),
    };

    await db.credits.update(creditId, updates);

    await db.creditPayments.add({
      creditId,
      type: 'ajuste_manual',
      amount: 0,
      saldoResultante: updates.currentBalance,
      cuotasPagadas: termPaid,
      cuotasPendientes: termRemaining,
      date: new Date().toISOString().slice(0, 10),
      notes: notes || 'Ajuste manual de calibración por el usuario',
      createdAt: new Date().toISOString(),
    });

    return { ...current, ...updates };
  },

  /**
   * Elimina un registro de pago o abono del historial
   */
  async deletePayment(id) {
    return await db.creditPayments.delete(id);
  },
};
