import { db } from '../db.js';

export const fixedRepository = {
  async getAll() {
    return await db.fixed.toArray();
  },

  async getById(id) {
    return await db.fixed.get(Number(id));
  },

  async create(fixedData) {
    const id = await db.fixed.add({
      name: fixedData.name.trim(),
      amount: Math.round(Number(fixedData.amount) || 0),
      q: String(fixedData.q || '1'),
      cat: fixedData.cat || 'Otros',
    });
    return await this.getById(id);
  },

  async update(id, changes) {
    const cleanChanges = {};
    if (changes.name !== undefined) cleanChanges.name = changes.name.trim();
    if (changes.amount !== undefined) cleanChanges.amount = Math.round(Number(changes.amount) || 0);
    if (changes.q !== undefined) cleanChanges.q = String(changes.q);
    if (changes.cat !== undefined) cleanChanges.cat = changes.cat;

    await db.fixed.update(Number(id), cleanChanges);
    return await this.getById(id);
  },

  async delete(id) {
    // Al borrar una obligación fija, conservamos los pagos históricos en fixedPayments
    // para no alterar resúmenes de meses anteriores
    await db.fixed.delete(Number(id));
    return true;
  },

  async getAllPayments() {
    return await db.fixedPayments.toArray();
  },

  async getPaymentsByMonth(ym) {
    return await db.fixedPayments.where({ ym }).toArray();
  },

  /**
   * Marca una obligación como pagada en el mes dado.
   * Guarda un snapshot con: id = fixedId + "_" + ym, fixedId, ym, amount, name, cat, q, date.
   */
  async markPaid(fixedItem, ym, dateStr, customAmount = null) {
    const paymentId = `${fixedItem.id}_${ym}`;
    const finalAmount = customAmount !== null && customAmount !== undefined
      ? Math.round(Number(customAmount) || 0)
      : Math.round(Number(fixedItem.amount) || 0);

    const paymentRecord = {
      id: paymentId,
      fixedId: Number(fixedItem.id),
      ym,
      amount: finalAmount,
      name: fixedItem.name,
      cat: fixedItem.cat,
      q: fixedItem.q,
      date: dateStr,
    };
    await db.fixedPayments.put(paymentRecord);
    return paymentRecord;
  },

  /**
   * Desmarca el pago de la obligación para el mes dado.
   */
  async unmarkPaid(fixedId, ym) {
    const paymentId = `${fixedId}_${ym}`;
    await db.fixedPayments.delete(paymentId);
    return true;
  },
};

