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
  profileImage?: string // Base64 o blob URL de imagen de perfil
  isAbnormalPayroll?: boolean // Flag si hay descuentos activos
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
  // Campos para préstamos avanzados
  interestRate?: number // Porcentaje de interés (configurado por admin)
  approvedAmount?: number // Monto aprobado por admin
  discountInstallments?: number // Número de cuotas para descuentos
  requestedInstallments?: number // Cuotas solicitadas por empleado
}

export interface HRLoanPayment {
  id: string
  date: string
  amount: number
  source: "payroll" | "manual"
}

export interface HRLoan {
  id: string
  employeeId: string
  employeeName: string
  department: string
  amount: number
  balance: number
  monthlyPayment: number
  interestRate: number
  term: number
  remainingTerm: number
  status: "active" | "completed" | "pending"
  startDate: string
  avatar: string
  payments?: HRLoanPayment[]
  // Campos nuevos para sistema avanzado
  isProcessedInPayroll?: boolean // Si fue aprobado e integrado al sistema de nómina
  paidInstallments?: number // Cuotas pagadas
  discountPerPaycheck?: number // Monto a descontar cada quincena
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
  addLoan: (loan: Omit<HRLoan, "id" | "balance" | "remainingTerm">) => void
  updateLoanStatus: (id: string, status: HRLoan["status"]) => void
  // Actividad
  logActivity: (activity: Omit<ActivityLog, "id" | "time">) => void
  // Desempeño
  goals: PerformanceGoal[]
  reviews: PerformanceReview[]
  addGoal: (goal: Omit<PerformanceGoal, "id">) => void
  updateGoalProgress: (id: string, progress: number) => void
  addReview: (review: Omit<PerformanceReview, "id" | "date" | "score">) => void
  settlePayrollDeductions: (employeeId: string, amounts: { loan: number, advance: number }) => void
}

const STORAGE_KEY = "rrhh_employees_v2"
const REQS_KEY = "rrhh_solicitudes_v2"
const LOANS_KEY = "rrhh_prestamos_v2"
const ACTIVITY_KEY = "rrhh_actividad_v2"
const GOALS_KEY = "rrhh_goals_v2"
const REVIEWS_KEY = "rrhh_reviews_v2"

// Los 5 empleados realistas, alineados con los usuarios del login
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

  const loadData = () => {
    try {
      const storedEmps = localStorage.getItem(STORAGE_KEY)
      const currentEmps = storedEmps ? JSON.parse(storedEmps) : INITIAL_EMPLOYEES
      setEmployees(currentEmps)

      // Sincronizar todos con Nómina para asegurar integridad
      currentEmps.forEach((emp: any) => {
        syncEmpleadoDesdeContexto({
          id: emp.id,
          name: emp.name,
          salary: emp.salary
        })
      })

      const storedReqs = localStorage.getItem(REQS_KEY)
      setRequests(storedReqs ? JSON.parse(storedReqs) : [])

      const storedLoans = localStorage.getItem(LOANS_KEY)
      setLoans(storedLoans ? JSON.parse(storedLoans) : [])

      const storedActs = localStorage.getItem(ACTIVITY_KEY)
      setActivities(storedActs ? JSON.parse(storedActs) : [])

      const storedGoals = localStorage.getItem(GOALS_KEY)
      setGoals(storedGoals ? JSON.parse(storedGoals) : [])

      const storedReviews = localStorage.getItem(REVIEWS_KEY)
      setReviews(storedReviews ? JSON.parse(storedReviews) : [])
    } catch {
      setEmployees(INITIAL_EMPLOYEES)
    } finally {
      setLoaded(true)
    }
  }

  useEffect(() => {
    loadData()

    const handleSync = () => loadData()
    window.addEventListener("storage", handleSync)
    window.addEventListener("storage_sync", handleSync)
    
    return () => {
      window.removeEventListener("storage", handleSync)
      window.removeEventListener("storage_sync", handleSync)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
    localStorage.setItem(REQS_KEY, JSON.stringify(requests))
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans))
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities))
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
  }, [employees, requests, loans, activities, goals, reviews, loaded])

  const value = useMemo<EmployeesContextType>(() => ({
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
      
      // Sincronizar con Nómina
      syncEmpleadoDesdeContexto({
        id: employee.id,
        name: employee.name,
        salary: employee.salary
      })
      
      logGlobalActivity({
        type: "employee.created",
        message: `Se registró un nuevo colaborador: ${employee.name}`,
        actor: { id: "system", name: "Sistema de RRHH" }
      })

      return employee
    },
    updateEmployee: (employeeId, updates) => {
      setEmployees((prev) => {
        const next = prev.map((emp) =>
          emp.id === employeeId ? { ...emp, ...updates } : emp
        )
        
        // Sincronizar con Nómina si cambió nombre o salario
        const emp = next.find(e => e.id === employeeId)
        if (emp && (updates.name || updates.salary)) {
          syncEmpleadoDesdeContexto({
            id: emp.id,
            name: emp.name,
            salary: emp.salary
          })
        }
        
        return next
      })
    },
    deleteEmployee: (employeeId) => {
      const emp = employees.find(e => e.id === employeeId)
      if (emp) {
        logGlobalActivity({
          type: "employee.deleted",
          message: `Se eliminó al colaborador: ${emp.name}`,
          actor: { id: "system", name: "Sistema de RRHH" }
        })
      }
      setEmployees((prev) => prev.filter((employee) => employee.id !== employeeId))
    },
    getEmployeeByName: (name) => {
      const normalized = name.trim().toLowerCase()
      return employees.find((employee) => employee.name.toLowerCase() === normalized)
    },
    getEmployeeById: (id) => {
      return employees.find((employee) => employee.id === id)
    },
    // Solicitudes
    addRequest: (req) => {
      const newReq: HRRequest = {
        ...req,
        id: `req-${crypto.randomUUID()}`,
        status: "pending",
        createdAt: new Date().toISOString()
      }
      setRequests(prev => [newReq, ...prev])
    },
    updateRequestStatus: (id, status) => {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    },
    // Prestamos
    addLoan: (loan) => {
      const newLoan: HRLoan = {
        ...loan,
        id: `loan-${crypto.randomUUID()}`,
        status: (loan as any).status || "active",
        balance: loan.amount,
        remainingTerm: loan.term
      }
      setLoans(prev => [newLoan, ...prev])
    },
    updateLoanStatus: (id, status) => {
      setLoans(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    },
    // Actividad
    logActivity: (activity) => {
      const newAct: ActivityLog = {
        ...activity,
        id: `act-${crypto.randomUUID()}`,
        time: "Justo ahora"
      }
      setActivities(prev => [newAct, ...prev].slice(0, 20)) // Mantener los 20 más recientes
    },
    // Desempeño
    goals,
    reviews,
    addGoal: (goal) => {
      const newGoal: PerformanceGoal = {
        ...goal,
        id: `goal-${crypto.randomUUID()}`
      }
      setGoals(prev => [newGoal, ...prev])
    },
    updateGoalProgress: (id, progress) => {
      setGoals(prev => prev.map(g => 
        g.id === id 
          ? { 
              ...g, 
              progress, 
              status: progress === 100 ? "completed" : g.status 
            } 
          : g
      ))
    },
    settlePayrollDeductions: (empId, amounts) => {
      // 1. Préstamos: Liquidar el monto pagado distribuyéndolo si hay varios
      if (amounts.loan > 0) {
        setLoans(prev => {
          let remainingToSettle = amounts.loan
          return prev.map(loan => {
            if (loan.employeeId === empId && loan.status === "active" && remainingToSettle > 0) {
              // Determinamos cuánto de este "block" de descuento le toca a este préstamo
              // Normalmente es su monthlyPayment, pero para ser robustos tomamos lo que sobre
              const amountForThisLoan = Math.min(loan.monthlyPayment, remainingToSettle)
              remainingToSettle -= amountForThisLoan

              const newBalance = Math.max(0, loan.balance - amountForThisLoan)
              const newPayment: HRLoanPayment = {
                id: `pay-${crypto.randomUUID()}`,
                date: new Date().toISOString(),
                amount: amountForThisLoan,
                source: "payroll"
              }
              
              return {
                ...loan,
                balance: newBalance,
                remainingTerm: newBalance > 0.01 ? loan.remainingTerm - 1 : 0,
                status: newBalance <= 0.01 ? "completed" : "active",
                payments: [...(loan.payments || []), newPayment]
              }
            }
            return loan
          })
        })
      }

      // 2. Adelantos: Marcar como procesados
      if (amounts.advance > 0) {
        setRequests(prev => prev.map(req => {
          if (req.employeeId === empId && req.type === "payroll_advance" && req.status === "approved") {
            return { ...req, status: "processed" as const }
          }
          return req
        }))
      }
    },
    addReview: (review) => {
      const score = Math.round((review.productivity + review.teamwork + review.communication + review.leadership) / 4 * 10)
      const newReview: PerformanceReview = {
        ...review,
        id: `rev-${crypto.randomUUID()}`,
        date: new Date().toISOString().slice(0, 10),
        score
      }
      setReviews(prev => [newReview, ...prev])
    }
  }), [employees, requests, loans, activities, goals, reviews])

  return <EmployeesContext.Provider value={value}>{loaded ? children : null}</EmployeesContext.Provider>
}

export function useEmployees() {
  const context = useContext(EmployeesContext)
  if (!context) {
    throw new Error("useEmployees must be used within EmployeesProvider")
  }
  return context
}
