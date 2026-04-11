"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface PayrollPeriod {
  id: string
  startDate: string // "2024-01-01"
  endDate: string // "2024-01-15"
  processedDate?: string
  status: "pending" | "processing" | "processed" | "approved"
  approvedBy?: string // userId del admin que aprobó
  approvalDate?: string
}

export interface PayrollDeduction {
  type: "loan" | "advance" | "other"
  amount: number
  reason: string
  referenceId?: string // ID del préstamo o adelanto
}

export interface PayrollRecord {
  id: string
  userId: string
  periodId: string
  baseSalary: number
  deductions: PayrollDeduction[]
  netSalary: number
  status: "normal" | "with_deductions" | "pending_approval"
  processedDate?: string
  approvedDate?: string
  approvedBy?: string
}

interface PayrollContextType {
  periods: PayrollPeriod[]
  records: PayrollRecord[]
  createPeriod: (period: Omit<PayrollPeriod, "id">) => PayrollPeriod
  updatePeriod: (periodId: string, updates: Partial<PayrollPeriod>) => void
  approvePeriod: (periodId: string, approvedBy: string) => void
  createPayrollRecord: (record: Omit<PayrollRecord, "id">) => PayrollRecord
  updatePayrollRecord: (recordId: string, updates: Partial<PayrollRecord>) => void
  getRecordsByPeriod: (periodId: string) => PayrollRecord[]
  getRecordsByUser: (userId: string) => PayrollRecord[]
  getCurrentPeriod: () => PayrollPeriod | null
  getNextPeriod: () => PayrollPeriod | null
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined)

export function PayrollProvider({ children }: { children: ReactNode }) {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([])
  const [records, setRecords] = useState<PayrollRecord[]>([])

  // Cargar datos del localStorage
  useEffect(() => {
    const storedPeriods = localStorage.getItem("rrhh_payroll_periods")
    const storedRecords = localStorage.getItem("rrhh_payroll_records")

    if (storedPeriods) setPeriods(JSON.parse(storedPeriods))
    if (storedRecords) setRecords(JSON.parse(storedRecords))
  }, [])

  // Guardar en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem("rrhh_payroll_periods", JSON.stringify(periods))
  }, [periods])

  useEffect(() => {
    localStorage.setItem("rrhh_payroll_records", JSON.stringify(records))
  }, [records])

  const createPeriod = (period: Omit<PayrollPeriod, "id">) => {
    const newPeriod: PayrollPeriod = {
      ...period,
      id: `period_${Date.now()}`,
    }
    setPeriods([...periods, newPeriod])
    return newPeriod
  }

  const updatePeriod = (periodId: string, updates: Partial<PayrollPeriod>) => {
    setPeriods(periods.map(period =>
      period.id === periodId ? { ...period, ...updates } : period
    ))
  }

  const approvePeriod = (periodId: string, approvedBy: string) => {
    updatePeriod(periodId, {
      status: "approved",
      approvedBy,
      approvalDate: new Date().toISOString(),
    })
  }

  const createPayrollRecord = (record: Omit<PayrollRecord, "id">) => {
    const newRecord: PayrollRecord = {
      ...record,
      id: `payroll_${Date.now()}`,
      processedDate: new Date().toISOString(),
    }
    setRecords([...records, newRecord])
    return newRecord
  }

  const updatePayrollRecord = (recordId: string, updates: Partial<PayrollRecord>) => {
    setRecords(records.map(record =>
      record.id === recordId ? { ...record, ...updates } : record
    ))
  }

  const getRecordsByPeriod = (periodId: string) => {
    return records.filter(record => record.periodId === periodId)
  }

  const getRecordsByUser = (userId: string) => {
    return records.filter(record => record.userId === userId)
  }

  const getCurrentPeriod = () => {
    const today = new Date()
    return periods.find(period => {
      const start = new Date(period.startDate)
      const end = new Date(period.endDate)
      return today >= start && today <= end
    }) || null
  }

  const getNextPeriod = () => {
    const today = new Date()
    return periods.find(period => {
      const start = new Date(period.startDate)
      return start > today
    }) || null
  }

  return (
    <PayrollContext.Provider
      value={{
        periods,
        records,
        createPeriod,
        updatePeriod,
        approvePeriod,
        createPayrollRecord,
        updatePayrollRecord,
        getRecordsByPeriod,
        getRecordsByUser,
        getCurrentPeriod,
        getNextPeriod,
      }}
    >
      {children}
    </PayrollContext.Provider>
  )
}

export function usePayroll() {
  const context = useContext(PayrollContext)
  if (!context) {
    throw new Error("usePayroll must be used within PayrollProvider")
  }
  return context
}
