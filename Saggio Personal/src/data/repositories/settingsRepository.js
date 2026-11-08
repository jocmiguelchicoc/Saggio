import { db } from '../db.js';

const SETTINGS_ID = 'user_settings';

function getPreviousMonth(ym) {
  if (!ym || !ym.includes('-')) return '';
  const [year, month] = ym.split('-').map(Number);
  if (month === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${String(month - 1).padStart(2, '0')}`;
}

export const settingsRepository = {
  async get() {
    const record = await db.settings.get(SETTINGS_ID);
    if (!record) {
      return {
        id: SETTINGS_ID,
        q1: 929000,
        q2: 929000,
        contributionsQ2: 600000,
        senaQ2: 1300000,
        senaUntil: '2027-04',
        since: '2026-11',
        history: [],
      };
    }
    // Asegurar valores por defecto si no estaban presentes
    return {
      ...record,
      senaQ2: record.senaQ2 !== undefined ? record.senaQ2 : 1300000,
      senaUntil: record.senaUntil || '2027-04',
    };
  },

  async save(settingsData) {
    const current = await this.get();
    let history = Array.isArray(current.history) ? [...current.history] : [];

    // Si el usuario cambia el sueldo a partir de un nuevo mes futuro (ej. 2027-01),
    // archivamos automáticamente el periodo anterior en el historial
    const newSince = settingsData.since || '2026-11';
    if (current.since && newSince > current.since && current.q1 > 0) {
      history.push({
        since: current.since,
        until: getPreviousMonth(newSince),
        q1: current.q1,
        q2: current.q2,
        contributionsQ2: current.contributionsQ2,
        senaQ2: current.senaQ2,
      });
    }

    const data = {
      id: SETTINGS_ID,
      q1: Math.round(Number(settingsData.q1) || 0),
      q2: Math.round(Number(settingsData.q2) || 0),
      contributionsQ2: Math.round(Number(settingsData.contributionsQ2) || 0),
      senaQ2: Math.round(Number(settingsData.senaQ2) || 0),
      senaUntil: settingsData.senaUntil || '2027-04',
      since: newSince,
      history,
    };
    await db.settings.put(data);
    return data;
  },
};
