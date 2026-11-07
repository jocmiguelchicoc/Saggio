import { db } from '../db.js';

export const movesRepository = {
  async getAll() {
    return await db.moves.orderBy('date').reverse().toArray();
  },

  async getByMonth(ym) {
    const all = await db.moves.toArray();
    return all
      .filter(m => m.date && m.date.startsWith(ym))
      .sort((a, b) => (b.date > a.date ? 1 : -1));
  },

  async create(moveData) {
    const id = await db.moves.add({
      kind: moveData.kind, // 'ingreso' o 'imprevisto'
      name: moveData.name.trim(),
      amount: Math.round(Number(moveData.amount) || 0),
      cat: moveData.cat || 'Otros',
      date: moveData.date, // 'YYYY-MM-DD'
    });
    return await db.moves.get(id);
  },

  async update(id, changes) {
    const cleanChanges = {};
    if (changes.kind !== undefined) cleanChanges.kind = changes.kind;
    if (changes.name !== undefined) cleanChanges.name = changes.name.trim();
    if (changes.amount !== undefined) cleanChanges.amount = Math.round(Number(changes.amount) || 0);
    if (changes.cat !== undefined) cleanChanges.cat = changes.cat;
    if (changes.date !== undefined) cleanChanges.date = changes.date;

    await db.moves.update(Number(id), cleanChanges);
    return await db.moves.get(Number(id));
  },

  async delete(id) {
    await db.moves.delete(Number(id));
    return true;
  },
};

