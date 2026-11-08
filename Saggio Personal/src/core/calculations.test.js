import { describe, it, expect } from 'vitest';
import {
  calculateCardBalance,
  calculateCardMonthStatus,
  calculateFixedMonthStatus,
  calculateMonthOverview,
  calculateAnnualSummary,
  calculateCreditMetrics,
} from './calculations.js';
import { parseAvVillasTokens } from './avVillasParser.js';
import { getQuincenaFromDate } from './formatters.js';
import { CARD_PAYMENT_TYPES } from './constants.js';

describe('Cálculos financieros - Reglas de Negocio', () => {
  it('Criterio 1: Tarjeta con deuda inicial $3.000.000, cuota $250.000 y abono de $100.000 tras pagar cuota muestra saldo $2.650.000', () => {
    const initialDebt = 3000000;
    const payments = [
      { id: 1, type: CARD_PAYMENT_TYPES.CUOTA, amount: 250000, date: '2026-11-05' },
      { id: 2, type: CARD_PAYMENT_TYPES.ABONO, amount: 100000, date: '2026-11-06' },
    ];

    const balance = calculateCardBalance(initialDebt, payments);
    expect(balance).toBe(2650000);
  });

  it('Criterio 2: Un abono reduce el saldo pero NO marca como pagada la cuota del mes', () => {
    const card = { id: 1, initial: 3000000, monthly: 250000, q: '1' };
    const payments = [
      { id: 1, type: CARD_PAYMENT_TYPES.ABONO, amount: 100000, date: '2026-11-02' },
    ];

    const status = calculateCardMonthStatus(card, payments, '2026-11');
    expect(status.currentBalance).toBe(2900000);
    expect(status.isQuotaFulfilled).toBe(false);
    expect(status.pendingQuota).toBe(250000);
    expect(status.abonosPaidInMonth).toBe(100000);
    expect(status.cuotasPaidInMonth).toBe(0);
  });

  it('Nuevo requerimiento: Prestar / Cargo nuevo a la tarjeta suma a la deuda actual', () => {
    const card = { id: 1, initial: 2650000, monthly: 250000, q: '1' };
    const payments = [
      { id: 1, type: CARD_PAYMENT_TYPES.CARGO, amount: 500000, date: '2026-11-07' },
    ];

    const balance = calculateCardBalance(card.initial, payments);
    expect(balance).toBe(3150000);
  });

  it('Criterio 3: Al cambiar de mes, una obligación fija o cuota vuelve a aparecer pendiente', () => {
    const fixedList = [
      { id: 10, name: 'Arriendo', amount: 1200000, q: '2', cat: 'Vivienda' },
    ];
    const fixedPaymentsNov = [
      { id: '10_2026-11', fixedId: 10, ym: '2026-11', amount: 1200000, date: '2026-11-02' },
    ];

    // En noviembre está pagado
    const statusNov = calculateFixedMonthStatus(fixedList, fixedPaymentsNov);
    expect(statusNov.paidAmount).toBe(1200000);
    expect(statusNov.pendingAmount).toBe(0);
    expect(statusNov.items[0].isPaid).toBe(true);

    // En diciembre está pendiente automáticamente
    const statusDec = calculateFixedMonthStatus(fixedList, []);
    expect(statusDec.paidAmount).toBe(0);
    expect(statusDec.pendingAmount).toBe(1200000);
    expect(statusDec.items[0].isPaid).toBe(false);
  });

  it('Requerimiento usuario: Apoyo SENA - Sonda Colombia $1.300.000 en Quincena 30 activo de 2026-11 a 2027-04', () => {
    const userSettings = {
      id: 'user_settings',
      q1: 929000,
      q2: 929000,
      contributionsQ2: 600000,
      senaQ2: 1300000,
      senaUntil: '2027-04',
      since: '2026-11',
    };

    // Noviembre 2026
    const overviewNov = calculateMonthOverview({
      cards: [],
      allCardPayments: [],
      fixedList: [],
      fixedPaymentsInMonth: [],
      movesInMonth: [],
      settings: userSettings,
      ym: '2026-11',
      currentYM: '2026-11',
    });

    expect(overviewNov.q1.salary).toBe(929000);
    expect(overviewNov.q2.salary).toBe(929000);
    expect(overviewNov.q2.contributions).toBe(600000);
    expect(overviewNov.q2.sena).toBe(1300000);
    // 929.000 + 600.000 + 1.300.000 = 2.829.000
    expect(overviewNov.q2.totalIncome).toBe(2829000);
    // 929.000 (Q15) + 2.829.000 (Q30) = 3.758.000
    expect(overviewNov.totalIncome).toBe(3758000);

    // En abril 2027 sigue activo
    const overviewApr27 = calculateMonthOverview({
      cards: [],
      allCardPayments: [],
      fixedList: [],
      fixedPaymentsInMonth: [],
      movesInMonth: [],
      settings: userSettings,
      ym: '2027-04',
      currentYM: '2026-11',
    });
    expect(overviewApr27.q2.sena).toBe(1300000);
    expect(overviewApr27.q2.totalIncome).toBe(2829000);

    // En mayo 2027 finaliza la etapa lectiva y senaQ2 se vuelve 0
    const overviewMay27 = calculateMonthOverview({
      cards: [],
      allCardPayments: [],
      fixedList: [],
      fixedPaymentsInMonth: [],
      movesInMonth: [],
      settings: userSettings,
      ym: '2027-05',
      currentYM: '2026-11',
    });
    expect(overviewMay27.q2.sena).toBe(0);
    expect(overviewMay27.q2.totalIncome).toBe(1529000);
  });

  it('Historial de sueldo: cuando el usuario cambia el sueldo en 2027, preserva 2026 intacto', () => {
    const settingsWithHistory = {
      id: 'user_settings',
      q1: 1050000, // Nuevo sueldo 2027
      q2: 1050000,
      contributionsQ2: 650000,
      since: '2027-01',
      history: [
        {
          since: '2026-11',
          until: '2026-12',
          q1: 929000,
          q2: 929000,
          contributionsQ2: 600000,
        },
      ],
    };

    // Noviembre 2026 lee del historial
    const overviewNov26 = calculateMonthOverview({
      cards: [],
      allCardPayments: [],
      fixedList: [],
      fixedPaymentsInMonth: [],
      movesInMonth: [],
      settings: settingsWithHistory,
      ym: '2026-11',
      currentYM: '2027-01',
    });
    expect(overviewNov26.q1.salary).toBe(929000);
    expect(overviewNov26.totalIncome).toBe(2458000);

    // Enero 2027 lee del nuevo sueldo
    const overviewJan27 = calculateMonthOverview({
      cards: [],
      allCardPayments: [],
      fixedList: [],
      fixedPaymentsInMonth: [],
      movesInMonth: [],
      settings: settingsWithHistory,
      ym: '2027-01',
      currentYM: '2027-01',
    });
    expect(overviewJan27.q1.salary).toBe(1050000);
    expect(overviewJan27.totalIncome).toBe(2750000);
  });

  it('Criterio 5: El resumen anual acumula mes a mes y agrupa por categorías', () => {
    const annual = calculateAnnualSummary({
      year: 2026,
      cards: [],
      allCardPayments: [
        { id: 1, type: CARD_PAYMENT_TYPES.CUOTA, amount: 200000, date: '2026-01-10' },
        { id: 2, type: CARD_PAYMENT_TYPES.CUOTA, amount: 200000, date: '2026-02-10' },
      ],
      allFixedPayments: [
        { id: '1_2026-01', ym: '2026-01', amount: 300000, cat: 'Servicios' },
        { id: '1_2026-02', ym: '2026-02', amount: 300000, cat: 'Servicios' },
      ],
      allMoves: [],
      settings: null,
      currentYM: '2026-02',
    });

    expect(annual.totalYearSpent).toBe(1000000);
    expect(annual.monthData[0].spent).toBe(500000);
    expect(annual.monthData[0].accumulated).toBe(500000);
    expect(annual.monthData[1].spent).toBe(500000);
    expect(annual.monthData[1].accumulated).toBe(1000000);
    expect(annual.categoriesList.length).toBe(2);
  });

  it('Flujo de quincenas real: días 15 al 29 corresponden a Quincena del 15, y días 30 al 14 a Quincena del 30', () => {
    // Quincena del 15 (financiada por el sueldo del 15): días 15 al 29
    expect(getQuincenaFromDate('2026-11-15')).toBe('1');
    expect(getQuincenaFromDate('2026-11-16')).toBe('1');
    expect(getQuincenaFromDate('2026-11-20')).toBe('1');
    expect(getQuincenaFromDate('2026-11-29')).toBe('1');

    // Quincena del 30 (financiada por el sueldo del 30): días 30, 31 y días 1 al 14
    expect(getQuincenaFromDate('2026-11-30')).toBe('2');
    expect(getQuincenaFromDate('2026-10-31')).toBe('2');
    expect(getQuincenaFromDate('2026-11-01')).toBe('2');
    expect(getQuincenaFromDate('2026-11-06')).toBe('2');
    expect(getQuincenaFromDate('2026-11-14')).toBe('2');
  });

  it('Desglose de gastos en calculateMonthOverview descuenta según el ciclo de quincenas real', () => {
    const settings = {
      id: 'user_settings',
      q1: 929000,
      q2: 929000,
      contributionsQ2: 600000,
      senaQ2: 1300000,
      since: '2026-11',
    };

    // Pago de tarjeta el día 18 (Quincena 15) por $200.000
    // Pago de tarjeta el día 2 (Quincena 30) por $150.000
    const cardPayments = [
      { id: 1, cardId: 'c1', type: CARD_PAYMENT_TYPES.CUOTA, amount: 200000, date: '2026-11-18' },
      { id: 2, cardId: 'c1', type: CARD_PAYMENT_TYPES.CUOTA, amount: 150000, date: '2026-11-02' },
    ];

    // Imprevisto el día 25 (Quincena 15) por $50.000
    // Ingreso extra el día 5 (Quincena 30) por $100.000
    const moves = [
      { id: 1, kind: 'imprevisto', amount: 50000, date: '2026-11-25', description: 'Reparación' },
      { id: 2, kind: 'ingreso', amount: 100000, date: '2026-11-05', description: 'Venta usada' },
    ];

    const overview = calculateMonthOverview({
      cards: [{ id: 'c1', initial: 1000000, monthly: 200000 }],
      allCardPayments: cardPayments,
      fixedList: [],
      fixedPaymentsInMonth: [],
      movesInMonth: moves,
      settings,
      ym: '2026-11',
      currentYM: '2026-11',
    });

    // Quincena 15:
    // Ingreso: $929.000
    // Gastos: $200.000 (tarjeta del día 18) + $50.000 (imprevisto del día 25) = $250.000
    // Sobrante: 929.000 - 250.000 = $679.000
    expect(overview.q1.totalIncome).toBe(929000);
    expect(overview.q1.cardSpent).toBe(200000);
    expect(overview.q1.unexpectedSpent).toBe(50000);
    expect(overview.q1.spent).toBe(250000);
    expect(overview.q1.remaining).toBe(679000);

    // Quincena 30:
    // Ingresos: $929.000 (sueldo) + $600.000 (aportes) + $1.300.000 (SENA) + $100.000 (extra día 5) = $2.929.000
    // Gastos: $150.000 (tarjeta del día 2)
    // Sobrante: 2.929.000 - 150.000 = $2.779.000
    expect(overview.q2.totalIncome).toBe(2929000);
    expect(overview.q2.cardSpent).toBe(150000);
    expect(overview.q2.spent).toBe(150000);
    expect(overview.q2.remaining).toBe(2779000);
  });

  it('Pago de gasto fijo en cero (ej. Internet $0 pagado con $80.000) computa correctamente en el estado del mes', () => {
    const fixedList = [
      { id: 1, name: 'Internet', amount: 0, q: '2', cat: 'Servicios' },
      { id: 2, name: 'Arriendo', amount: 1200000, q: '2', cat: 'Vivienda' },
    ];

    // Pago registrado de Internet por $80.000 en noviembre
    const fixedPayments = [
      { id: '1_2026-11', fixedId: 1, ym: '2026-11', amount: 80000, date: '2026-11-06' },
    ];

    const status = calculateFixedMonthStatus(fixedList, fixedPayments);

    // Internet ahora tiene amount: 80000 e isPaid: true
    const internet = status.items.find(i => i.id === 1);
    expect(internet.amount).toBe(80000);
    expect(internet.isPaid).toBe(true);

    // Arriendo sigue pendiente por $1.200.000
    const arriendo = status.items.find(i => i.id === 2);
    expect(arriendo.amount).toBe(1200000);
    expect(arriendo.isPaid).toBe(false);

    // Total del mes: $1.280.000 ($80.000 Internet + $1.200.000 Arriendo)
    // Pagado: $80.000
    // Falta: $1.200.000
    expect(status.totalAmount).toBe(1280000);
    expect(status.paidAmount).toBe(80000);
    expect(status.pendingAmount).toBe(1200000);
    expect(status.countPaid).toBe(1);
  });

  it('Desglose anual por conceptos (subItems) permite ver en qué se gastó dentro de cada categoría', () => {
    const cards = [
      { id: 'c1', name: 'American Express (*2900)' },
    ];
    const allCardPayments = [
      { id: 1, cardId: 'c1', type: CARD_PAYMENT_TYPES.CUOTA, amount: 300000, date: '2026-11-18' },
    ];
    const allFixedPayments = [
      { id: 'f1', fixedId: 1, name: 'Luz', cat: 'Servicios', amount: 90000, ym: '2026-11' },
      { id: 'f2', fixedId: 2, name: 'Internet', cat: 'Servicios', amount: 80000, ym: '2026-11' },
      { id: 'f3', fixedId: 3, name: 'Gas', cat: 'Servicios', amount: 30000, ym: '2026-11' },
      { id: 'f4', fixedId: 4, name: 'Comida/Mercado', cat: 'Alimentación', amount: 400000, ym: '2026-11' },
    ];

    const summary = calculateAnnualSummary({
      year: 2026,
      cards,
      allCardPayments,
      allFixedPayments,
      allMoves: [],
      settings: null,
      currentYM: '2026-11',
    });

    // Debe contener las categorías
    const servicios = summary.categoriesList.find(c => c.category === 'Servicios');
    expect(servicios).toBeDefined();
    expect(servicios.amount).toBe(200000); // 90.000 + 80.000 + 30.000
    expect(servicios.subItems.length).toBe(3);

    // Los subItems están ordenados por monto mayor
    expect(servicios.subItems[0].name).toBe('Luz');
    expect(servicios.subItems[0].amount).toBe(90000);
    expect(servicios.subItems[1].name).toBe('Internet');
    expect(servicios.subItems[1].amount).toBe(80000);
    expect(servicios.subItems[2].name).toBe('Gas');
    expect(servicios.subItems[2].amount).toBe(30000);

    // Alimentación
    const alimentacion = summary.categoriesList.find(c => c.category === 'Alimentación');
    expect(alimentacion.subItems[0].name).toBe('Comida/Mercado');
    expect(alimentacion.subItems[0].amount).toBe(400000);

    // Tarjetas de crédito
    const tarjetas = summary.categoriesList.find(c => c.category === 'Tarjetas de crédito');
    expect(tarjetas.subItems[0].name).toBe('American Express (*2900)');
    expect(tarjetas.subItems[0].amount).toBe(300000);
  });

  it('Crédito Bancario AV Villas: Saldo $8.641.103 con 29 cuotas de 72 muestra 40% pagado y 43 restantes', () => {
    const credit = {
      id: 'av_villas_personal',
      originalAmount: 11971584,
      currentBalance: 8641103,
      termTotal: 72,
      currentTermPaid: 29,
      rateEA: 24.90,
      insuranceMonthly: 33444,
      nextQuotaAmount: 334035,
    };
    const payments = [
      { id: 1, type: 'abono', amount: 2000000, cuotasAhorradas: 19 },
      { id: 2, type: 'abono', amount: 600000, cuotasAhorradas: 4 },
      { id: 3, type: 'cuota', amount: 340000 },
    ];

    const metrics = calculateCreditMetrics(credit, payments);
    expect(metrics.termRemaining).toBe(43);
    expect(metrics.porcentajePagado).toBe(40);
    expect(metrics.capitalAmortizado).toBe(3330481);
    expect(metrics.totalAbonosExtraordinarios).toBe(2600000);
    expect(metrics.totalCuotasAhorradas).toBe(23);
  });

  it('Parser AV Villas: extrae correctamente cuotas pagadas 28, pendientes 44 y capital $8.778.149 de tokens', () => {
    const tokensP1 = [
      'AV Villas', 'CUOTA FIJA', '$11,971,584.00', '24.90', '24.90',
      '072', '28', '44', '0', '$8,778,149.00',
      '$0.00', '$71,137.00', '$140,086.00', '$166,595.00', 'TOTAL PAGADO', '$340,000.00'
    ];
    const tokensP2 = [
      'PAGUE HASTA:', 'TOTAL A PAGAR:', '$339,498.00', '02NOV2026'
    ];

    const parsed = parseAvVillasTokens(tokensP1, tokensP2);
    expect(parsed.cuotasPagadas).toBe(28);
    expect(parsed.cuotasPendientes).toBe(44);
    expect(parsed.capitalTotal).toBe(8778149);
    expect(parsed.proximaCuota).toBe(339498);
    expect(parsed.fechaLimitePago).toBe('02 de Noviembre de 2026');
  });
});
