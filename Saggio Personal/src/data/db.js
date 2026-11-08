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

    this.version(2).stores({
      credits: 'id, name, bank',
      creditPayments: '++id, creditId, type, ym, date',
    });
  }
}

export const db = new MisCuentasDB();
