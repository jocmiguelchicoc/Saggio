export const QUINCENAS = {
  Q1: '1',
  Q2: '2',
};

export const QUINCENA_LABELS = {
  '1': 'Quincena del 15',
  '2': 'Quincena del 30',
};

export const FIXED_CATEGORIES = [
  'Vivienda',
  'Servicios',
  'Alimentación',
  'Transporte',
  'Salud',
  'Educación',
  'Suscripciones',
  'Familia',
  'Otros',
];

export const UNEXPECTED_CATEGORIES = [
  'Salud',
  'Transporte',
  'Hogar',
  'Comida',
  'Ropa',
  'Familia',
  'Diversión',
  'Otros',
];

export const EXTRA_INCOME_CATEGORIES = [
  'Trabajo extra',
  'Venta',
  'Regalo',
  'Otro',
];

export const CARD_PAYMENT_TYPES = {
  CUOTA: 'cuota',
  ABONO: 'abono',
  CARGO: 'cargo', // Nuevo préstamo o consumo que suma a la deuda
};

// Plantillas iniciales basadas en los datos reales del usuario
export const INITIAL_SUGGESTED_CARDS = [
  { name: 'American Express (*2900)', initial: 3387774, monthly: 300000, q: '1' },
  { name: 'Visa (*8579)', initial: 0, monthly: 0, q: '2' },
  { name: 'Mastercard Virtual (*2191)', initial: 1460969, monthly: 200000, q: '2' },
];

export const INITIAL_SUGGESTED_FIXED = [
  // Quincena 15
  { name: 'Comida/Mercado', amount: 0, q: '1', cat: 'Alimentación' },
  { name: 'Luz', amount: 0, q: '1', cat: 'Servicios' },
  { name: 'Gas', amount: 0, q: '1', cat: 'Servicios' },
  { name: 'Agua', amount: 0, q: '1', cat: 'Servicios' },
  { name: 'Gasolina moto', amount: 0, q: '1', cat: 'Transporte' },
  { name: 'Lavar moto', amount: 0, q: '1', cat: 'Transporte' },
  { name: 'Datos celular', amount: 0, q: '1', cat: 'Servicios' },
  { name: 'Netflix', amount: 0, q: '1', cat: 'Suscripciones' },
  { name: 'Gastos personales', amount: 0, q: '1', cat: 'Otros' },
  { name: 'Salidas/Diversión', amount: 0, q: '1', cat: 'Otros' },

  // Quincena 30 (con los valores exactos definidos por el usuario)
  { name: 'Arriendo', amount: 1200000, q: '2', cat: 'Vivienda' },
  { name: 'Cuota Banco AV Villas', amount: 340000, q: '2', cat: 'Otros' },
  { name: 'Parqueadero moto', amount: 41000, q: '2', cat: 'Transporte' },
  { name: 'Abono a Capital AV Villas', amount: 0, q: '2', cat: 'Otros' },
  { name: 'Comida/Mercado (Q2)', amount: 0, q: '2', cat: 'Alimentación' },
  { name: 'Internet', amount: 0, q: '2', cat: 'Servicios' },
  { name: 'Gasolina moto (Q2)', amount: 0, q: '2', cat: 'Transporte' },
  { name: 'Gastos personales (Q2)', amount: 0, q: '2', cat: 'Otros' },
  { name: 'Salidas/Diversión (Q2)', amount: 0, q: '2', cat: 'Otros' },
];
