// Sistema de gestión avanzada de préstamos con intereses y descuentos
export interface LoanInstallment {
  payrollPeriod: number // Quincena 1 o 2
  month: number // Mes (1-12)
  amount: number
  paid: boolean
  paidDate?: string
}

export interface LoanDiscount {
  employeeId: string
  loanId: string
  discountPerPaycheck: number
  installmentNumber: number
  totalInstallments: number
  currentInstallment: number
  installments: LoanInstallment[]
}

const DISCOUNT_STORAGE_KEY = 'rrhh_loan_discounts_v2'
const INTEREST_STORAGE_KEY = 'rrhh_loan_interests_v2'

/**
 * Calcula el monto final de un préstamo con interés
 * @param principal Monto solicitado
 * @param interestRate Tasa de interés anual en porcentaje
 * @param months Cantidad de meses para pagar
 * @returns Monto total con interés
 */
export function calculateLoanWithInterest(
  principal: number,
  interestRate: number,
  months: number
): {
  principal: number
  interest: number
  total: number
  monthlyPayment: number
  interestAmount: number
} {
  // Convertir tasa anual a mensual
  const monthlyRate = interestRate / 100 / 12

  // Si la tasa es 0, calcular simple
  if (monthlyRate === 0) {
    return {
      principal,
      interest: 0,
      total: principal,
      monthlyPayment: principal / months,
      interestAmount: 0,
    }
  }

  // Fórmula de interés compuesto
  const totalWithInterest = principal * Math.pow(1 + monthlyRate, months)
  const totalInterest = totalWithInterest - principal
  const monthlyPayment = totalWithInterest / months

  return {
    principal,
    interest: interestRate,
    total: Math.round(totalWithInterest * 100) / 100,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    interestAmount: Math.round(totalInterest * 100) / 100,
  }
}

/**
 * Convierte un préstamo con duración en meses a descuentos quincenales
 * @param loanId ID del préstamo
 * @param employeeId ID del empleado
 * @param amount Monto del préstamo
 * @param installments Número de cuotas (en quincenas)
 * @returns Plan de descuentos
 */
export function createPaymentPlan(
  loanId: string,
  employeeId: string,
  amount: number,
  installments: number // Cuotas quincenales (2 = 1 mes, 4 = 2 meses)
): LoanDiscount {
  const amountPerInstallment = Math.round((amount / installments) * 100) / 100

  const paymentPlan: LoanDiscount = {
    employeeId,
    loanId,
    discountPerPaycheck: amountPerInstallment,
    installmentNumber: 1,
    totalInstallments: installments,
    currentInstallment: 1,
    installments: Array.from({ length: installments }, (_, i) => {
      const payrollPeriod = (i % 2) + 1 // Alterna entre 1 y 2
      const month = Math.floor(i / 2) + 1

      return {
        payrollPeriod,
        month,
        amount: amountPerInstallment,
        paid: false,
        paidDate: undefined,
      }
    }),
  }

  return paymentPlan
}

/**
 * Guarda un plan de descuentos en localStorage
 */
export function savePaymentPlan(plan: LoanDiscount): void {
  const existing = getAllPaymentPlans()
  const index = existing.findIndex(
    p => p.loanId === plan.loanId && p.employeeId === plan.employeeId
  )

  if (index >= 0) {
    existing[index] = plan
  } else {
    existing.push(plan)
  }

  localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(existing))
  window.dispatchEvent(new CustomEvent('loan-plan-updated', { detail: plan }))
}

/**
 * Obtiene todos los planes de pago
 */
export function getAllPaymentPlans(): LoanDiscount[] {
  const stored = localStorage.getItem(DISCOUNT_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

/**
 * Obtiene los descuentos pendientes para un empleado en un período
 */
export function getPendingDeductionsForEmployee(
  employeeId: string,
  payrollPeriod: number // 1 o 2
): { amount: number; plans: LoanDiscount[] } {
  const plans = getAllPaymentPlans().filter(
    p => p.employeeId === employeeId && p.currentInstallment <= p.totalInstallments
  )

  let totalAmount = 0
  const activePlans: LoanDiscount[] = []

  plans.forEach(plan => {
    const currentInstall = plan.installments[plan.currentInstallment - 1]
    if (currentInstall && currentInstall.payrollPeriod === payrollPeriod && !currentInstall.paid) {
      totalAmount += currentInstall.amount
      activePlans.push(plan)
    }
  })

  return { amount: totalAmount, plans: activePlans }
}

/**
 * Marca una cuota como pagada
 */
export function markInstallmentAsPaid(loanId: string, employeeId: string): void {
  const plan = getAllPaymentPlans().find(
    p => p.loanId === loanId && p.employeeId === employeeId
  )

  if (!plan) return

  const currentInstall = plan.installments[plan.currentInstallment - 1]
  if (currentInstall) {
    currentInstall.paid = true
    currentInstall.paidDate = new Date().toISOString()
    plan.currentInstallment += 1
  }

  savePaymentPlan(plan)
}

/**
 * Obtiene el estado de un préstamo (porcentaje pagado)
 */
export function getLoanStatus(loanId: string, employeeId: string): {
  paid: number
  total: number
  remaining: number
  percentage: number
  isPaidOff: boolean
} {
  const plan = getAllPaymentPlans().find(
    p => p.loanId === loanId && p.employeeId === employeeId
  )

  if (!plan) {
    return { paid: 0, total: 0, remaining: 0, percentage: 0, isPaidOff: false }
  }

  const paidInstallments = plan.installments.filter(i => i.paid).length
  const total = plan.totalInstallments
  const paid = paidInstallments
  const remaining = total - paid
  const percentage = total > 0 ? (paid / total) * 100 : 0

  return {
    paid,
    total,
    remaining,
    percentage: Math.round(percentage),
    isPaidOff: remaining === 0,
  }
}

/**
 * Guarda una tasa de interés para un préstamo (uso admin)
 */
export function saveInterestRate(loanId: string, rate: number): void {
  const interests = JSON.parse(localStorage.getItem(INTEREST_STORAGE_KEY) || '{}')
  interests[loanId] = rate
  localStorage.setItem(INTEREST_STORAGE_KEY, JSON.stringify(interests))
  window.dispatchEvent(new CustomEvent('interest-rate-updated', { detail: { loanId, rate } }))
}

/**
 * Obtiene la tasa de interés configurada para un préstamo
 */
export function getInterestRate(loanId: string): number {
  const interests = JSON.parse(localStorage.getItem(INTEREST_STORAGE_KEY) || '{}')
  return interests[loanId] || 0
}

/**
 * Elimina un plan de pago (para préstamos rechazados/cancelados)
 */
export function deletePaymentPlan(loanId: string, employeeId: string): void {
  const plans = getAllPaymentPlans().filter(
    p => !(p.loanId === loanId && p.employeeId === employeeId)
  )
  localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(plans))
  window.dispatchEvent(new CustomEvent('loan-plan-deleted', { detail: { loanId, employeeId } }))
}
