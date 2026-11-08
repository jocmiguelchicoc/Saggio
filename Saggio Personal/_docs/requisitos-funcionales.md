# Documento de Requisitos Funcionales (RF)

## Saggio · Cuentas al día — Sistema de Finanzas Personales por Quincenas

| Campo | Valor |
| :--- | :--- |
| **Proyecto** | Saggio · Cuentas al día |
| **Versión** | 1.0 |
| **Fecha** | Noviembre 2026 |
| **Autor** | Jose Miguel Chico Camacho |
| **Clasificación** | Personal / Profesional / Portafolio ADSO |

---

## Historial de Revisiones

| Versión | Fecha | Autor | Cambios Realizados |
| :---: | :---: | :---: | :--- |
| **1.0** | 2026-11-07 | Jose Miguel Chico Camacho | Redacción formal de especificación basada en la arquitectura implementada y reglas de negocio validadas. |

---

## 1. Introducción

### 1.1 Propósito
Este documento especifica formalmente los requisitos funcionales del sistema **Saggio**, una aplicación web progresiva (PWA) de finanzas personales diseñada para administrar el flujo de caja del usuario según el ritmo real de cobro quincenal (15 y 30), garantizar el cumplimiento de obligaciones fijas sin olvidos, controlar el endeudamiento en tarjetas de crédito y diagnosticar en qué se gasta el dinero a través de desgloses mensuales y anuales.

### 1.2 Alcance
El sistema abarca:
- **Cálculo de flujo de caja quincenal:** Adaptado al desfase real de pagos (quincena del 15 cubre obligaciones del 16 a fin de mes; quincena del 30 cubre obligaciones del 1 al 14).
- **Control de compromisos fijos y servicios variables:** Agrupación dinámica reactiva con registro instantáneo de pagos en cero ($0).
- **Gestión de tarjetas de crédito:** Control diferenciado entre cuota mensual del extracto y deuda total pendiente, con soporte para abonos a capital y nuevos consumos.
- **Desglose y analítica anual:** Desglose interactivo tipo acordeón por categorías y conceptos específicos con frecuencias y porcentajes de gasto.
- **Persistencia local (Offline-First):** Almacenamiento seguro en IndexedDB mediante Dexie, sin intermediarios externos ni conexión obligatoria a internet.
- **Experiencia de usuario móvil (Mobile-First):** Manejo de teclado virtual (`visualViewport`), áreas táctiles mínimas de 44px y confirmación de borrado por doble toque.

### 1.3 Definiciones y Acrónimos

| Término | Definición |
| :--- | :--- |
| **Quincena 15 (Q15)** | Ciclo de ingresos del día 15 que cubre obligaciones cuyo vencimiento ocurre entre el 16 y el final del mes. |
| **Quincena 30 (Q30)** | Ciclo de ingresos de fin de mes que cubre obligaciones cuyo vencimiento ocurre entre el 1 y el 14 del mes siguiente. |
| **Gasto Fijo Variable ($0)** | Servicio o factura recurrente (ej. Luz, Gas) cuyo monto no es estático y se define al momento de pagar el recibo. |
| **Abono a Capital** | Pago extraordinario a una tarjeta de crédito que disminuye directamente el saldo total de la deuda sin sustituir la cuota mínima del mes. |
| **Double-Tap** | Mecanismo de seguridad táctil que exige pulsar dos veces consecutivas un botón para confirmar una acción destructiva (ej. eliminar). |
| **Offline-First** | Filosofía arquitectónica donde la aplicación funciona al 100% en el dispositivo del usuario sin requerir conectividad a un servidor. |

### 1.4 Prioridades de Requisitos

| Nivel | Descripción |
| :---: | :--- |
| **P0** | **Crítico / MVP:** El sistema no cumple su función principal sin este requisito. |
| **P1** | **Importante:** Aporta valor sustancial a la experiencia de usuario y claridad operativa. |
| **P2** | **Deseable:** Mejora la usabilidad, trazabilidad y protección de datos. |
| **P3** | **Futuro / Roadmap:** Funcionalidad de expansión hacia sincronización en la nube o integraciones externas. |

---

## 2. Especificación de Requisitos Funcionales

### Módulo A: Configuración y Flujo de Ingresos
* **RF-A01 [P0] Configuración de Sueldo Quincenal:** El sistema debe permitir registrar el ingreso base para la Quincena del 15 y la Quincena del 30.
* **RF-A02 [P1] Ingresos Especiales por Período Limitado:** El sistema debe soportar aportes temporales con fecha de vigencia (ej. Apoyo SENA activo entre 2026-11 y 2027-04) y aportes externos (ej. contribución de familiares).
* **RF-A03 [P0] Historial Inmutable de Salarios:** La modificación de las condiciones salariales para períodos futuros no debe modificar ni recalcular retroactivamente los balances de meses pasados ya cerrados.

### Módulo B: Lógica de Quincenas y Reglas de Negocio
* **RF-B01 [P0] Desfase Real de Vencimientos:**
  - Los compromisos marcados con periodicidad `Q15` deben deducirse de la capacidad de pago del día 15 (cubriendo vencimientos del 16 al 30/31).
  - Los compromisos marcados con periodicidad `Q30` deben deducirse de la capacidad de pago del día 30 (cubriendo vencimientos del 1 al 14 del mes siguiente).
* **RF-B02 [P0] Balance Neto en Tiempo Real:** El sistema debe computar y mostrar en todo momento el total disponible, total gastado y saldo remanente por cada quincena y para el mes consolidado.

### Módulo C: Obligaciones Fijas y Servicios
* **RF-C01 [P0] Registro de Obligaciones:** Permitir la creación de obligaciones con nombre, categoría, monto base y periodicidad (`Q15`, `Q30` o ambas).
* **RF-C02 [P1] Reordenamiento Reactivo de Fijos:**
  - Al marcar una obligación como pagada, debe trasladarse automáticamente a la sección superior `✓ Lo que vas pagando`.
  - Las obligaciones con monto en cero ($0) deben ubicarse en una sección intermedia `○ En ceros / Por definir ($0)`.
  - Las obligaciones no pagadas deben permanecer en la sección inferior `⏳ Por pagar`.
* **RF-C03 [P0] Pago Rápido de Servicios Variables ($0 Fast Pay):** Al tocar `$0 · Pagar`, debe desplegarse un modal rápido para ingresar el monto del recibo del mes corriente y la fecha de pago sin alterar la plantilla base recurrente (salvo que el usuario elija fijarlo como habitual).
* **RF-C04 [P1] Protección contra Eliminación Accidental:** El borrado de una obligación debe requerir un doble toque (*Double-Tap*) sobre el icono de papelera.

### Módulo D: Tarjetas de Crédito
* **RF-D01 [P0] Ficha Visual de Tarjetas:** Presentar cada tarjeta de crédito con entidad bancaria, últimos 4 dígitos, fecha de corte, cupo total, deuda actual y cuota mínima mensual.
* **RF-D02 [P0] Pago de Cuota del Mes:** Registrar el pago de la cuota mensual de extracto, marcando el estado de la cuota como pagada y descontando el monto del saldo adeudado.
* **RF-D03 [P0] Abonos Extraordinarios a Capital:** Permitir registrar abonos directos que descuenten la deuda total sin marcar la cuota mensual como pagada.
* **RF-D04 [P1] Nuevos Cargos o Préstamos:** Permitir registrar un nuevo cargo o consumo a la tarjeta, sumando el valor al saldo de la deuda de manera reactiva.

### Módulo E: Diagnóstico y Analítica Anual
* **RF-E01 [P1] Consolidado Anual Acumulado:** El sistema debe consolidar mes a mes los ingresos totales, gastos fijos, gastos de tarjetas y movimientos extras de todo el año seleccionado.
* **RF-E02 [P0] Desglose Interactivo por Categorías y Sub-Ítems:** Al tocar cualquier categoría en la vista anual (*¿En qué lo gastaste?*), se debe expandir un acordeón mostrando el detalle de cada concepto pagado (ej. Gas, Luz, Comida), indicando monto total anual, porcentaje sobre la categoría y número de pagos realizados.

### Módulo F: Persistencia, Seguridad y Respaldo
* **RF-F01 [P0] Persistencia Local con IndexedDB:** Todas las tablas y operaciones deben persistirse localmente en el navegador o dispositivo mediante Dexie.js.
* **RF-F02 [P1] Exportación de Respaldo JSON:** Permitir la descarga de una copia de seguridad íntegra de la base de datos con nombre de archivo fechado (`saggio-backup-AAAA-MM-DD.json`).
* **RF-F03 [P1] Importación y Validación de Copias:** Permitir restaurar una copia previa, validando la estructura del archivo antes de sobreescribir la base de datos para evitar corrupciones.

---

## 3. Matriz de Trazabilidad de Requisitos vs. Pruebas Unitarias

| Requisito | Componente / Función | Prueba Unitaria en `calculations.test.js` | Estado |
| :--- | :--- | :--- | :---: |
| **RF-D02 / RF-D03** | `calculateMonthOverview` | *Criterio 1: Tarjeta con deuda inicial, cuota y abono* | ✅ Pasando |
| **RF-D03** | `calculateMonthOverview` | *Criterio 2: Un abono reduce el saldo pero NO marca cuota* | ✅ Pasando |
| **RF-D04** | `cardsRepository.addCharge` | *Nuevo requerimiento: Prestar / Cargo nuevo suma a la deuda* | ✅ Pasando |
| **RF-C01** | `calculateMonthOverview` | *Criterio 3: Al cambiar de mes, fijos vuelven a aparecer pendientes* | ✅ Pasando |
| **RF-A02** | `calculateMonthOverview` | *Requerimiento usuario: Apoyo SENA activo de 2026-11 a 2027-04* | ✅ Pasando |
| **RF-A03** | `calculateMonthOverview` | *Historial de sueldo: cambio en 2027 preserva 2026 intacto* | ✅ Pasando |
| **RF-E01** | `calculateAnnualSummary` | *Criterio 5: El resumen anual acumula mes a mes y agrupa* | ✅ Pasando |
| **RF-B01** | `calculateMonthOverview` | *Flujo de quincenas real: días 15-29 (Q15) y días 30-14 (Q30)* | ✅ Pasando |
| **RF-B02** | `calculateMonthOverview` | *Desglose de gastos descuenta según el ciclo de quincenas* | ✅ Pasando |
| **RF-C03** | `calculateMonthOverview` | *Pago de gasto fijo en cero computa correctamente* | ✅ Pasando |
| **RF-E02** | `calculateAnnualSummary` | *Desglose anual por conceptos (subItems) dentro de categorías* | ✅ Pasando |

