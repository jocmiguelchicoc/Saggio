import Dexie from 'dexie';

export class MisCuentasDB extends Dexie {
  constructor() {
    super('MisCuentasDB');

    this.version(1).stores({
      cards: '++id, name, q',
      cardPayments: '++id, cardId, type, date, [cardId+type]',
      fixed: '++id, name, q, cat',
      fixedPayments: 'id, fixedId, ym, q, cat, date',
      moves: '++id, kind, date, cat',
      settings: 'id',
    });
  }
}

export const db = new MisCuentasDB();

