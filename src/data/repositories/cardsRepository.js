import { db } from '../db.js';

export const cardsRepository = {
  async getAll() {
    return await db.cards.toArray();
  },

  async getById(id) {
    return await db.cards.get(Number(id));
  },

  async create(cardData) {
    const id = await db.cards.add({
      name: cardData.name.trim(),
      initial: Math.round(Number(cardData.initial) || 0),
      monthly: Math.round(Number(cardData.monthly) || 0),
      q: String(cardData.q || '1'),
    });
    return await this.getById(id);
  },

  async update(id, changes) {
    const cleanChanges = {};
    if (changes.name !== undefined) cleanChanges.name = changes.name.trim();
    if (changes.initial !== undefined) cleanChanges.initial = Math.round(Number(changes.initial) || 0);
    if (changes.monthly !== undefined) cleanChanges.monthly = Math.round(Number(changes.monthly) || 0);
    if (changes.q !== undefined) cleanChanges.q = String(changes.q);

    await db.cards.update(Number(id), cleanChanges);
    return await this.getById(id);
  },

  async delete(id) {
    const numId = Number(id);
    // Borrar la tarjeta y todos sus pagos asociados
    await db.transaction('rw', db.cards, db.cardPayments, async () => {
      await db.cardPayments.where({ cardId: numId }).delete();
      await db.cards.delete(numId);
    });
    return true;
  },

  async getAllPayments() {
    return await db.cardPayments.toArray();
  },

  async getPaymentsByCard(cardId) {
    return await db.cardPayments.where({ cardId: Number(cardId) }).toArray();
  },

  async addPayment(paymentData) {
    const id = await db.cardPayments.add({
      cardId: Number(paymentData.cardId),
      type: paymentData.type, // 'cuota', 'abono', 'cargo'
      amount: Math.round(Number(paymentData.amount) || 0),
      date: paymentData.date, // 'YYYY-MM-DD'
    });
    return await db.cardPayments.get(id);
  },

  async deletePayment(paymentId) {
    await db.cardPayments.delete(Number(paymentId));
    return true;
  },
};

