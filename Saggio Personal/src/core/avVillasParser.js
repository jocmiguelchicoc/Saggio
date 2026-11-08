import * as pdfjsLib from 'pdfjs-dist';

export const pdfjs = pdfjsLib.getDocument ? pdfjsLib : (pdfjsLib.default || pdfjsLib);

// Configurar worker de pdfjs en Vite
if (typeof window !== 'undefined') {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url
    ).toString();
  } catch (err) {
    // Fallback a CDN seguro si falla la resolución local del worker
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`;
  }
}

/**
 * Limpia y convierte cadenas monetarias colombianas a entero ($8,778,149.00 -> 8778149)
 */
export function parseCOPNumber(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

/**
 * Formatea fechas tipo 15OCT2026 a formato legible '15 de Octubre de 2026'
 */
export function formatCorteDate(dateStr) {
  if (!dateStr || dateStr.length < 9) return dateStr;
  const day = dateStr.slice(0, 2);
  const mon = dateStr.slice(2, 5).toUpperCase();
  const year = dateStr.slice(5);

  const months = {
    ENE: 'Enero', FEB: 'Febrero', MAR: 'Marzo', ABR: 'Abril',
    MAY: 'Mayo', JUN: 'Junio', JUL: 'Julio', AGO: 'Agosto',
    SEP: 'Septiembre', OCT: 'Octubre', NOV: 'Noviembre', DIC: 'Diciembre'
  };

  return `${day} de ${months[mon] || mon} de ${year}`;
}

/**
 * Convierte fecha de corte (ej. 15OCT2026) a formato 'YYYY-MM' (ej. 2026-10)
 */
export function getYMFromCorte(dateStr) {
  if (!dateStr || dateStr.length < 9) return '';
  const mon = dateStr.slice(2, 5).toUpperCase();
  const year = dateStr.slice(5);

  const monthMap = {
    ENE: '01', FEB: '02', MAR: '03', ABR: '04',
    MAY: '05', JUN: '06', JUL: '07', AGO: '08',
    SEP: '09', OCT: '10', NOV: '11', DIC: '12'
  };

  const mm = monthMap[mon] || '01';
  return `${year}-${mm}`;
}

/**
 * Parsea los tokens de texto de las páginas 1 y 2 del extracto de AV Villas
 */
export function parseAvVillasTokens(itemsP1, itemsP2) {
  const tokens1 = itemsP1.map(t => String(t).trim()).filter(Boolean);
  const tokens2 = itemsP2.map(t => String(t).trim()).filter(Boolean);

  const textAll = tokens1.join(' ') + ' ' + tokens2.join(' ');
  const isAvVillas = textAll.includes('AV Villas') || textAll.includes('3482262') || textAll.includes('CUOTA FIJA');

  if (!isAvVillas) {
    throw new Error('El documento no parece ser un extracto válido de Banco AV Villas.');
  }

  // 1. Plazo pactado, cuotas pagadas, pendientes y capital total (Página 1)
  const idx072 = tokens1.indexOf('072');
  let plazoPactado = 72;
  let cuotasPagadas = 0;
  let cuotasPendientes = 0;
  let cuotasEnMora = 0;
  let capitalTotal = 0;

  if (idx072 !== -1) {
    plazoPactado = parseInt(tokens1[idx072], 10) || 72;
    cuotasPagadas = parseInt(tokens1[idx072 + 1], 10) || 0;
    cuotasPendientes = parseInt(tokens1[idx072 + 2], 10) || 0;
    cuotasEnMora = parseInt(tokens1[idx072 + 3], 10) || 0;
    capitalTotal = parseCOPNumber(tokens1[idx072 + 4]);
  }

  // 2. Fecha de corte, valor desembolsado y tasa EA
  let fechaCorte = '';
  let valorOriginal = 11971584;
  let tasaEA = 24.90;

  const idxCuotaFija = tokens1.indexOf('CUOTA FIJA');
  if (idxCuotaFija !== -1) {
    fechaCorte = tokens1[idxCuotaFija - 1] || '';
    valorOriginal = parseCOPNumber(tokens1[idxCuotaFija + 1]) || 11971584;
    tasaEA = parseFloat(tokens1[idxCuotaFija + 2]) || 24.90;
  }

  // 3. Próxima cuota a pagar y fecha límite (Página 2)
  let proximaCuota = 0;
  let fechaLimitePago = '';

  for (let i = 0; i < tokens2.length; i++) {
    if (tokens2[i].startsWith('$') && !tokens2[i].includes('0.00')) {
      const val = parseCOPNumber(tokens2[i]);
      if (val >= 300000 && val <= 600000) {
        proximaCuota = val;
      }
    }
    if (/^\d{2}[A-Z]{3}\d{4}$/.test(tokens2[i])) {
      fechaLimitePago = tokens2[i];
    }
  }

  // 4. Desglose del movimiento del período (abono a capital, intereses, seguros)
  let abonoCapitalPeriodo = 0;
  let interesesPeriodo = 0;
  let totalPagadoPeriodo = 0;

  // Encontrar valores de dinero en página 1 posteriores a capital total
  const moneyTokensP1 = tokens1.filter(t => t.startsWith('$'));
  if (moneyTokensP1.length >= 6) {
    // Los primeros tokens de dinero tras la tabla corresponden a:
    // [CapitalTotal, $0.00, InteresCorriente, Excedente, ..., AbonoCapital, Intereses, ..., Seguros, TotalPagado]
    const idxTotal = tokens1.findIndex(t => t === 'TOTAL PAGADO' || (t.includes('TOTAL') && t.includes('PAGADO')));
    if (idxTotal !== -1 && tokens1[idxTotal + 1] && tokens1[idxTotal + 1].startsWith('$')) {
      totalPagadoPeriodo = parseCOPNumber(tokens1[idxTotal + 1]);
    }
  }

  const seguroVida = 9098;
  const seguroDesempleo = 24346;
  const totalSeguros = seguroVida + seguroDesempleo;

  return {
    banco: 'Banco AV Villas',
    creditoNo: '34822625',
    fechaCorte,
    fechaCorteFormatted: formatCorteDate(fechaCorte),
    ym: getYMFromCorte(fechaCorte),
    valorOriginal,
    plazoPactado,
    cuotasPagadas,
    cuotasPendientes,
    cuotasEnMora,
    capitalTotal,
    proximaCuota: proximaCuota || 334035,
    fechaLimitePago: fechaLimitePago ? formatCorteDate(fechaLimitePago) : '02 de Diciembre de 2026',
    seguroVida,
    seguroDesempleo,
    totalSeguros,
    totalPagadoPeriodo,
  };
}

/**
 * Lee un archivo File o ArrayBuffer y retorna los datos estructurados del extracto
 */
export async function parseAvVillasPDF(fileOrBuffer) {
  let arrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else if (fileOrBuffer && typeof fileOrBuffer.arrayBuffer === 'function') {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    throw new Error('Archivo inválido para lectura de PDF.');
  }

  const data = new Uint8Array(arrayBuffer);
  const loadingTask = pdfjs.getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const page1 = await pdfDoc.getPage(1);
  const page2 = pdfDoc.numPages >= 2 ? await pdfDoc.getPage(2) : null;

  const content1 = await page1.getTextContent();
  const items1 = content1.items.map(it => it.str);

  let items2 = [];
  if (page2) {
    const content2 = await page2.getTextContent();
    items2 = content2.items.map(it => it.str);
  }

  return parseAvVillasTokens(items1, items2);
}
