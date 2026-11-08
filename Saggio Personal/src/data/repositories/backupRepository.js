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
    const credits = await db.credits.toArray();
    const creditPayments = await db.creditPayments.toArray();

    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      data: {
        cards,
        cardPayments,
        fixed,
        fixedPayments,
        moves,
        settings,
        credits,
        creditPayments,
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

    const {
      cards = [],
      cardPayments = [],
      fixed = [],
      fixedPayments = [],
      moves = [],
      settings = [],
      credits = [],
      creditPayments = [],
    } = jsonObj.data;

    await db.transaction('rw', [db.cards, db.cardPayments, db.fixed, db.fixedPayments, db.moves, db.settings, db.credits, db.creditPayments], async () => {
      // Limpiar datos existentes
      await db.cards.clear();
      await db.cardPayments.clear();
      await db.fixed.clear();
      await db.fixedPayments.clear();
      await db.moves.clear();
      await db.settings.clear();
      await db.credits.clear();
      await db.creditPayments.clear();

      // Restaurar registros
      if (cards.length > 0) await db.cards.bulkAdd(cards);
      if (cardPayments.length > 0) await db.cardPayments.bulkAdd(cardPayments);
      if (fixed.length > 0) await db.fixed.bulkAdd(fixed);
      if (fixedPayments.length > 0) await db.fixedPayments.bulkAdd(fixedPayments);
      if (moves.length > 0) await db.moves.bulkAdd(moves);
      if (settings.length > 0) await db.settings.bulkAdd(settings);
      if (credits.length > 0) await db.credits.bulkAdd(credits);
      if (creditPayments.length > 0) await db.creditPayments.bulkAdd(creditPayments);
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
      await db.transaction('rw', [db.cards, db.fixed, db.settings, db.credits, db.creditPayments], async () => {
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

        // 4. Inicializar crédito oficial de AV Villas si no existe
        const existingCredit = await db.credits.get('av_villas_personal');
        if (!existingCredit) {
          await db.credits.put({
            id: 'av_villas_personal',
            name: 'Crédito Banco AV Villas',
            bank: 'Banco AV Villas',
            accountNumber: '3482262-5',
            originalAmount: 11971584,
            termTotal: 72,
            currentTermPaid: 29,
            currentTermRemaining: 43,
            currentBalance: 8641103,
            nextQuotaAmount: 334035,
            nextDueDate: '02 de Diciembre de 2026',
            rateEA: 24.90,
            monthlyQuotaEstimate: 340000,
            q: '2', // Quincena 30
            fixedLinkedName: 'Cuota Banco AV Villas',
            disbursementDate: '09/04/2026',
            insuranceMonthly: 33444,
          });

          // Pre-cargar historial verificado (Mayo a Noviembre 2026)
          await db.creditPayments.bulkAdd([
            {
              creditId: 'av_villas_personal',
              type: 'cuota',
              ym: '2026-05',
              date: '2026-05-27',
              amount: 525144,
              saldoResultante: 11980682,
              cuotasPagadas: 1,
              cuotasPendientes: 71,
              notes: 'Pago Cuota 1 (incluyó 53 días de intereses iniciales)',
              createdAt: '2026-05-27T12:00:00Z',
            },
            {
              creditId: 'av_villas_personal',
              type: 'abono',
              ym: '2026-06',
              date: '2026-06-01',
              amount: 2000000,
              cuotasAhorradas: 19,
              saldoResultante: 9903197,
              cuotasPagadas: 20,
              cuotasPendientes: 52,
              notes: 'Abono extraordinario a capital: ¡Recortó 19 cuotas de plazo!',
              createdAt: '2026-06-01T12:00:00Z',
            },
            {
              creditId: 'av_villas_personal',
              type: 'abono',
              ym: '2026-07',
              date: '2026-06-26',
              amount: 600000,
              cuotasAhorradas: 4,
              saldoResultante: 9179320,
              cuotasPagadas: 25,
              cuotasPendientes: 47,
              notes: 'Abono extraordinario a capital: ¡Recortó 4 cuotas de plazo!',
              createdAt: '2026-06-26T12:00:00Z',
            },
            {
              creditId: 'av_villas_personal',
              type: 'cuota',
              ym: '2026-08',
              date: '2026-08-03',
              amount: 341000,
              saldoResultante: 9050027,
              cuotasPagadas: 26,
              cuotasPendientes: 46,
              notes: 'Pago Cuota mensual ordinaria (Agosto 2026)',
              createdAt: '2026-08-03T12:00:00Z',
            },
            {
              creditId: 'av_villas_personal',
              type: 'cuota',
              ym: '2026-09',
              date: '2026-09-02',
              amount: 340000,
              saldoResultante: 8918235,
              cuotasPagadas: 27,
              cuotasPendientes: 45,
              notes: 'Pago Cuota mensual ordinaria (Septiembre 2026)',
              createdAt: '2026-09-02T12:00:00Z',
            },
            {
              creditId: 'av_villas_personal',
              type: 'cuota',
              ym: '2026-10',
              date: '2026-10-02',
              amount: 340000,
              saldoResultante: 8778149,
              cuotasPagadas: 28,
              cuotasPendientes: 44,
              notes: 'Pago Cuota mensual ordinaria (Octubre 2026)',
              createdAt: '2026-10-02T12:00:00Z',
            },
            {
              creditId: 'av_villas_personal',
              type: 'cuota',
              ym: '2026-11',
              date: '2026-11-04',
              amount: 346000,
              saldoResultante: 8641103,
              cuotasPagadas: 29,
              cuotasPendientes: 43,
              notes: 'Pago Cuota Noviembre 2026 (AvalPay PSE Bancolombia)',
              createdAt: '2026-11-04T12:27:00Z',
            },
          ]);
        }
      });
    } finally {
      isSeeding = false;
    }
  },
};
