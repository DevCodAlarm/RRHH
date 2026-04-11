import { useMemo } from 'react'
import {
  calculateLoanWithInterest,
  createPaymentPlan,
  getPendingDeductionsForEmployee,
  getLoanStatus,
  getAllPaymentPlans,
} from '@/lib/loan-management'

export function useLoanCalculations(employeeId: string) {
  return useMemo(() => ({
    calculateLoanWithInterest,
    createPaymentPlan,
    getPendingDeductions: () => getPendingDeductionsForEmployee(employeeId, 1), // Quincena 1
    getPendingDeductionsForPayroll: (payrollPeriod: 1 | 2) =>
      getPendingDeductionsForEmployee(employeeId, payrollPeriod),
    getLoanStatus,
    getAllPaymentPlans,
  }), [employeeId])
}

// Export para uso general
export { calculateLoanWithInterest, createPaymentPlan, getPendingDeductionsForEmployee, getLoanStatus, getAllPaymentPlans }
