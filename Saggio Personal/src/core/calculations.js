import { CARD_PAYMENT_TYPES } from './constants.js';
import { getQuincenaFromDate } from './formatters.js';

/**
 * Calcula el saldo actual de una tarjeta de crédito:
 * Saldo = Deuda inicial + Nuevos préstamos/cargos - Cuotas pagadas - Abonos a capital.
 */
export function calculateCardBalance(initialDebt = 0, payments = []) {
  let balance = Number(initialDebt) || 0;

  for (const payment of payments) {
    const amount = Number(payment.amount) || 0;
    if (payment.type === CARD_PAYMENT_TYPES.CARGO) {
      balance += amount; // Préstamo o compra nueva suma a la deuda
    } else if (payment.type === CARD_PAYMENT_TYPES.CUOTA || payment.type === CARD_PAYMENT_TYPES.ABONO) {
      balance -= amount; // Cuotas y abonos reducen la deuda
    }
  }

  return Math.max(0, balance);
}

/**
 * Calcula los totales históricos pagados por tipo para una tarjeta
 */
export function calculateCardHistoricalTotals(payments = []) {
  let totalCuotas = 0;
  let totalAbonos = 0;
  let totalCargos = 0;

  for (const payment of payments) {
    const amount = Number(payment.amount) || 0;
    if (payment.type === CARD_PAYMENT_TYPES.CUOTA) {
      totalCuotas += amount;
    } else if (payment.type === CARD_PAYMENT_TYPES.ABONO) {
      totalAbonos += amount;
    } else if (payment.type === CARD_PAYMENT_TYPES.CARGO) {
      totalCargos += amount;
    }
  }

  return {
    totalCuotas,
    totalAbonos,
    totalCargos,
    totalPaid: totalCuotas + totalAbonos,
  };
}

/**
 * Calcula el estado de la cuota del mes para una tarjeta:
 * - Un abono NO cuenta como cuota del mes.
 * - Una cuota está pendiente si lo pagado como cuota en el mes < cuota mensual.
 * - El valor pendiente nunca puede superar el saldo actual.
 */
export function calculateCardMonthStatus(card, cardPayments = [], ym) {
  const currentBalance = calculateCardBalance(card.initial, cardPayments);
  const monthlyQuota = Number(card.monthly) || 0;

  // Filtrar pagos realizados en este mes (AAAA-MM)
  const paymentsInMonth = cardPayments.filter(p => p.date && p.date.startsWith(ym));

  const cuotasPaidInMonth = paymentsInMonth
    .filter(p => p.type === CARD_PAYMENT_TYPES.CUOTA)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const abonosPaidInMonth = paymentsInMonth
    .filter(p => p.type === CARD_PAYMENT_TYPES.ABONO)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const isCardPaidOff = currentBalance <= 0;
  const isQuotaFulfilled = cuotasPaidInMonth >= monthlyQuota || isCardPaidOff;

  // Cuota pendiente: lo que falta por pagar de la cuota mensual, topada por el saldo
  const pendingQuota = isQuotaFulfilled
    ? 0
    : Math.min(Math.max(0, monthlyQuota - cuotasPaidInMonth), currentBalance);

  return {
    currentBalance,
    monthlyQuota,
    cuotasPaidInMonth,
    abonosPaidInMonth,
    pendingQuota,
    isQuotaFulfilled,
    isCardPaidOff,
    paymentsInMonth,
  };
}

/**
 * Resumen de todas las tarjetas para métricas globales
 */
export function calculateCardsSummary(cards = [], allCardPayments = [], ym) {
  let totalDebt = 0;
  let totalInitial = 0;
  let totalPaidOverall = 0;
  let totalMonthlyQuotas = 0;
  let totalPendingThisMonth = 0;

  const cardDetails = cards.map(card => {
    const paymentsForCard = allCardPayments.filter(p => p.cardId === card.id);
    const balance = calculateCardBalance(card.initial, paymentsForCard);
    const historical = calculateCardHistoricalTotals(paymentsForCard);
    const monthStatus = calculateCardMonthStatus(card, paymentsForCard, ym);

    totalDebt += balance;
    totalInitial += Number(card.initial) || 0;
    totalPaidOverall += historical.totalPaid;
    
    // Solo sumamos cuotas mensuales de tarjetas activas
    if (balance > 0) {
      totalMonthlyQuotas += Number(card.monthly) || 0;
    }
    totalPendingThisMonth += monthStatus.pendingQuota;

    return {
      ...card,
      currentBalance: balance,
      ...historical,
      ...monthStatus,
    };
  });

  return {
    totalDebt,
    totalInitial,
    totalPaidOverall,
    totalMonthlyQuotas,
    totalPendingThisMonth,
    cardDetails,
  };
}

/**
 * Calcula el estado de los fijos para el mes seleccionado
 */
export function calculateFixedMonthStatus(fixedList = [], fixedPaymentsInMonth = []) {
  const paymentsMap = new Map();
  for (const fp of fixedPaymentsInMonth) {
    paymentsMap.set(fp.fixedId, fp);
  }

  let totalAmount = 0;
  let paidAmount = 0;
  let countPaid = 0;

  const items = fixedList.map(item => {
    const paidRecord = paymentsMap.get(item.id) || null;
    const isPaid = !!paidRecord;
    const defaultAmount = Number(item.amount) || 0;
    const effectiveAmount = isPaid && paidRecord.amount !== undefined
      ? (Number(paidRecord.amount) || 0)
      : defaultAmount;

    totalAmount += effectiveAmount;

    if (isPaid) {
      paidAmount += effectiveAmount;
      countPaid += 1;
    }

    return {
      ...item,
      amount: effectiveAmount,
      defaultAmount,
      isPaid,
      paidRecord,
    };
  });

  return {
    items,
    totalAmount,
    paidAmount,
    pendingAmount: Math.max(0, totalAmount - paidAmount),
    countPaid,
    countTotal: items.length,
  };
}

/**
 * Helper para saber si una fecha cae en Quincena 1 (días 1 al 15) o Quincena 2 (16 al 30/31)
 */
function getDayFromDate(dateStr) {
  if (!dateStr || !dateStr.includes('-')) return 1;
  const parts = dateStr.split('-');
  return parseInt(parts[2], 10) || 1;
}

/**
 * Helper para obtener los ingresos base (sueldo y aportes) correspondientes a un mes específico (AAAA-MM),
 * soportando vigencia desde una fecha, periodo de apoyo SENA (Sonda Colombia) y periodos históricos archivados.
 */
export function getSalaryForMonth(settings, ym) {
  if (!settings) return { q1: 0, q2: 0, contributionsQ2: 0, senaQ2: 0 };

  // Apoyo sostenimiento SENA - Sonda Colombia: activo desde settings.senaSince (o settings.since) hasta settings.senaUntil (abril 2027)
  let senaQ2 = 0;
  const senaAmount = Number(settings.senaQ2) || 0;
  const senaSince = settings.senaSince || settings.since || '2026-11';
  const senaUntil = settings.senaUntil || '2027-04';
  if (senaAmount > 0 && ym >= senaSince && ym <= senaUntil) {
    senaQ2 = senaAmount;
  }

  // 1. Revisar si hay un periodo histórico que cubra este mes
  if (Array.isArray(settings.history)) {
    const matched = settings.history.find(h => {
      const matchSince = !h.since || ym >= h.since;
      const matchUntil = !h.until || ym <= h.until;
      return matchSince && matchUntil;
    });
    if (matched) {
      return {
        q1: Number(matched.q1) || 0,
        q2: Number(matched.q2) || 0,
        contributionsQ2: Number(matched.contributionsQ2) || 0,
        senaQ2: matched.senaQ2 !== undefined ? (Number(matched.senaQ2) || 0) : senaQ2,
      };
    }
  }

  // 2. Revisar configuración vigente (activa desde settings.since)
  if (settings.since && ym >= settings.since) {
    return {
      q1: Number(settings.q1) || 0,
      q2: Number(settings.q2) || 0,
      contributionsQ2: Number(settings.contributionsQ2) || 0,
      senaQ2,
    };
  }

  return { q1: 0, q2: 0, contributionsQ2: 0, senaQ2: 0 };
}

/**
 * Calcula el resumen completo de la pantalla de Inicio para el mes seleccionado,
 * incluyendo ingresos quincenales, aportes fijos de hermanos y desglose real.
 */
export function calculateMonthOverview({
  cards = [],
  allCardPayments = [],
  fixedList = [],
  fixedPaymentsInMonth = [],
  movesInMonth = [],
  settings = null,
  ym,
  currentYM,
}) {
  // 1. Ingresos de sueldo y aportes fijos
  const { q1: baseSalaryQ1, q2: baseSalaryQ2, contributionsQ2, senaQ2 } = getSalaryForMonth(settings, ym);

  // Ingresos extra divididos por fecha según ciclo de flujo de caja:
  // '1' (Quincena 15): Días 15 al 29
  // '2' (Quincena 30): Días 30 al fin de mes y días 1 al 14
  const extraIncomesList = movesInMonth.filter(m => m.kind === 'ingreso');
  const extraIncomesQ1 = extraIncomesList
    .filter(m => getQuincenaFromDate(m.date) === '1')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const extraIncomesQ2 = extraIncomesList
    .filter(m => getQuincenaFromDate(m.date) === '2')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const totalIncomeQ1 = baseSalaryQ1 + extraIncomesQ1;
  const totalIncomeQ2 = baseSalaryQ2 + contributionsQ2 + senaQ2 + extraIncomesQ2;
  const totalIncome = totalIncomeQ1 + totalIncomeQ2;

  // 2. Gastado en tarjetas por fecha
  const cardPaymentsInMonth = allCardPayments.filter(
    p => p.date && p.date.startsWith(ym) && (p.type === CARD_PAYMENT_TYPES.CUOTA || p.type === CARD_PAYMENT_TYPES.ABONO)
  );

  const cardSpentQ1 = cardPaymentsInMonth
    .filter(p => getQuincenaFromDate(p.date) === '1')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const cardSpentQ2 = cardPaymentsInMonth
    .filter(p => getQuincenaFromDate(p.date) === '2')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const cardSpentThisMonth = cardSpentQ1 + cardSpentQ2;

  // 3. Fijos pagados por quincena
  const fixedSpentQ1 = fixedPaymentsInMonth
    .filter(fp => fp.q === '1' || (!fp.q && getQuincenaFromDate(fp.date) === '1'))
    .reduce((sum, fp) => sum + (Number(fp.amount) || 0), 0);

  const fixedSpentQ2 = fixedPaymentsInMonth
    .filter(fp => fp.q === '2' || (!fp.q && getQuincenaFromDate(fp.date) === '2'))
    .reduce((sum, fp) => sum + (Number(fp.amount) || 0), 0);

  const fixedSpentThisMonth = fixedSpentQ1 + fixedSpentQ2;

  // 4. Imprevistos por fecha
  const unexpectedList = movesInMonth.filter(m => m.kind === 'imprevisto');
  const unexpectedQ1 = unexpectedList
    .filter(m => getQuincenaFromDate(m.date) === '1')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const unexpectedQ2 = unexpectedList
    .filter(m => getQuincenaFromDate(m.date) === '2')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const unexpectedSpentThisMonth = unexpectedQ1 + unexpectedQ2;

  // Totales gastados por quincena
  const spentQ1 = cardSpentQ1 + fixedSpentQ1 + unexpectedQ1;
  const spentQ2 = cardSpentQ2 + fixedSpentQ2 + unexpectedQ2;
  const totalSpent = spentQ1 + spentQ2;

  // 5. Te queda libre real
  const remainingQ1 = totalIncomeQ1 - spentQ1;
  const remainingQ2 = totalIncomeQ2 - spentQ2;
  const remainingThisMonth = totalIncome - totalSpent;

  // 6. Pendientes por quincena (para consultas si se necesitan)
  const cardsSummary = calculateCardsSummary(cards, allCardPayments, ym);
  const fixedSummary = calculateFixedMonthStatus(fixedList, fixedPaymentsInMonth);

  const cardPendingQ1 = cardsSummary.cardDetails
    .filter(c => c.q === '1')
    .reduce((sum, c) => sum + c.pendingQuota, 0);

  const cardPendingQ2 = cardsSummary.cardDetails
    .filter(c => c.q === '2')
    .reduce((sum, c) => sum + c.pendingQuota, 0);

  const fixedPendingQ1 = fixedSummary.items
    .filter(f => f.q === '1' && !f.isPaid)
    .reduce((sum, f) => sum + f.amount, 0);

  const fixedPendingQ2 = fixedSummary.items
    .filter(f => f.q === '2' && !f.isPaid)
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingQ1 = cardPendingQ1 + fixedPendingQ1;
  const pendingQ2 = cardPendingQ2 + fixedPendingQ2;
  const totalPending = pendingQ1 + pendingQ2;

  return {
    baseSalaryQ1,
    baseSalaryQ2,
    contributionsQ2,
    senaQ2,
    baseIncome: baseSalaryQ1 + baseSalaryQ2 + contributionsQ2 + senaQ2,
    extraIncomes: extraIncomesQ1 + extraIncomesQ2,
    totalIncome,
    totalSpent,
    remainingThisMonth,
    totalPending,
    totalCardDebt: cardsSummary.totalDebt,
    cardsSummary,
    fixedSummary,
    unexpectedSpentThisMonth,
    q1: {
      salary: baseSalaryQ1,
      extraIncomes: extraIncomesQ1,
      totalIncome: totalIncomeQ1,
      spent: spentQ1,
      cardSpent: cardSpentQ1,
      fixedSpent: fixedSpentQ1,
      unexpectedSpent: unexpectedQ1,
      remaining: remainingQ1,
      pending: pendingQ1,
    },
    q2: {
      salary: baseSalaryQ2,
      contributions: contributionsQ2,
      sena: senaQ2,
      extraIncomes: extraIncomesQ2,
      totalIncome: totalIncomeQ2,
      spent: spentQ2,
      cardSpent: cardSpentQ2,
      fixedSpent: fixedSpentQ2,
      unexpectedSpent: unexpectedQ2,
      remaining: remainingQ2,
      pending: pendingQ2,
    },
  };
}

/**
 * Calcula el resumen anual para la pantalla de Año
 */
export function calculateAnnualSummary({
  year,
  cards = [],
  allCardPayments = [],
  allFixedPayments = [],
  allMoves = [],
  settings = null,
  currentYM,
}) {
  const yearStr = String(year);
  const [currY, currM] = currentYM.split('-').map(Number);
  const isCurrentYear = Number(year) === currY;
  const isPastYear = Number(year) < currY;

  let totalYearSpent = 0;
  let totalYearIncome = 0;

  const cardMap = new Map();
  for (const c of cards) {
    cardMap.set(c.id, c.name);
  }

  const categoryMap = new Map();

  function addCategoryExpense(catName, subItemName, amount) {
    const val = Number(amount) || 0;
    if (val <= 0) return;
    const cat = catName || 'Otros';
    const subName = subItemName || 'General';

    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, {
        category: cat,
        amount: 0,
        subItemsMap: new Map(),
      });
    }

    const catData = categoryMap.get(cat);
    catData.amount += val;

    if (!catData.subItemsMap.has(subName)) {
      catData.subItemsMap.set(subName, {
        name: subName,
        amount: 0,
        count: 0,
      });
    }

    const subItem = catData.subItemsMap.get(subName);
    subItem.amount += val;
    subItem.count += 1;
  }

  const monthData = [];
  let runningAccumulatedSpent = 0;

  for (let m = 1; m <= 12; m++) {
    const ym = `${yearStr}-${String(m).padStart(2, '0')}`;
    const isFutureMonth = isCurrentYear && m > currM;

    const { q1: q1Sal, q2: q2Sal, contributionsQ2: q2Contrib, senaQ2 } = getSalaryForMonth(settings, ym);
    const monthBaseIncome = q1Sal + q2Sal + q2Contrib + senaQ2;

    const monthMoves = allMoves.filter(move => move.date && move.date.startsWith(ym));
    const monthExtraIncomes = monthMoves
      .filter(move => move.kind === 'ingreso')
      .reduce((sum, move) => sum + (Number(move.amount) || 0), 0);
    const monthUnexpected = monthMoves
      .filter(move => move.kind === 'imprevisto')
      .reduce((sum, move) => sum + (Number(move.amount) || 0), 0);

    const monthIncome = monthBaseIncome + monthExtraIncomes;

    const monthCardPayments = allCardPayments.filter(
      p => p.date && p.date.startsWith(ym) && (p.type === CARD_PAYMENT_TYPES.CUOTA || p.type === CARD_PAYMENT_TYPES.ABONO)
    );
    const monthCardSpent = monthCardPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const monthFixedPayments = allFixedPayments.filter(fp => fp.ym === ym);
    const monthFixedSpent = monthFixedPayments.reduce((sum, fp) => sum + (Number(fp.amount) || 0), 0);

    const monthSpent = monthCardSpent + monthFixedSpent + monthUnexpected;

    if (!isFutureMonth) {
      runningAccumulatedSpent += monthSpent;
      totalYearSpent += monthSpent;
      totalYearIncome += monthIncome;

      for (const p of monthCardPayments) {
        const cName = cardMap.get(p.cardId) || 'Tarjeta de crédito';
        addCategoryExpense('Tarjetas de crédito', cName, Number(p.amount) || 0);
      }
      for (const fp of monthFixedPayments) {
        addCategoryExpense(fp.cat || 'Otros', fp.name || 'Gasto fijo', Number(fp.amount) || 0);
      }
      for (const move of monthMoves.filter(m => m.kind === 'imprevisto')) {
        addCategoryExpense(
          move.cat ? `Imprevistos (${move.cat})` : 'Imprevistos',
          move.description || 'Gasto imprevisto',
          Number(move.amount) || 0
        );
      }
    }

    monthData.push({
      monthIndex: m,
      ym,
      spent: monthSpent,
      income: monthIncome,
      accumulated: runningAccumulatedSpent,
      isFuture: isFutureMonth,
    });
  }

  const maxMonthSpent = Math.max(...monthData.map(d => (d.isFuture ? 0 : d.spent)), 1);

  const categoriesList = Array.from(categoryMap.values())
    .map(catData => {
      const subItems = Array.from(catData.subItemsMap.values())
        .map(sub => ({
          ...sub,
          percentage: catData.amount > 0 ? (sub.amount / catData.amount) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      return {
        category: catData.category,
        amount: catData.amount,
        percentage: totalYearSpent > 0 ? (catData.amount / totalYearSpent) * 100 : 0,
        subItems,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  let elapsedMonths = 12;
  if (isCurrentYear) {
    elapsedMonths = Math.max(1, currM);
  } else if (!isPastYear) {
    elapsedMonths = 1;
  }
  const monthlyAverageSpent = Math.round(totalYearSpent / elapsedMonths);

  return {
    year: Number(year),
    totalYearSpent,
    totalYearIncome,
    yearBalance: totalYearIncome - totalYearSpent,
    monthlyAverageSpent,
    categoriesList,
    monthData,
    maxMonthSpent,
  };
}

/**
 * Calcula las métricas financieras de un crédito bancario de libre inversión/consumo
 */
export function calculateCreditMetrics(credit, payments = []) {
  if (!credit) return null;

  const originalAmount = Number(credit.originalAmount) || 0;
  const currentBalance = Number(credit.currentBalance) || 0;
  const termTotal = Number(credit.termTotal) || 72;
  const termPaid = Number(credit.currentTermPaid) || 0;
  const termRemaining = Math.max(0, termTotal - termPaid);

  const capitalAmortizado = Math.max(0, originalAmount - currentBalance);
  const porcentajePagado = termTotal > 0 ? Math.min(100, Math.round((termPaid / termTotal) * 100)) : 0;

  // Totales de pagos registrados
  let totalPaid = 0;
  let totalAbonosExtraordinarios = 0;
  let totalCuotasOrdinarias = 0;
  let totalCuotasAhorradas = 0;

  for (const p of payments) {
    const val = Number(p.amount) || 0;
    totalPaid += val;
    if (p.type === 'abono') {
      totalAbonosExtraordinarios += val;
      if (p.cuotasAhorradas) totalCuotasAhorradas += Number(p.cuotasAhorradas);
    } else if (p.type === 'cuota') {
      totalCuotasOrdinarias += val;
    }
  }

  // Tasa de interés mensual estimada a partir de la EA: i = (1 + EA)^(1/12) - 1
  const rateEA = Number(credit.rateEA) || 24.90;
  const monthlyRate = Math.pow(1 + rateEA / 100, 1 / 12) - 1;
  const nextMonthInterest = Math.round(currentBalance * monthlyRate);
  const insuranceMonthly = Number(credit.insuranceMonthly) || 33444;
  const estimatedQuota = Number(credit.nextQuotaAmount) || Number(credit.monthlyQuotaEstimate) || 334035;
  const estimatedCapital = Math.max(0, estimatedQuota - nextMonthInterest - insuranceMonthly);

  return {
    originalAmount,
    currentBalance,
    capitalAmortizado,
    termTotal,
    termPaid,
    termRemaining,
    porcentajePagado,
    totalPaid,
    totalAbonosExtraordinarios,
    totalCuotasOrdinarias,
    totalCuotasAhorradas,
    monthlyRate,
    nextMonthInterest,
    insuranceMonthly,
    estimatedQuota,
    estimatedCapital,
  };
}
