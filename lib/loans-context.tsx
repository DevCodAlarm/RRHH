"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface LoanDeduction {
  id: string
  payrollPeriod: string // "2024-01-15"
  amount: number
  appliedPayroll: boolean
}

export interface Loan {
  id: string
  userId: string
  amount: number
  requestedDate: string
  approvalDate?: string
  status: "pending" | "approved" | "rejected" | "paid"
  interestRate: number // Porcentaje (%)
  installments: number // Total de cuotas
  paymentFrequency: "quincenal" | "mensual" // Frecuencia de pago
  deductions: LoanDeduction[]
  remainingAmount: number
  paidAmount: number
}

export interface Advance {
  id: string
  userId: string
  amount: number
  requestedDate: string
  status: "pending" | "approved" | "rejected"
  appliedToPayroll?: string // Fecha del período donde se aplicó
}

export interface Request {
  id: string
  userId: string
  type: "leave" | "permission" | "loan" | "advance" | "salary_increase"
  status: "pending" | "approved" | "rejected"
  details: Record<string, any>
  createdAt: string
  documents?: string[]
}

interface LoansContextType {
  loans: Loan[]
  advances: Advance[]
  requests: Request[]
  createLoan: (loan: Omit<Loan, "id">) => Loan
  createAdvance: (advance: Omit<Advance, "id">) => Advance
  createRequest: (request: Omit<Request, "id">) => Request
  approveLoan: (loanId: string) => void
  rejectLoan: (loanId: string) => void
  approveAdvance: (advanceId: string) => void
  rejectAdvance: (advanceId: string) => void
  approveRequest: (requestId: string) => void
  rejectRequest: (requestId: string) => void
  applyDeduction: (loanId: string, payrollPeriod: string, amount: number) => void
  getLoansByUser: (userId: string) => Loan[]
  getAdvancesByUser: (userId: string) => Advance[]
  getRequestsByUser: (userId: string) => Request[]
  updateLoanDeduction: (loanId: string, deductionId: string, appliedPayroll: boolean) => void
}

const LoansContext = createContext<LoansContextType | undefined>(undefined)

export function LoansProvider({ children }: { children: ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>([])
  const [advances, setAdvances] = useState<Advance[]>([])
  const [requests, setRequests] = useState<Request[]>([])

  // Cargar datos del localStorage
  useEffect(() => {
    const storedLoans = localStorage.getItem("rrhh_loans")
    const storedAdvances = localStorage.getItem("rrhh_advances")
    const storedRequests = localStorage.getItem("rrhh_requests")

    if (storedLoans) setLoans(JSON.parse(storedLoans))
    if (storedAdvances) setAdvances(JSON.parse(storedAdvances))
    if (storedRequests) setRequests(JSON.parse(storedRequests))
  }, [])

  // Guardar en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem("rrhh_loans", JSON.stringify(loans))
  }, [loans])

  useEffect(() => {
    localStorage.setItem("rrhh_advances", JSON.stringify(advances))
  }, [advances])

  useEffect(() => {
    localStorage.setItem("rrhh_requests", JSON.stringify(requests))
  }, [requests])

  const createLoan = (loan: Omit<Loan, "id">) => {
    const newLoan: Loan = {
      ...loan,
      id: `loan_${Date.now()}`,
    }
    setLoans([...loans, newLoan])
    return newLoan
  }

  const createAdvance = (advance: Omit<Advance, "id">) => {
    const newAdvance: Advance = {
      ...advance,
      id: `adv_${Date.now()}`,
    }
    setAdvances([...advances, newAdvance])
    return newAdvance
  }

  const createRequest = (request: Omit<Request, "id">) => {
    const newRequest: Request = {
      ...request,
      id: `req_${Date.now()}`,
    }
    setRequests([...requests, newRequest])
    return newRequest
  }

  const approveLoan = (loanId: string) => {
    setLoans(loans.map(loan => 
      loan.id === loanId 
        ? { ...loan, status: "approved", approvalDate: new Date().toISOString() }
        : loan
    ))
  }

  const rejectLoan = (loanId: string) => {
    setLoans(loans.map(loan => 
      loan.id === loanId 
        ? { ...loan, status: "rejected" }
        : loan
    ))
  }

  const approveAdvance = (advanceId: string) => {
    setAdvances(advances.map(adv => 
      adv.id === advanceId 
        ? { ...adv, status: "approved" }
        : adv
    ))
  }

  const rejectAdvance = (advanceId: string) => {
    setAdvances(advances.map(adv => 
      adv.id === advanceId 
        ? { ...adv, status: "rejected" }
        : adv
    ))
  }

  const approveRequest = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId 
        ? { ...req, status: "approved" }
        : req
    ))
  }

  const rejectRequest = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId 
        ? { ...req, status: "rejected" }
        : req
    ))
  }

  const applyDeduction = (loanId: string, payrollPeriod: string, amount: number) => {
    setLoans(loans.map(loan => {
      if (loan.id === loanId) {
        const newDeductions = [
          ...loan.deductions,
          {
            id: `ded_${Date.now()}`,
            payrollPeriod,
            amount,
            appliedPayroll: false,
          },
        ]
        return {
          ...loan,
          deductions: newDeductions,
          remainingAmount: Math.max(0, loan.remainingAmount - amount),
          paidAmount: loan.paidAmount + amount,
        }
      }
      return loan
    }))
  }

  const getLoansByUser = (userId: string) => {
    return loans.filter(loan => loan.userId === userId)
  }

  const getAdvancesByUser = (userId: string) => {
    return advances.filter(adv => adv.userId === userId)
  }

  const getRequestsByUser = (userId: string) => {
    return requests.filter(req => req.userId === userId)
  }

  const updateLoanDeduction = (loanId: string, deductionId: string, appliedPayroll: boolean) => {
    setLoans(loans.map(loan => {
      if (loan.id === loanId) {
        return {
          ...loan,
          deductions: loan.deductions.map(ded =>
            ded.id === deductionId ? { ...ded, appliedPayroll } : ded
          ),
        }
      }
      return loan
    }))
  }

  return (
    <LoansContext.Provider
      value={{
        loans,
        advances,
        requests,
        createLoan,
        createAdvance,
        createRequest,
        approveLoan,
        rejectLoan,
        approveAdvance,
        rejectAdvance,
        approveRequest,
        rejectRequest,
        applyDeduction,
        getLoansByUser,
        getAdvancesByUser,
        getRequestsByUser,
        updateLoanDeduction,
      }}
    >
      {children}
    </LoansContext.Provider>
  )
}

export function useLoans() {
  const context = useContext(LoansContext)
  if (!context) {
    throw new Error("useLoans must be used within LoansProvider")
  }
  return context
}
