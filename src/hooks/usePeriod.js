import { useState, useMemo } from 'react';
import {
  getCurrentColombiaYM,
  getCurrentColombiaDate,
  getCurrentQuincena,
  shiftMonth,
  shiftYear,
  formatMonthName,
} from '../core/formatters.js';

export function usePeriod() {
  const [selectedYM, setSelectedYM] = useState(() => getCurrentColombiaYM());
  const [selectedYear, setSelectedYear] = useState(() => {
    return parseInt(getCurrentColombiaYM().split('-')[0], 10);
  });

  const currentRealYM = useMemo(() => getCurrentColombiaYM(), []);
  const currentRealDate = useMemo(() => getCurrentColombiaDate(), []);
  const currentRealQuincena = useMemo(() => getCurrentQuincena(currentRealDate), [currentRealDate]);

  const monthLabel = useMemo(() => formatMonthName(selectedYM), [selectedYM]);

  const goToPrevMonth = () => setSelectedYM(prev => shiftMonth(prev, -1));
  const goToNextMonth = () => setSelectedYM(prev => shiftMonth(prev, 1));
  const goToCurrentMonth = () => setSelectedYM(currentRealYM);

  const goToPrevYear = () => setSelectedYear(prev => shiftYear(prev, -1));
  const goToNextYear = () => setSelectedYear(prev => shiftYear(prev, 1));

  return {
    selectedYM,
    setSelectedYM,
    selectedYear,
    setSelectedYear,
    currentRealYM,
    currentRealDate,
    currentRealQuincena, // '1' o '2' para etiqueta "Ahora"
    monthLabel,
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
    goToPrevYear,
    goToNextYear,
  };
}

