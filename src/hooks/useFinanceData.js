import { useEffect, useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db.js';
import { backupRepository } from '../data/repositories/backupRepository.js';

export function useFinanceData() {
  const [isInitialized, setIsInitialized] = useState(false);
  const hasSeededRef = useRef(false);

  // Inicialización y limpieza automática de duplicados
  useEffect(() => {
    if (hasSeededRef.current) return;
    hasSeededRef.current = true;

    async function init() {
      try {
        await backupRepository.cleanDuplicatesAndSeed();
      } catch (err) {
        console.error('Error seeding suggestions:', err);
      } finally {
        setIsInitialized(true);
      }
    }
    init();
  }, []);

  // Consultas reactivas en tiempo real mediante useLiveQuery
  const cards = useLiveQuery(() => db.cards.toArray(), [], []);
  const allCardPayments = useLiveQuery(() => db.cardPayments.toArray(), [], []);
  const fixedList = useLiveQuery(() => db.fixed.toArray(), [], []);
  const allFixedPayments = useLiveQuery(() => db.fixedPayments.toArray(), [], []);
  const allMoves = useLiveQuery(() => db.moves.toArray(), [], []);
  const settingsList = useLiveQuery(() => db.settings.toArray(), [], []);

  const settings = settingsList && settingsList.length > 0 ? settingsList[0] : null;

  return {
    isInitialized,
    cards: cards || [],
    allCardPayments: allCardPayments || [],
    fixedList: fixedList || [],
    allFixedPayments: allFixedPayments || [],
    allMoves: allMoves || [],
    settings,
  };
}
