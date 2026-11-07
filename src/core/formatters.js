/**
 * Formateador de moneda en pesos colombianos (COP).
 * Sin decimales, formato: $1.250.000 o -$250.000
 */
export function formatCOP(amount) {
  const num = Math.round(Number(amount) || 0);
  const isNegative = num < 0;
  const absFormatted = Math.abs(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return isNegative ? `-$${absFormatted}` : `$${absFormatted}`;
}

/**
 * Convierte un texto con puntos/símbolos a número entero.
 */
export function parseCOP(value) {
  if (typeof value === 'number') return Math.round(value);
  if (!value) return 0;
  const cleaned = value.toString().replace(/[^\d-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Obtiene la fecha actual en hora local de Colombia (UTC-5) en formato YYYY-MM-DD.
 * Sin desfase por conversión UTC.
 */
export function getCurrentColombiaDate() {
  const now = new Date();
  // Colombia es UTC-5 todo el año (sin horario de verano)
  const offset = -5 * 60; // minutos
  const localTime = new Date(now.getTime() + (now.getTimezoneOffset() + offset) * 60000);
  
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, '0');
  const day = String(localTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene el año y mes actual en hora de Colombia (YYYY-MM).
 */
export function getCurrentColombiaYM() {
  return getCurrentColombiaDate().slice(0, 7);
}

/**
 * Determina a qué quincena pertenece una fecha (YYYY-MM-DD) según el flujo de caja real del usuario:
 * - '1' (Quincena del 15): Días 15 al 29. Financiados con el sueldo recibido el 15.
 * - '2' (Quincena del 30): Días 30 al fin de mes y días 1 al 14. Financiados con el sueldo recibido el 30.
 */
export function getQuincenaFromDate(dateStr) {
  if (!dateStr || !dateStr.includes('-')) return '2';
  const parts = dateStr.split('-');
  const day = parseInt(parts[2], 10) || 1;
  return (day >= 15 && day <= 29) ? '1' : '2';
}

/**
 * Retorna la quincena actual en curso según la fecha de hoy.
 */
export function getCurrentQuincena(dateStr = null) {
  const date = dateStr || getCurrentColombiaDate();
  return getQuincenaFromDate(date);
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Formatea 'YYYY-MM' como 'Noviembre 2026'
 */
export function formatMonthName(ym) {
  if (!ym || !ym.includes('-')) return '';
  const [yearStr, monthStr] = ym.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const monthName = MONTH_NAMES[monthIdx] || '';
  return `${monthName} ${yearStr}`;
}

/**
 * Mueve un YYYY-MM en delta meses (+1, -1)
 */
export function shiftMonth(ym, delta) {
  if (!ym) return getCurrentColombiaYM();
  const [y, m] = ym.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  const newY = date.getFullYear();
  const newM = String(date.getMonth() + 1).padStart(2, '0');
  return `${newY}-${newM}`;
}

/**
 * Mueve un año en delta (+1, -1)
 */
export function shiftYear(year, delta) {
  return Number(year) + delta;
}

/**
 * Formatea una fecha YYYY-MM-DD para visualización amigable colombiana: "15 nov 2026"
 */
export function formatDateFriendly(dateStr) {
  if (!dateStr || !dateStr.includes('-')) return dateStr || '';
  const [y, m, d] = dateStr.split('-');
  const monthShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][parseInt(m, 10) - 1];
  return `${parseInt(d, 10)} ${monthShort} ${y}`;
}

