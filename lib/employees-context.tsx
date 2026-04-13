"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { syncEmpleadoDesdeContexto } from "./nomina"
import { logActivity as logGlobalActivity } from "./activity-log"

export type EmployeeStatus = "active" | "inactive"

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  salary: number
  status: EmployeeStatus
  startDate: string
  avatar: string
  cedula?: string
  address?: string
  birthDate?: string
  emergencyContact?: string
  emergencyPhone?: string
  bankAccount?: string
  bankName?: string
}

export interface HRRequest {
  id: string
  employeeId: string
  employeeName: string
  type: string
  title: string
  description: string
  startDate: string
  endDate: string | null
  days: number | null
  status: "pending" | "approved" | "rejected" | "processed"
  amount?: number
  createdAt: string
  avatar: string
  /** Quincena destino del descuento: YYYY-MM-QN (ej. 2025-04-Q2) */
  targetPeriod?: string
}

export interface HRLoanPayment {
  id: string
  date: string
  amount: number
  source: "payroll" | "manual"
  periodoKey?: string
}

export interface HRLoan {
  id: string
  employeeId: string
  employeeName: string
  department: string
  /** Monto solicitado originalmente */
  requestedAmount: number
  /** Balance pendiente de pagar */
  balance: number
  /** Tasa de interés configurada por admin (%) */
  interestRate: number
  /** Número de quincenas para descontar (configurado por admin) */
  biweeklyInstallments: number
  /** Cuota quincenal a descontar (calculada automáticamente) */
  biweeklyPayment: number
  /** Quincenas restantes por descontar */
  remainingBiweekly: number
  /** Detalles de descuentos programados por quincena */
  deductionSchedule: {
    [periodoKey: string]: number // periodoKey (2025-04-Q1) => monto a descontar
  }
  status: "pending" | "approved" | "active" | "completed" | "rejected"
  requestedAt: string
  approvedAt?: string
  startDate?: string
  avatar: string
  payments?: HRLoanPayment[]
}

export interface ActivityLog {
  id: string
  type: "nomina" | "solicitud" | "prestamo" | "empleado" | "perfil"
  title: string
  description: string
  time: string
  status: "completed" | "pending" | "rejected"
  userId: string
}

export interface PerformanceGoal {
  id: string
  employeeId: string
  title: string
  description: string
  progress: number
  dueDate: string
  status: "in_progress" | "completed" | "overdue"
}

export interface PerformanceReview {
  id: string
  employeeId: string
  productivity: number
  teamwork: number
  communication: number
  leadership: number
  comments: string
  date: string
  score: number
}

interface EmployeeCreateInput {
  name: string
  email: string
  phone: string
  department: string
  position: string
  salary: number
}

interface EmployeesContextType {
  employees: Employee[]
  requests: HRRequest[]
  loans: HRLoan[]
  activities: ActivityLog[]
  createEmployee: (payload: EmployeeCreateInput) => Employee
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => void
  deleteEmployee: (employeeId: string) => void
  getEmployeeByName: (name: string) => Employee | undefined
  getEmployeeById: (id: string) => Employee | undefined
  // Solicitudes
  addRequest: (request: Omit<HRRequest, "id" | "createdAt" | "status">) => void
  updateRequestStatus: (id: string, status: HRRequest["status"]) => void
  // Prestamos
  addLoan: (loan: Omit<HRLoan, "id" | "status" | "requestedAt" | "balance" | "biweeklyPayment" | "remainingBiweekly" | "deductionSchedule">) => void
  approveLoan: (loanId: string, interestRate: number, biweeklyInstallments: number) => void
  updateLoanStatus: (id: string, status: HRLoan["status"]) => void
  payLoanManual: (loanId: string, amount: number) => void
  // Actividad
  logActivity: (activity: Omit<ActivityLog, "id" | "time">) => void
  // Desempeño
  goals: PerformanceGoal[]
  reviews: PerformanceReview[]
  addGoal: (goal: Omit<PerformanceGoal, "id">) => void
  updateGoalProgress: (id: string, progress: number) => void
  addReview: (review: Omit<PerformanceReview, "id" | "date" | "score">) => void
  /**
   * Liquidar descuentos de nómina: aplica el descuento programado del préstamo
   * y marca los adelantos de esa quincena como procesados.
   */
  settlePayrollDeductions: (employeeId: string, periodoKey: string) => void
  /** Devuelve la cuota quincenal activa de préstamos para un empleado */
  getActiveLoanBiweeklyTotal: (employeeId: string) => number
  /** Devuelve el descuento del préstamo para una quincena específica */
  getLoanDeductionForPeriod: (employeeId: string, periodoKey: string) => number
  /** Devuelve los adelantos aprobados para una quincena específica */
  getApprovedAdvancesForPeriod: (employeeId: string, periodoKey: string) => number
}

const STORAGE_KEY = "rrhh_employees_v2"
const REQS_KEY = "rrhh_solicitudes_v2"
const LOANS_KEY = "rrhh_prestamos_v2"
const ACTIVITY_KEY = "rrhh_actividad_v2"
const GOALS_KEY = "rrhh_goals_v2"
const REVIEWS_KEY = "rrhh_reviews_v2"

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "usr-001",
    name: "Carlos Alberto Méndez",
    email: "carlos.mendez@empresa.com",
    phone: "809-555-0001",
    department: "Dirección General",
    position: "Director General",
    salary: 150000,
    status: "active",
    startDate: "2018-01-10",
    avatar: "CM",
    cedula: "001-1234567-8",
    address: "Av. Winston Churchill #45, Ens. Piantini, Santo Domingo",
    birthDate: "1980-03-15",
    emergencyContact: "Laura Méndez",
    emergencyPhone: "809-555-9001",
    bankAccount: "1234-5678-9012",
    bankName: "Banco Popular Dominicano",
  },
  {
    id: "usr-002",
    name: "María Isabel Rodríguez",
    email: "maria.rodriguez@empresa.com",
    phone: "809-555-0002",
    department: "Recursos Humanos",
    position: "Gerente de RRHH",
    salary: 85000,
    status: "active",
    startDate: "2019-06-01",
    avatar: "MR",
    cedula: "002-9876543-1",
    address: "Calle Las Palmas #12, Los Jardines, Santiago",
    birthDate: "1985-07-22",
    emergencyContact: "Pedro Rodríguez",
    emergencyPhone: "809-555-9002",
    bankAccount: "2345-6789-0123",
    bankName: "Banco BHD León",
  },
  {
    id: "usr-003",
    name: "Roberto Javier Hernández",
    email: "roberto.hernandez@empresa.com",
    phone: "809-555-0003",
    department: "Operaciones",
    position: "Supervisor de Operaciones",
    salary: 65000,
    status: "active",
    startDate: "2020-03-15",
    avatar: "RH",
    cedula: "003-4567891-2",
    address: "Calle Duarte #78, Zona Colonial, Santo Domingo",
    birthDate: "1990-11-08",
    emergencyContact: "Ana Hernández",
    emergencyPhone: "809-555-9003",
    bankAccount: "3456-7890-1234",
    bankName: "Banreservas",
  },
  {
    id: "usr-004",
    name: "Carolina Estrella Peña",
    email: "carolina.pena@empresa.com",
    phone: "809-555-0004",
    department: "Contabilidad",
    position: "Contadora Senior",
    salary: 55000,
    status: "active",
    startDate: "2021-09-01",
    avatar: "CP",
    cedula: "004-7891234-5",
    address: "Av. 27 de Febrero #190, Ens. Naco, Santo Domingo",
    birthDate: "1992-04-30",
    emergencyContact: "Miguel Peña",
    emergencyPhone: "809-555-9004",
    bankAccount: "4567-8901-2345",
    bankName: "Scotiabank",
  },
  {
    id: "usr-005",
    name: "Andrés Felipe Santos",
    email: "andres.santos@empresa.com",
    phone: "809-555-0005",
    department: "Tecnología",
    position: "Desarrollador Full Stack",
    salary: 70000,
    status: "active",
    startDate: "2022-02-14",
    avatar: "AS",
    cedula: "005-3216549-8",
    address: "Calle El Sol #56, Bella Vista, Santo Domingo",
    birthDate: "1995-01-18",
    emergencyContact: "Lucía Santos",
    emergencyPhone: "809-555-9005",
    bankAccount: "5678-9012-3456",
    bankName: "Banco Popular Dominicano",
  },
]

const EmployeesContext = createContext<EmployeesContextType | undefined>(undefined)

function getInitials(name: string): string {
  const [first = "", second = ""] = name.trim().split(/\s+/)
  return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase()
}

export function EmployeesProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [requests, setRequests] = useState<HRRequest[]>([])
  const [loans, setLoans] = useState<HRLoan[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [goals, setGoals] = useState<PerformanceGoal[]>([])
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Carga inicial de todos los datos desde localStorage
    try {
      const storedEmps = localStorage.getItem(STORAGE_KEY)
      setEmployees(storedEmps ? JSON.parse(storedEmps) : INITIAL_EMPLOYEES)

      const storedLoans = localStorage.getItem(LOANS_KEY)
      setLoans(storedLoans ? JSON.parse(storedLoans) : [])

      const storedReqs = localStorage.getItem(REQS_KEY)
      setRequests(storedReqs ? JSON.parse(storedReqs) : [])

      const storedActivities = localStorage.getItem(ACTIVITY_KEY)
      setActivities(storedActivities ? JSON.parse(storedActivities) : [])

      const storedGoals = localStorage.getItem(GOALS_KEY)
      setGoals(storedGoals ? JSON.parse(storedGoals) : [])

      const storedReviews = localStorage.getItem(REVIEWS_KEY)
      setReviews(storedReviews ? JSON.parse(storedReviews) : [])
    } catch (e) {
      console.error("Error loading data from localStorage", e)
    } finally {
      setLoaded(true)
    }
  }, [])

  // Guardar cambios en localStorage SOLO después de la carga inicial
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
  }, [employees, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans))
  }, [loans, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(REQS_KEY, JSON.stringify(requests))
  }, [requests, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities))
  }, [activities, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
  }, [goals, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
  }, [reviews, loaded])

  const value = useMemo<EmployeesContextType>(
    () => ({
      employees,
      requests,
      loans,
      activities,

      createEmployee: (payload) => {
        const employee: Employee = {
          id: `emp-${crypto.randomUUID()}`,
          name: payload.name.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          department: payload.department.trim(),
          position: payload.position.trim(),
          salary: payload.salary,
          status: "active",
          startDate: new Date().toISOString().slice(0, 10),
          avatar: getInitials(payload.name),
        }
        setEmployees((prev) => [employee, ...prev])
        syncEmpleadoDesdeContexto({ id: employee.id, name: employee.name, salary: employee.salary })
        logGlobalActivity({
          type: "employee.created",
          message: `Se registró un nuevo colaborador: ${employee.name}`,
          actor: { id: "system", name: "Sistema de RRHH" },
        })
        return employee
      },

      updateEmployee: (employeeId, updates) => {
        setEmployees((prev) => {
          const next = prev.map((emp) => (emp.id === employeeId ? { ...emp, ...updates } : emp))
          const emp = next.find((e) => e.id === employeeId)
          if (emp && (updates.name || updates.salary !== undefined)) {
            syncEmpleadoDesdeContexto({ id: emp.id, name: emp.name, salary: emp.salary })
          }
          return next
        })
      },

      deleteEmployee: (employeeId) => {
        const emp = employees.find((e) => e.id === employeeId)
        if (emp) {
          logGlobalActivity({
            type: "employee.deleted",
            message: `Se eliminó al colaborador: ${emp.name}`,
            actor: { id: "system", name: "Sistema de RRHH" },
          })
        }
        setEmployees((prev) => prev.filter((e) => e.id !== employeeId))
      },

      getEmployeeByName: (name) => {
        const normalized = name.trim().toLowerCase()
        return employees.find((e) => e.name.toLowerCase() === normalized)
      },

      getEmployeeById: (id) => employees.find((e) => e.id === id),

      // ── Solicitudes ─────────────────────────────────────────────
      addRequest: (req) => {
        const newReq: HRRequest = {
          ...req,
          id: `req-${crypto.randomUUID()}`,
          status: "pending",
          createdAt: new Date().toISOString(),
        }
        setRequests((prev) => [newReq, ...prev])
      },

      updateRequestStatus: (id, status) => {
        setRequests((prev) => {
          const updated = prev.map((r) => (r.id === id ? { ...r, status } : r))
          // Re-sincronizar nómina si se aprueba/rechaza un adelanto
          const req = updated.find((r) => r.id === id)
          if (req && req.type === "payroll_advance") {
            const empLoans = loans.filter(
              (l) => l.employeeId === req.employeeId && (l.status === "active" || l.status === "approved")
            )
            const totalLoanCuota = empLoans.reduce((acc, l) => acc + (l.biweeklyPayment ?? l.monthlyPayment / 2), 0)
            const empAdvances = updated.filter(
              (r2) => r2.employeeId === req.employeeId && r2.type === "payroll_advance" && r2.status === "approved"
            )
            const totalAdvances = empAdvances.reduce((acc, r2) => acc + (r2.amount || 0), 0)
            const emp = employees.find((e) => e.id === req.employeeId)
            if (emp) {
              syncEmpleadoDesdeContexto({
                id: emp.id,
                name: emp.name,
                salary: emp.salary,
                prestamos: totalLoanCuota,
                anticipos: totalAdvances,
              })
            }
          }
          return updated
        })
      },

      // ── Préstamos ────────────────────────────────────────────────
      addLoan: (loan) => {
        const newLoan: HRLoan = {
          ...loan,
          id: `loan-${crypto.randomUUID()}`,
          status: "pending",
          requestedAt: new Date().toISOString(),
          balance: 0,
          biweeklyPayment: 0,
          remainingBiweekly: 0,
          deductionSchedule: {},
        }
        setLoans((prev) => [newLoan, ...prev])
      },

      approveLoan: (loanId, interestRate: number, biweeklyInstallments: number) => {
        setLoans((prev) => {
          const updated = prev.map((loan) => {
            if (loan.id !== loanId) return loan
            
            // Calcular monto con interés
            const totalAmount = interestRate > 0 
              ? loan.requestedAmount * (1 + interestRate / 100) 
              : loan.requestedAmount
            
            // Cuota quincenal
            const biweeklyPayment = Math.round(totalAmount / biweeklyInstallments)
            
            // Crear calendario de descuentos
            const deductionSchedule: { [key: string]: number } = {}
            let currentBiweekly = biweeklyInstallments
            let totalScheduled = 0
            
            // Generar el calendario a partir de hoy
            const today = new Date()
            today.setDate(1) // Comenzar desde el 1 del mes actual
            
            for (let i = 0; i < biweeklyInstallments; i++) {
              // Alternar entre Q1 (15) y Q2 (30) del mes
              const month = today.getMonth() + Math.floor((today.getDate() + i * 15) / 30)
              const year = today.getFullYear() + Math.floor(month / 12)
              const monthStr = String((month % 12) + 1).padStart(2, "0")
              const yearStr = String(year)
              
              const quarterIdx = i % 2
              const quarterKey = quarterIdx === 0 ? "Q1" : "Q2"
              const periodoKey = `${yearStr}-${monthStr}-${quarterKey}`
              
              const amount = i === biweeklyInstallments - 1 
                ? totalAmount - totalScheduled 
                : biweeklyPayment
              
              deductionSchedule[periodoKey] = amount
              totalScheduled += amount
            }
            
            return {
              ...loan,
              status: "approved",
              approvedAt: new Date().toISOString(),
              interestRate,
              biweeklyInstallments,
              biweeklyPayment,
              remainingBiweekly: biweeklyInstallments,
              balance: totalAmount,
              deductionSchedule,
            }
          })
          return updated
        })
      },

      updateLoanStatus: (id, status) => {
        setLoans((prev) => {
          const updated = prev.map((l) => (l.id === id ? { ...l, status } : l))
          // Re-sincronizar si está activo
          const loan = updated.find((l) => l.id === id)
          if (loan && loan.status === "active") {
            const empLoans = updated.filter(
              (l) => l.employeeId === loan.employeeId && l.status === "active"
            )
            const totalLoanCuota = empLoans.reduce((acc, l) => acc + l.biweeklyPayment, 0)
            const empAdvances = requests.filter(
              (r) => r.employeeId === loan.employeeId && r.type === "payroll_advance" && r.status === "approved"
            )
            const totalAdvances = empAdvances.reduce((acc, r) => acc + (r.amount || 0), 0)
            const emp = employees.find((e) => e.id === loan.employeeId)
            if (emp) {
              syncEmpleadoDesdeContexto({
                id: emp.id,
                name: emp.name,
                salary: emp.salary,
                prestamos: totalLoanCuota,
                anticipos: totalAdvances,
              })
            }
          }
          return updated
        })
      },

      payLoanManual: (loanId, amount) => {
        setLoans((prev) => {
          const updated = prev.map((loan) => {
            if (loan.id !== loanId) return loan
            const newBalance = Math.max(0, loan.balance - amount)
            const payment: HRLoanPayment = {
              id: `pay-${crypto.randomUUID()}`,
              date: new Date().toISOString(),
              amount,
              source: "manual",
            }
            return {
              ...loan,
              balance: newBalance,
              remainingTerm: newBalance > 0.01 ? Math.max(0, loan.remainingTerm - 1) : 0,
              status: newBalance <= 0.01 ? "completed" : loan.status,
              payments: [...(loan.payments || []), payment],
            }
          })
          return updated
        })
      },

      // ── Liquidar deducciones al procesar nómina ──────────────────
      settlePayrollDeductions: (empId, periodoKey) => {
        setLoans((prev) => {
          const updated = prev.map((loan) => {
            if (loan.employeeId !== empId || loan.status !== "active") return loan
            
            // Buscar si hay descuento programado para esta quincena
            const amount = loan.deductionSchedule[periodoKey]
            if (!amount || amount <= 0) return loan
            
            const newBalance = Math.max(0, loan.balance - amount)
            const isCompleted = newBalance <= 0.01
            
            const payment: HRLoanPayment = {
              id: `pay-${crypto.randomUUID()}`,
              date: new Date().toISOString(),
              amount,
              source: "payroll",
              periodoKey,
            }
            
            return {
              ...loan,
              balance: isCompleted ? 0 : newBalance,
              remainingBiweekly: isCompleted ? 0 : Math.max(0, loan.remainingBiweekly - 1),
              status: isCompleted ? "completed" : "active",
              payments: [...(loan.payments || []), payment],
            }
          })
          return updated
        })

        // Adelantos aprobados para esta quincena: marcar como procesados
        setRequests((prev) => {
          const updated = prev.map((req) => {
            if (
              req.employeeId === empId &&
              req.type === "payroll_advance" &&
              req.status === "approved" &&
              req.targetPeriod === periodoKey
            ) {
              return { ...req, status: "processed" as const }
            }
            return req
          })
          return updated
        })
      },

      // ── Helpers de consulta ──────────────────────────────────────
      getActiveLoanBiweeklyTotal: (employeeId) => {
        return loans
          .filter((l) => l.employeeId === employeeId && l.status === "active")
          .reduce((acc, l) => acc + l.biweeklyPayment, 0)
      },

      getLoanDeductionForPeriod: (employeeId, periodoKey) => {
        return loans
          .filter((l) => l.employeeId === employeeId && l.status === "active")
          .reduce((acc, l) => acc + (l.deductionSchedule[periodoKey] || 0), 0)
      },

      getApprovedAdvancesForPeriod: (employeeId, periodoKey) => {
        return requests
          .filter(
            (r) =>
              r.employeeId === employeeId &&
              r.type === "payroll_advance" &&
              r.status === "approved" &&
              r.targetPeriod === periodoKey
          )
          .reduce((acc, r) => acc + (r.amount || 0), 0)
      },

      // ── Actividad ────────────────────────────────────────��───────
      logActivity: (activity) => {
        const newAct: ActivityLog = {
          ...activity,
          id: `act-${crypto.randomUUID()}`,
          time: "Justo ahora",
        }
        setActivities((prev) => [newAct, ...prev].slice(0, 20))
      },

      // ── Desempeño ────────────────────────────────────────────────
      goals,
      reviews,

      addGoal: (goal) => {
        const newGoal: PerformanceGoal = { ...goal, id: `goal-${crypto.randomUUID()}` }
        setGoals((prev) => [newGoal, ...prev])
      },

      updateGoalProgress: (id, progress) => {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === id ? { ...g, progress, status: progress === 100 ? "completed" : g.status } : g
          )
        )
      },

      addReview: (review) => {
        const score = Math.round(
          ((review.productivity + review.teamwork + review.communication + review.leadership) / 4) * 10
        )
        const newReview: PerformanceReview = {
          ...review,
          id: `rev-${crypto.randomUUID()}`,
          date: new Date().toISOString().slice(0, 10),
          score,
        }
        setReviews((prev) => [newReview, ...prev])
      },
    }),
    [employees, requests, loans, activities, goals, reviews]
  )

  return <EmployeesContext.Provider value={value}>{loaded ? children : null}</EmployeesContext.Provider>
}

export function useEmployees() {
  const context = useContext(EmployeesContext)
  if (!context) {
    throw new Error("useEmployees must be used within EmployeesProvider")
  }
  return context
}
