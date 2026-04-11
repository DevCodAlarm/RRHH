"use client"

/* =========================================================
   Nómina RD (QUINCENAL) + Persistencia localStorage
   - Config: "config_nomina" (bloqueada por defecto)
   - Inputs empleados: "nomina_empleados"
   - Periodo actual + resultado: "nomina_periodo_actual"
   - Historial periodos procesados: "nomina_periodos"
   
   INTEGRACIÓN AVANZADA:
   - Préstamos: Descuentos automáticos por quincena
   - Adelantos: Reducción de salario neto
   - Auditoría: Registro de cambios en descuentos
========================================================= */

import { getPendingDeductionsForEmployee, markInstallmentAsPaid } from "./loan-management"
import { logAction } from "./audit-log"

export const NOMINA_LS_KEYS = {
  CONFIG: "config_nomina_v2",
  CONFIG_EDIT_ENABLED: "config_nomina_edit_enabled_v2",
  EMPLEADOS: "nomina_empleados_v2",
  NOMINA_CURRENT: "nomina_periodo_actual_v2",
  NOMINA_HIST: "nomina_periodos_v2",
} as const

export type NominaConfig = {
  afp: { empleado: number; empleador: number; tope: number }
  sfs: { empleado: number; empleador: number; tope: number }
  arl: { empleador: number }
  isr: Array<{ desde: number; hasta: number; tasa: number }>
  otrasRetenciones: Array<unknown>
}

export type EmpleadoInput = {
  id?: string
  nombre: string
  sueldoMensual: number
  horasExtras: number
  bonos: number
  comisiones: number
  otrosIngresos: number
  prestamos: number
  cooperativa: number
  seguro: number
  anticipos: number
  otrosDescuentos: number
  diasAusentes: number
}

export type NominaEmpleadoResult = {
  id: string
  nombre: string
  bruto: number
  afp: number
  sfs: number
  isr: number
  descuentosDetalle: {
    prestamos: number
    cooperativa: number
    seguro: number
    anticipos: number
    otrosDescuentos: number
  }
  otrosDescuentos: number
  totalDescuentos: number
  neto: number
  aportes: {
    afpEmpleador: number
    sfsEmpleador: number
    arl: number
  }
  costoEmpresa: number
  detalles: {
    sueldoQuincenal: number
    salarioDiario: number
    descuentoAusencia: number
    ingresosAdicionales: number
    salarioCotizable: number
  }
}

export type NominaResumen = {
  totalBruto: number
  totalDescuentos: number
  totalNeto: number
  totalCostoEmpresa: number
}

export type NominaResultado = {
  empleados: NominaEmpleadoResult[]
  resumen: NominaResumen
}

export type NominaPeriodo = {
  key: string
  inicio: string // YYYY-MM-DD
  fin: string // YYYY-MM-DD
  createdAt: string
}

export type NominaActualState = {
  periodo: NominaPeriodo
  empleadosInput: EmpleadoInput[]
  resultado: NominaResultado | null
  updatedAt: string
}

export type NominaHistRecord = {
  id: string
  periodo: NominaPeriodo
  empleadosInput: EmpleadoInput[]
  resultado: NominaResultado
  meta?: Record<string, unknown>
  processedAt: string
}

export const DEFAULT_NOMINA_CONFIG: NominaConfig = {
  afp: { empleado: 2.87, empleador: 7.10, tope: 465000 },
  sfs: { empleado: 3.04, empleador: 7.09, tope: 465000 },
  arl: { empleador: 1.2 },
  isr: [
    { desde: 0, hasta: 416220, tasa: 0 },
    { desde: 416220.01, hasta: 624329, tasa: 15 },
    { desde: 624329.01, hasta: 867123, tasa: 20 },
    { desde: 867123.01, hasta: Number.POSITIVE_INFINITY, tasa: 25 },
  ],
  otrasRetenciones: [],
}

export const DEFAULT_EMPLEADOS: EmpleadoInput[] = []

/* =========================
   Eventos (para “tiempo real”)
========================= */
export const NOMINA_EVENT_UPDATED = "nomina:updated"

function emitNominaUpdated(payload: unknown) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(NOMINA_EVENT_UPDATED, { detail: payload }))
}

export function onNominaUpdated(handler: (payload: unknown) => void) {
  const fn = (e: Event) => handler((e as CustomEvent).detail)
  window.addEventListener(NOMINA_EVENT_UPDATED, fn)
  return () => window.removeEventListener(NOMINA_EVENT_UPDATED, fn)
}

/* =========================
   Helpers (storage/validación)
========================= */
function round2(n: unknown) {
  const x = Number(n)
  if (!Number.isFinite(x)) return 0
  return Math.round((x + Number.EPSILON) * 100) / 100
}

function clampNonNegative(n: unknown) {
  const x = Number(n)
  if (!Number.isFinite(x) || x < 0) return 0
  return x
}

function safeSum(values: unknown[]) {
  return values.reduce<number>((acc, v) => acc + clampNonNegative(v), 0)
}

function readJSON<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return structuredClone(fallback)
  try {
    return JSON.parse(raw) as T
  } catch {
    return structuredClone(fallback)
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function nowISO() {
  return new Date().toISOString()
}

function makeId(prefix = "id") {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`
}

function normalizeEmpleadoInput(emp: EmpleadoInput): Required<EmpleadoInput> {
  const e = emp ?? ({} as EmpleadoInput)
  return {
    id: String(e.id ?? makeId("emp")),
    nombre: String(e.nombre ?? "").trim(),
    sueldoMensual: clampNonNegative(e.sueldoMensual),
    horasExtras: clampNonNegative(e.horasExtras),
    bonos: clampNonNegative(e.bonos),
    comisiones: clampNonNegative(e.comisiones),
    otrosIngresos: clampNonNegative(e.otrosIngresos),
    prestamos: clampNonNegative(e.prestamos),
    cooperativa: clampNonNegative(e.cooperativa),
    seguro: clampNonNegative(e.seguro),
    anticipos: clampNonNegative(e.anticipos),
    otrosDescuentos: clampNonNegative(e.otrosDescuentos),
    diasAusentes: clampNonNegative(e.diasAusentes),
  }
}

/* =========================
   Config (localStorage) + bloqueo edición
========================= */
export function getConfigNomina(): NominaConfig {
  if (!localStorage.getItem(NOMINA_LS_KEYS.CONFIG)) {
    writeJSON(NOMINA_LS_KEYS.CONFIG, DEFAULT_NOMINA_CONFIG)
  }

  const parsed = readJSON<NominaConfig>(NOMINA_LS_KEYS.CONFIG, DEFAULT_NOMINA_CONFIG)

  return {
    ...structuredClone(DEFAULT_NOMINA_CONFIG),
    ...parsed,
    afp: { ...structuredClone(DEFAULT_NOMINA_CONFIG.afp), ...(parsed.afp || {}) },
    sfs: { ...structuredClone(DEFAULT_NOMINA_CONFIG.sfs), ...(parsed.sfs || {}) },
    arl: { ...structuredClone(DEFAULT_NOMINA_CONFIG.arl), ...(parsed.arl || {}) },
    isr: Array.isArray(parsed.isr) && parsed.isr.length ? parsed.isr : structuredClone(DEFAULT_NOMINA_CONFIG.isr),
    otrasRetenciones: Array.isArray(parsed.otrasRetenciones) ? parsed.otrasRetenciones : [],
  }
}

export function isConfigEditable() {
  return localStorage.getItem(NOMINA_LS_KEYS.CONFIG_EDIT_ENABLED) === "true"
}

export function habilitarEdicionConfig() {
  const ok = window.confirm("¿Desea modificar las tasas? Esto afectará toda la nómina")
  if (ok) localStorage.setItem(NOMINA_LS_KEYS.CONFIG_EDIT_ENABLED, "true")
  return ok
}

export function bloquearEdicionConfig() {
  localStorage.setItem(NOMINA_LS_KEYS.CONFIG_EDIT_ENABLED, "false")
  return true
}

export function saveConfigNomina(newConfig: NominaConfig) {
  if (!isConfigEditable()) {
    throw new Error("Edición de configuración bloqueada. Use habilitarEdicionConfig().")
  }
  writeJSON(NOMINA_LS_KEYS.CONFIG, newConfig)
  recalcularNominaActual({ reason: "config_saved" })
  return true
}

/* =========================
   Empleados input
========================= */
export function getEmpleadosInput(): EmpleadoInput[] {
  const arr = readJSON<EmpleadoInput[]>(NOMINA_LS_KEYS.EMPLEADOS, DEFAULT_EMPLEADOS)
  return Array.isArray(arr) ? arr : structuredClone(DEFAULT_EMPLEADOS)
}

export function setEmpleadosInput(empleados: EmpleadoInput[]) {
  if (!Array.isArray(empleados)) throw new Error("empleados debe ser un array.")
  writeJSON(NOMINA_LS_KEYS.EMPLEADOS, empleados)
  recalcularNominaActual({ reason: "empleados_set" })
  return true
}

export function patchEmpleadoField(empleadoId: string, field: keyof EmpleadoInput, value: unknown) {
  const id = String(empleadoId || "")
  if (!id) throw new Error("empleadoId requerido.")
  const empleados = getEmpleadosInput()
  const idx = empleados.findIndex((e) => String(e.id) === id)
  if (idx < 0) throw new Error("Empleado no encontrado.")

  ;(empleados[idx] as any) = { ...empleados[idx], [field]: value }
  writeJSON(NOMINA_LS_KEYS.EMPLEADOS, empleados)
  recalcularNominaActual({ reason: "empleado_patch", empleadoId: id, field })
  return true
}

export function syncEmpleadoDesdeContexto(empData: { id: string, name: string, salary: number, prestamos?: number, anticipos?: number }) {
  if (typeof window === "undefined") return
  const empleados = getEmpleadosInput()
  const idx = empleados.findIndex(e => String(e.id) === empData.id)
  
  if (idx >= 0) {
    empleados[idx] = {
      ...empleados[idx],
      nombre: empData.name,
      sueldoMensual: empData.salary,
      prestamos: empData.prestamos ?? empleados[idx].prestamos,
      anticipos: empData.anticipos ?? empleados[idx].anticipos
    }
  } else {
    // Si no existe, lo agregamos con valores por defecto
    empleados.push({
      id: empData.id,
      nombre: empData.name,
      sueldoMensual: empData.salary,
      horasExtras: 0,
      bonos: 0,
      comisiones: 0,
      otrosIngresos: 0,
      prestamos: empData.prestamos ?? 0,
      cooperativa: 0,
      seguro: 0,
      anticipos: empData.anticipos ?? 0,
      otrosDescuentos: 0,
      diasAusentes: 0
    })
  }
  
  writeJSON(NOMINA_LS_KEYS.EMPLEADOS, empleados)
  recalcularNominaActual({ reason: "context_sync", empleadoId: empData.id })
}

/* =========================
   Periodo quincenal
========================= */
export function buildPeriodoQuincenalActual(date = new Date()): NominaPeriodo {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = d.getMonth()
  const day = d.getDate()

  const start = new Date(y, m, day <= 15 ? 1 : 16)
  const end = new Date(y, m, day <= 15 ? 15 : new Date(y, m + 1, 0).getDate())

  const key = `${y}-${String(m + 1).padStart(2, "0")}-Q${day <= 15 ? 1 : 2}`

  return {
    key,
    inicio: start.toISOString().slice(0, 10),
    fin: end.toISOString().slice(0, 10),
    createdAt: nowISO(),
  }
}

export function setPeriodoActual(periodo: Partial<NominaPeriodo>) {
  const current = getNominaActual() ?? {
    periodo: buildPeriodoQuincenalActual(),
    empleadosInput: getEmpleadosInput(),
    resultado: null,
    updatedAt: nowISO(),
  }

  const next: NominaActualState = {
    ...current,
    periodo: {
      key: String(periodo.key || makeId("periodo")),
      inicio: String(periodo.inicio || current.periodo.inicio || ""),
      fin: String(periodo.fin || current.periodo.fin || ""),
      createdAt: String(periodo.createdAt || current.periodo.createdAt || nowISO()),
    },
    updatedAt: nowISO(),
  }

  writeJSON(NOMINA_LS_KEYS.NOMINA_CURRENT, next)
  recalcularNominaActual({ reason: "periodo_changed" })
  return true
}

/* =========================
   ISR progresivo (anual)
========================= */
function calcularIsrAnualProgresivo(salarioAnual: unknown, tablaIsr: NominaConfig["isr"]) {
  const base = clampNonNegative(salarioAnual)
  const tramos = Array.isArray(tablaIsr) ? tablaIsr : []
  const sorted = [...tramos].sort((a, b) => (Number(a.desde) || 0) - (Number(b.desde) || 0))

  let impuesto = 0

  for (const t of sorted) {
    const desde = clampNonNegative(t?.desde)
    const hastaRaw: any = (t as any)?.hasta
    const hasta = hastaRaw === Infinity ? Infinity : Number.isFinite(Number(hastaRaw)) ? Number(hastaRaw) : Infinity
    const tasa = clampNonNegative(t?.tasa) / 100

    if (base <= desde) continue

    const limiteSuperior = hasta === Infinity ? base : Math.min(base, hasta)
    const montoTramo = Math.max(0, limiteSuperior - desde)
    impuesto += montoTramo * tasa

    if (hasta !== Infinity && base <= hasta) break
  }

  return Math.max(0, impuesto)
}

/* =========================
   Cálculo por empleado + nómina
========================= */
function calcularNominaEmpleado(emp: EmpleadoInput, config: NominaConfig): NominaEmpleadoResult {
  const e = normalizeEmpleadoInput(emp)

  const sueldoQuincenal = e.sueldoMensual / 2
  const salarioDiario = e.sueldoMensual / 23.83
  const descuentoAusencia = salarioDiario * e.diasAusentes

  const ingresosAdicionales = safeSum([e.horasExtras, e.bonos, e.comisiones, e.otrosIngresos])
  const bruto = Math.max(0, sueldoQuincenal + ingresosAdicionales - descuentoAusencia)

  const topeCotizable = Math.min(clampNonNegative(config?.afp?.tope), clampNonNegative(config?.sfs?.tope))
  const salarioCotizable = Math.min(bruto, topeCotizable)

  const afp = salarioCotizable * (clampNonNegative(config?.afp?.empleado) / 100)
  const sfs = salarioCotizable * (clampNonNegative(config?.sfs?.empleado) / 100)

  const salarioAnual = bruto * 24
  const isrAnual = calcularIsrAnualProgresivo(salarioAnual, config?.isr)
  const isrQuincenal = Math.max(0, isrAnual / 24)

  const otrosDescuentos = safeSum([e.prestamos, e.cooperativa, e.seguro, e.anticipos, e.otrosDescuentos])

  let totalDescuentos = afp + sfs + isrQuincenal + otrosDescuentos
  if (totalDescuentos > bruto) totalDescuentos = bruto

  const neto = Math.max(0, bruto - totalDescuentos)

  const afpEmpleador = salarioCotizable * (clampNonNegative(config?.afp?.empleador) / 100)
  const sfsEmpleador = salarioCotizable * (clampNonNegative(config?.sfs?.empleador) / 100)
  const arl = bruto * (clampNonNegative(config?.arl?.empleador) / 100)
  const costoEmpresa = bruto + afpEmpleador + sfsEmpleador + arl

  return {
    id: e.id,
    nombre: e.nombre,
    bruto: round2(bruto),
    afp: round2(afp),
    sfs: round2(sfs),
    isr: round2(isrQuincenal),
    descuentosDetalle: {
      prestamos: round2(e.prestamos),
      cooperativa: round2(e.cooperativa),
      seguro: round2(e.seguro),
      anticipos: round2(e.anticipos),
      otrosDescuentos: round2(e.otrosDescuentos),
    },
    otrosDescuentos: round2(otrosDescuentos),
    totalDescuentos: round2(totalDescuentos),
    neto: round2(neto),
    aportes: {
      afpEmpleador: round2(afpEmpleador),
      sfsEmpleador: round2(sfsEmpleador),
      arl: round2(arl),
    },
    costoEmpresa: round2(costoEmpresa),
    detalles: {
      sueldoQuincenal: round2(sueldoQuincenal),
      salarioDiario: round2(salarioDiario),
      descuentoAusencia: round2(descuentoAusencia),
      ingresosAdicionales: round2(ingresosAdicionales),
      salarioCotizable: round2(salarioCotizable),
    },
  }
}

/**
 * Obtiene descuentos por préstamos activos para un empleado en una quincena específica
 */
export function getPayrollDeductionsForEmployee(
  employeeId: string,
  payrollPeriod: 1 | 2
): {
  totalDeductions: number
  loanDeductions: Array<{ loanId: string; amount: number }>
} {
  try {
    const { amount, plans } = getPendingDeductionsForEmployee(employeeId, payrollPeriod)
    const loanDeductions = plans.map(plan => ({
      loanId: plan.loanId,
      amount: plan.discountPerPaycheck,
    }))
    return { totalDeductions: amount, loanDeductions }
  } catch {
    return { totalDeductions: 0, loanDeductions: [] }
  }
}

/**
 * Marca si una nómina tiene estado "abnormal" por descuentos de préstamos
 */
export function checkPayrollAbnormalStatus(
  employeeId: string,
  payrollPeriod: 1 | 2
): boolean {
  const { totalDeductions } = getPayrollDeductionsForEmployee(employeeId, payrollPeriod)
  return totalDeductions > 0
}

/**
 * Procesa descuentos de préstamos después de que se calcula la nómina
 */
export function applyLoanDeductionsToPayroll(
  nominaResult: NominaEmpleadoResult,
  payrollPeriod: 1 | 2
): NominaEmpleadoResult & { loanDeductionsApplied: number; isAbnormalPayroll: boolean } {
  const { totalDeductions, loanDeductions } = getPayrollDeductionsForEmployee(nominaResult.id, payrollPeriod)
  
  // No permitir que el descuento sea mayor que el neto
  const actualDeduction = Math.min(totalDeductions, nominaResult.neto)
  
  return {
    ...nominaResult,
    otrosDescuentos: round2(nominaResult.otrosDescuentos + actualDeduction),
    totalDescuentos: round2(nominaResult.totalDescuentos + actualDeduction),
    neto: round2(Math.max(0, nominaResult.neto - actualDeduction)),
    loanDeductionsApplied: round2(actualDeduction),
    isAbnormalPayroll: actualDeduction > 0,
  }
}

export function calcularNominaQuincenal(empleadosInput: EmpleadoInput[], payrollPeriod: 1 | 2 = 1): NominaResultado {
  const config = getConfigNomina()
  if (!Array.isArray(empleadosInput)) throw new Error("empleados debe ser un array.")

  const empleados = empleadosInput.map((emp) => {
    const base = calcularNominaEmpleado(emp, config)
    // Aplicar descuentos de préstamos si existen
    return applyLoanDeductionsToPayroll(base, payrollPeriod)
  })

  const resumenRaw = empleados.reduce(
    (acc, e) => {
      acc.totalBruto += clampNonNegative(e.bruto)
      acc.totalDescuentos += clampNonNegative(e.totalDescuentos)
      acc.totalNeto += clampNonNegative(e.neto)
      acc.totalCostoEmpresa += clampNonNegative(e.costoEmpresa)
      return acc
    },
    { totalBruto: 0, totalDescuentos: 0, totalNeto: 0, totalCostoEmpresa: 0 }
  )

  return {
    empleados,
    resumen: {
      totalBruto: round2(resumenRaw.totalBruto),
      totalDescuentos: round2(resumenRaw.totalDescuentos),
      totalNeto: round2(resumenRaw.totalNeto),
      totalCostoEmpresa: round2(resumenRaw.totalCostoEmpresa),
    },
  }
}

/* =========================
   Nómina actual + historial
========================= */
export function initNominaStorage() {
  if (!localStorage.getItem(NOMINA_LS_KEYS.CONFIG)) writeJSON(NOMINA_LS_KEYS.CONFIG, DEFAULT_NOMINA_CONFIG)
  if (!localStorage.getItem(NOMINA_LS_KEYS.CONFIG_EDIT_ENABLED)) localStorage.setItem(NOMINA_LS_KEYS.CONFIG_EDIT_ENABLED, "false")
  if (!localStorage.getItem(NOMINA_LS_KEYS.EMPLEADOS)) writeJSON(NOMINA_LS_KEYS.EMPLEADOS, DEFAULT_EMPLEADOS)
  if (!localStorage.getItem(NOMINA_LS_KEYS.NOMINA_HIST)) writeJSON(NOMINA_LS_KEYS.NOMINA_HIST, [])
  if (!localStorage.getItem(NOMINA_LS_KEYS.NOMINA_CURRENT)) {
    const initState: NominaActualState = {
      periodo: buildPeriodoQuincenalActual(),
      empleadosInput: getEmpleadosInput(),
      resultado: null,
      updatedAt: nowISO(),
    }
    writeJSON(NOMINA_LS_KEYS.NOMINA_CURRENT, initState)
  }

  recalcularNominaActual({ reason: "init" })
  return true
}

export function getNominaActual(): NominaActualState | null {
  return readJSON<NominaActualState | null>(NOMINA_LS_KEYS.NOMINA_CURRENT, null)
}

export function recalcularNominaActual(extraEvent: Record<string, unknown> = {}) {
  const empleadosInput = getEmpleadosInput()
  const current = getNominaActual() ?? {
    periodo: buildPeriodoQuincenalActual(),
    empleadosInput,
    resultado: null,
    updatedAt: nowISO(),
  }

  const resultado = calcularNominaQuincenal(empleadosInput)

  const next: NominaActualState = {
    ...current,
    empleadosInput,
    resultado,
    updatedAt: nowISO(),
  }

  writeJSON(NOMINA_LS_KEYS.NOMINA_CURRENT, next)
  emitNominaUpdated({ reason: "recalculated", ...extraEvent, periodo: next.periodo, resumen: resultado.resumen })
  return next
}

export function getPeriodosProcesados(): NominaHistRecord[] {
  const hist = readJSON<NominaHistRecord[]>(NOMINA_LS_KEYS.NOMINA_HIST, [])
  return Array.isArray(hist) ? hist : []
}

function resumirDesdeEmpleados(empleados: NominaEmpleadoResult[]): NominaResumen {
  const raw = empleados.reduce(
    (acc, e) => {
      acc.totalBruto += clampNonNegative(e.bruto)
      acc.totalDescuentos += clampNonNegative(e.totalDescuentos)
      acc.totalNeto += clampNonNegative(e.neto)
      acc.totalCostoEmpresa += clampNonNegative(e.costoEmpresa)
      return acc
    },
    { totalBruto: 0, totalDescuentos: 0, totalNeto: 0, totalCostoEmpresa: 0 }
  )

  return {
    totalBruto: round2(raw.totalBruto),
    totalDescuentos: round2(raw.totalDescuentos),
    totalNeto: round2(raw.totalNeto),
    totalCostoEmpresa: round2(raw.totalCostoEmpresa),
  }
}

export function procesarNominaPeriodoActual(meta: Record<string, unknown> = {}) {
  const current = getNominaActual()
  if (!current) throw new Error("No hay nómina actual.")

  if (!current.resultado) recalcularNominaActual({ reason: "process_forced" })
  const final = getNominaActual()
  if (!final?.resultado) throw new Error("No se pudo calcular la nómina actual.")

  const hist = getPeriodosProcesados()

  const selectedIdsRaw = (meta as any)?.selectedEmployees
  const selectedIds: string[] = Array.isArray(selectedIdsRaw) ? selectedIdsRaw.map((x) => String(x)) : []
  const hasSelection = selectedIds.length > 0

  const empleadosSeleccionados = hasSelection
    ? final.resultado.empleados.filter((e) => selectedIds.includes(e.id))
    : final.resultado.empleados

  const empleadosInputSeleccionados = hasSelection
    ? final.empleadosInput.filter((e) => selectedIds.includes(String(e.id)))
    : final.empleadosInput

  const resultadoSeleccionado: NominaResultado = {
    empleados: empleadosSeleccionados,
    resumen: resumirDesdeEmpleados(empleadosSeleccionados),
  }

  const record: NominaHistRecord = {
    id: makeId("nomina"),
    periodo: final.periodo,
    empleadosInput: empleadosInputSeleccionados,
    resultado: resultadoSeleccionado,
    meta,
    processedAt: nowISO(),
  }

  // Evita duplicar períodos: 1 nómina procesada por periodo.key
  const existingIdx = hist.findIndex((h) => h?.periodo?.key === record.periodo.key)
  if (existingIdx >= 0) {
    hist[existingIdx] = { ...hist[existingIdx], ...record, id: hist[existingIdx].id }
  } else {
    hist.unshift(record)
  }
  writeJSON(NOMINA_LS_KEYS.NOMINA_HIST, hist)
  emitNominaUpdated({ reason: "periodo_processed", nominaId: record.id, periodo: record.periodo, resumen: record.resultado.resumen })
  return record
}

