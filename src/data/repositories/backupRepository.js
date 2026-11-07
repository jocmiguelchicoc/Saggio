import { db } from '../db.js';
import { INITIAL_SUGGESTED_CARDS, INITIAL_SUGGESTED_FIXED } from '../../core/constants.js';

let isSeeding = false;

export const backupRepository = {
  /**
   * Exporta toda la base de datos en un objeto JSON estructurado
   */
  async exportData() {
    const cards = await db.cards.toArray();
    const cardPayments = await db.cardPayments.toArray();
    const fixed = await db.fixed.toArray();
    const fixedPayments = await db.fixedPayments.toArray();
    const moves = await db.moves.toArray();
    const settings = await db.settings.toArray();

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        cards,
        cardPayments,
        fixed,
        fixedPayments,
        moves,
        settings,
      },
    };
  },

  /**
   * Importa y reemplaza la base de datos a partir de una copia JSON validada
   */
  async importData(jsonObj) {
    if (!jsonObj || !jsonObj.data) {
      throw new Error('Formato de archivo inválido: no contiene estructura de datos.');
    }

    const { cards = [], cardPayments = [], fixed = [], fixedPayments = [], moves = [], settings = [] } = jsonObj.data;

    await db.transaction('rw', [db.cards, db.cardPayments, db.fixed, db.fixedPayments, db.moves, db.settings], async () => {
      // Limpiar datos existentes
      await db.cards.clear();
      await db.cardPayments.clear();
      await db.fixed.clear();
      await db.fixedPayments.clear();
      await db.moves.clear();
      await db.settings.clear();

      // Restaurar registros
      if (cards.length > 0) await db.cards.bulkAdd(cards);
      if (cardPayments.length > 0) await db.cardPayments.bulkAdd(cardPayments);
      if (fixed.length > 0) await db.fixed.bulkAdd(fixed);
      if (fixedPayments.length > 0) await db.fixedPayments.bulkAdd(fixedPayments);
      if (moves.length > 0) await db.moves.bulkAdd(moves);
      if (settings.length > 0) await db.settings.bulkAdd(settings);
    });

    return true;
  },

  /**
   * Limpia duplicados, siembra y actualiza los valores fijos exactos del usuario
   */
  async cleanDuplicatesAndSeed() {
    if (isSeeding) return;
    isSeeding = true;

    try {
      await db.transaction('rw', [db.cards, db.fixed, db.settings], async () => {
        // 1. Desduplicar tarjetas por nombre
        const allCards = await db.cards.toArray();
        const seenCards = new Set();

        for (const card of allCards) {
          const normName = card.name.trim().toLowerCase();
          if (seenCards.has(normName)) {
            await db.cards.delete(card.id);
          } else {
            seenCards.add(normName);
          }
        }

        if (seenCards.size === 0) {
          await db.cards.bulkAdd(INITIAL_SUGGESTED_CARDS);
        }

        // 2. Desduplicar fijos y asegurar valores reales definidos por el usuario
        const allFixed = await db.fixed.toArray();
        const seenFixed = new Set();

        for (const f of allFixed) {
          const normName = f.name.trim().toLowerCase();
          const key = `${normName}_q${f.q}`;

          if (seenFixed.has(key)) {
            await db.fixed.delete(f.id);
          } else {
            seenFixed.add(key);

            // Actualizar montos fijos reales si estaban en 0
            if (normName === 'arriendo' && f.q === '2' && f.amount === 0) {
              await db.fixed.update(f.id, { amount: 1200000 });
            } else if (normName === 'cuota banco av villas' && f.q === '2' && f.amount === 0) {
              await db.fixed.update(f.id, { amount: 340000 });
            } else if (normName === 'parqueadero moto' && f.q === '2' && f.amount === 0) {
              await db.fixed.update(f.id, { amount: 41000 });
            }
          }
        }

        if (seenFixed.size === 0) {
          await db.fixed.bulkAdd(INITIAL_SUGGESTED_FIXED);
        }

        // 3. Asegurar configuración con sueldo fijo, apoyo SENA y aporte de hermanos
        const existingSettings = await db.settings.get('user_settings');
        if (!existingSettings) {
          await db.settings.put({
            id: 'user_settings',
            q1: 929000,
            q2: 929000,
            contributionsQ2: 600000,
            senaQ2: 1300000,
            senaUntil: '2027-04',
            since: '2026-11',
            history: [],
          });
        } else {
          const updates = {};
          if (!existingSettings.q1 || existingSettings.q1 === 0) updates.q1 = 929000;
          if (!existingSettings.q2 || existingSettings.q2 === 0) updates.q2 = 929000;
          if (existingSettings.contributionsQ2 === undefined) updates.contributionsQ2 = 600000;
          if (existingSettings.senaQ2 === undefined) {
            updates.senaQ2 = 1300000;
            updates.senaUntil = '2027-04';
          }
          if (Object.keys(updates).length > 0) {
            await db.settings.update('user_settings', updates);
          }
        }
      });
    } finally {
      isSeeding = false;
    }
  },
};
