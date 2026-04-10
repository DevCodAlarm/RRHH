"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { logActivity } from "@/lib/activity-log"

export type UserRole = "admin" | "rrhh" | "supervisor" | "empleado"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  avatar?: string
  department?: string
  position?: string
  phone?: string
  cedula?: string
  address?: string
  birthDate?: string
  startDate?: string
  emergencyContact?: string
  emergencyPhone?: string
  bankAccount?: string
  bankName?: string
  salary?: number
  status?: "active" | "inactive"
}

export interface Permission {
  module: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canApprove: boolean
}

// ==========================================
// 5 USUARIOS REALISTAS PRE-CARGADOS
// ==========================================
export const SEED_USERS: User[] = [
  {
    id: "usr-001",
    name: "Carlos Alberto Méndez",
    email: "carlos.mendez@empresa.com",
    password: "admin123",
    role: "admin",
    department: "Dirección General",
    position: "Director General",
    phone: "809-555-0001",
    cedula: "001-1234567-8",
    address: "Av. Winston Churchill #45, Ens. Piantini, Santo Domingo",
    birthDate: "1980-03-15",
    startDate: "2018-01-10",
    emergencyContact: "Laura Méndez",
    emergencyPhone: "809-555-9001",
    bankAccount: "1234-5678-9012",
    bankName: "Banco Popular Dominicano",
    salary: 150000,
    avatar: "CM",
    status: "active",
  },
  {
    id: "usr-002",
    name: "María Isabel Rodríguez",
    email: "maria.rodriguez@empresa.com",
    password: "rrhh123",
    role: "rrhh",
    department: "Recursos Humanos",
    position: "Gerente de RRHH",
    phone: "809-555-0002",
    cedula: "002-9876543-1",
    address: "Calle Las Palmas #12, Los Jardines, Santiago",
    birthDate: "1985-07-22",
    startDate: "2019-06-01",
    emergencyContact: "Pedro Rodríguez",
    emergencyPhone: "809-555-9002",
    bankAccount: "2345-6789-0123",
    bankName: "Banco BHD León",
    salary: 85000,
    avatar: "MR",
    status: "active",
  },
  {
    id: "usr-003",
    name: "Roberto Javier Hernández",
    email: "roberto.hernandez@empresa.com",
    password: "super123",
    role: "supervisor",
    department: "Operaciones",
    position: "Supervisor de Operaciones",
    phone: "809-555-0003",
    cedula: "003-4567891-2",
    address: "Calle Duarte #78, Zona Colonial, Santo Domingo",
    birthDate: "1990-11-08",
    startDate: "2020-03-15",
    emergencyContact: "Ana Hernández",
    emergencyPhone: "809-555-9003",
    bankAccount: "3456-7890-1234",
    bankName: "Banreservas",
    salary: 65000,
    avatar: "RH",
    status: "active",
  },
  {
    id: "usr-004",
    name: "Carolina Estrella Peña",
    email: "carolina.pena@empresa.com",
    password: "emp1234",
    role: "empleado",
    department: "Contabilidad",
    position: "Contadora Senior",
    phone: "809-555-0004",
    cedula: "004-7891234-5",
    address: "Av. 27 de Febrero #190, Ens. Naco, Santo Domingo",
    birthDate: "1992-04-30",
    startDate: "2021-09-01",
    emergencyContact: "Miguel Peña",
    emergencyPhone: "809-555-9004",
    bankAccount: "4567-8901-2345",
    bankName: "Scotiabank",
    salary: 55000,
    avatar: "CP",
    status: "active",
  },
  {
    id: "usr-005",
    name: "Andrés Felipe Santos",
    email: "andres.santos@empresa.com",
    password: "emp5678",
    role: "empleado",
    department: "Tecnología",
    position: "Desarrollador Full Stack",
    phone: "809-555-0005",
    cedula: "005-3216549-8",
    address: "Calle El Sol #56, Bella Vista, Santo Domingo",
    birthDate: "1995-01-18",
    startDate: "2022-02-14",
    emergencyContact: "Lucía Santos",
    emergencyPhone: "809-555-9005",
    bankAccount: "5678-9012-3456",
    bankName: "Banco Popular Dominicano",
    salary: 70000,
    avatar: "AS",
    status: "active",
  },
]

// Definición de permisos por rol
export const rolePermissions: Record<UserRole, Record<string, Permission>> = {
  admin: {
    dashboard: { module: "dashboard", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    colaboradores: { module: "colaboradores", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    turnos: { module: "turnos", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    organigrama: { module: "organigrama", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    contratacion: { module: "contratacion", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    desempeno: { module: "desempeno", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    periodos: { module: "periodos", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    procesar: { module: "procesar", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    historial: { module: "historial", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    prestamos: { module: "prestamos", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    solicitudes: { module: "solicitudes", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    declaraciones: { module: "declaraciones", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    reportes: { module: "reportes", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    configuracion: { module: "configuracion", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    tasas: { module: "tasas", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    roles: { module: "roles", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    perfil: { module: "perfil", canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    mi_nomina: { module: "mi_nomina", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
  },
  rrhh: {
    dashboard: { module: "dashboard", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    colaboradores: { module: "colaboradores", canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false },
    turnos: { module: "turnos", canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false },
    organigrama: { module: "organigrama", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    contratacion: { module: "contratacion", canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true },
    desempeno: { module: "desempeno", canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false },
    periodos: { module: "periodos", canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false },
    procesar: { module: "procesar", canView: true, canCreate: true, canEdit: false, canDelete: false, canApprove: false },
    historial: { module: "historial", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    prestamos: { module: "prestamos", canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false },
    solicitudes: { module: "solicitudes", canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true },
    declaraciones: { module: "declaraciones", canView: true, canCreate: true, canEdit: false, canDelete: false, canApprove: false },
    reportes: { module: "reportes", canView: true, canCreate: true, canEdit: false, canDelete: false, canApprove: false },
    configuracion: { module: "configuracion", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    tasas: { module: "tasas", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    roles: { module: "roles", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    perfil: { module: "perfil", canView: true, canCreate: false, canEdit: true, canDelete: false, canApprove: false },
    mi_nomina: { module: "mi_nomina", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
  },
  supervisor: {
    dashboard: { module: "dashboard", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    colaboradores: { module: "colaboradores", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    turnos: { module: "turnos", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    organigrama: { module: "organigrama", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    contratacion: { module: "contratacion", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    desempeno: { module: "desempeno", canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true },
    periodos: { module: "periodos", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    procesar: { module: "procesar", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    historial: { module: "historial", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    prestamos: { module: "prestamos", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: true },
    solicitudes: { module: "solicitudes", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: true },
    declaraciones: { module: "declaraciones", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    reportes: { module: "reportes", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    configuracion: { module: "configuracion", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    tasas: { module: "tasas", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    roles: { module: "roles", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    perfil: { module: "perfil", canView: true, canCreate: false, canEdit: true, canDelete: false, canApprove: false },
    mi_nomina: { module: "mi_nomina", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
  },
  empleado: {
    dashboard: { module: "dashboard", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    colaboradores: { module: "colaboradores", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    turnos: { module: "turnos", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    organigrama: { module: "organigrama", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    contratacion: { module: "contratacion", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    desempeno: { module: "desempeno", canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    // Nómina: el empleado NO debe ver este apartado
    periodos: { module: "periodos", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    procesar: { module: "procesar", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    historial: { module: "historial", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    mi_nomina: { module: "mi_nomina", canView: true, canCreate: true, canEdit: false, canDelete: false, canApprove: false },
    prestamos: { module: "prestamos", canView: true, canCreate: true, canEdit: false, canDelete: false, canApprove: false },
    solicitudes: { module: "solicitudes", canView: true, canCreate: true, canEdit: false, canDelete: false, canApprove: false },
    declaraciones: { module: "declaraciones", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    reportes: { module: "reportes", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    configuracion: { module: "configuracion", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    tasas: { module: "tasas", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    roles: { module: "roles", canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false },
    perfil: { module: "perfil", canView: true, canCreate: false, canEdit: true, canDelete: false, canApprove: false },
  },
}

// Descripción de roles para mostrar en la UI
export const roleDescriptions: Record<UserRole, { name: string; description: string; color: string }> = {
  admin: {
    name: "Administrador",
    description: "Acceso total al sistema. Puede crear, editar, eliminar y aprobar en todos los módulos.",
    color: "bg-secondary text-secondary-foreground border border-border",
  },
  rrhh: {
    name: "Recursos Humanos",
    description: "Gestión de personal, nómina, préstamos y solicitudes. No puede acceder a configuración del sistema.",
    color: "bg-secondary text-secondary-foreground border border-border",
  },
  supervisor: {
    name: "Supervisor",
    description: "Puede ver información de su equipo, aprobar solicitudes y evaluar desempeño.",
    color: "bg-secondary text-secondary-foreground border border-border",
  },
  empleado: {
    name: "Empleado",
    description: "Acceso limitado a su información personal, solicitudes y préstamos propios.",
    color: "bg-secondary text-secondary-foreground border border-border",
  },
}

// ==========================================
// Función para sembrar usuarios en localStorage
// ==========================================
function seedUsersIfNeeded() {
  if (typeof window === "undefined") return
  const savedUsers = localStorage.getItem("rrhh_users_v2")
  if (!savedUsers) {
    // Primera vez: sembrar los 5 usuarios realistas
    localStorage.setItem("rrhh_users_v2", JSON.stringify(SEED_USERS))
  } else {
    // Verificar que los seed users existan, si no añadirlos
    try {
      const existing: User[] = JSON.parse(savedUsers)
      const existingIds = new Set(existing.map(u => u.id))
      let updated = false
      for (const seed of SEED_USERS) {
        if (!existingIds.has(seed.id)) {
          existing.push(seed)
          updated = true
        }
      }
      if (updated) {
        localStorage.setItem("rrhh_users_v2", JSON.stringify(existing))
      }
    } catch {
      // Si hay error en parsing, re-sembrar
      localStorage.setItem("rrhh_users_v2", JSON.stringify(SEED_USERS))
    }
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  createQuickUser: (name: string, email: string, role: UserRole) => void
  hasPermission: (module: string, action: "canView" | "canCreate" | "canEdit" | "canDelete" | "canApprove") => boolean
  getModulePermission: (module: string) => Permission | null
  updateUserAvatar: (avatar: string) => void
  updateUserProfile: (updates: Partial<User>) => void
  getAllUsers: () => User[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Sembrar usuarios si es primera vez
    seedUsersIfNeeded()

    // Recuperar usuario de localStorage al cargar
    const savedUser = localStorage.getItem("rrhh_user")
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Asegurar que los usuarios seed están cargados
    seedUsersIfNeeded()

    const savedUsers = localStorage.getItem("rrhh_users_v2")
    const users: User[] = savedUsers ? JSON.parse(savedUsers) : []
    
    // Buscar usuario por email Y contraseña
    const foundUser = users.find(u => u.email === email && u.password === password)
    if (foundUser) {
      setUser(foundUser)
      setIsAuthenticated(true)
      localStorage.setItem("rrhh_user", JSON.stringify(foundUser))
      logActivity({
        type: "auth.login",
        message: `${foundUser.name} inició sesión`,
        actor: { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role },
      })
      return true
    }

    // Verificar si el email existe pero la contraseña es incorrecta
    const emailExists = users.find(u => u.email === email)
    if (emailExists) {
      return false // Contraseña incorrecta
    }

    return false // Usuario no encontrado
  }

  const logout = () => {
    if (user) {
      logActivity({
        type: "auth.logout",
        message: `${user.name} cerró sesión`,
        actor: { id: user.id, name: user.name, email: user.email, role: user.role },
      })
    }
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("rrhh_user")
  }

  const createQuickUser = (name: string, email: string, role: UserRole) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password: "password123",
      role,
      department: role === "admin" ? "Dirección" : role === "rrhh" ? "Recursos Humanos" : role === "supervisor" ? "Operaciones" : "General",
      position: roleDescriptions[role].name,
    }

    // Guardar en lista de usuarios
    const savedUsers = localStorage.getItem("rrhh_users_v2")
    const users: User[] = savedUsers ? JSON.parse(savedUsers) : []
    users.push(newUser)
    localStorage.setItem("rrhh_users_v2", JSON.stringify(users))

    // Iniciar sesión automáticamente
    setUser(newUser)
    setIsAuthenticated(true)
    localStorage.setItem("rrhh_user", JSON.stringify(newUser))

    logActivity({
      type: "user.created",
      message: `Cuenta creada: ${newUser.name} (${roleDescriptions[role].name})`,
      actor: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    })
  }

  const hasPermission = (module: string, action: "canView" | "canCreate" | "canEdit" | "canDelete" | "canApprove"): boolean => {
    if (!user) return false
    const permissions = rolePermissions[user.role]
    const modulePermission = permissions[module]
    if (!modulePermission) return false
    return modulePermission[action]
  }

  const getModulePermission = (module: string): Permission | null => {
    if (!user) return null
    return rolePermissions[user.role][module] || null
  }

  const updateUserAvatar = (avatar: string) => {
    if (!user) return
    const updatedUser = { ...user, avatar }
    setUser(updatedUser)
    localStorage.setItem("rrhh_user", JSON.stringify(updatedUser))

    // Actualizar en la lista de usuarios (credenciales)
    const savedUsers = localStorage.getItem("rrhh_users_v2")
    const users: User[] = savedUsers ? JSON.parse(savedUsers) : []
    const userIndex = users.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      localStorage.setItem("rrhh_users_v2", JSON.stringify(users))
    }

    // SICRONIZAR CON EMPLEADOS - Para que se refleje en organigrama, lista, etc.
    const savedEmployees = localStorage.getItem("rrhh_employees_v2")
    if (savedEmployees) {
      const employees = JSON.parse(savedEmployees)
      const empIndex = employees.findIndex((e: any) => e.id === user.id)
      if (empIndex !== -1) {
        employees[empIndex].avatar = avatar
        localStorage.setItem("rrhh_employees_v2", JSON.stringify(employees))
        // Emitir evento para que otros contextos se enteren
        window.dispatchEvent(new Event("storage_sync"))
      }
    }

    logActivity({
      type: "profile.updated",
      message: `${updatedUser.name} actualizó su avatar`,
      actor: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
    })
  }

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("rrhh_user", JSON.stringify(updatedUser))

    // Actualizar en la lista de usuarios (credenciales)
    const savedUsers = localStorage.getItem("rrhh_users_v2")
    const users: User[] = savedUsers ? JSON.parse(savedUsers) : []
    const userIndex = users.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      localStorage.setItem("rrhh_users_v2", JSON.stringify(users))
    }

    // SICRONIZAR CON EMPLEADOS - Para que se refleje en organigrama, lista, etc.
    const savedEmployees = localStorage.getItem("rrhh_employees_v2")
    if (savedEmployees) {
      const employees = JSON.parse(savedEmployees)
      const empIndex = employees.findIndex((e: any) => e.id === user.id)
      if (empIndex !== -1) {
        // Mapear campos de User a Employee
        if (updates.name) employees[empIndex].name = updates.name
        if (updates.department) employees[empIndex].department = updates.department
        if (updates.position) employees[empIndex].position = updates.position
        
        localStorage.setItem("rrhh_employees_v2", JSON.stringify(employees))
        // Emitir evento para que otros contextos se enteren
        window.dispatchEvent(new Event("storage_sync"))
      }
    }

    logActivity({
      type: "profile.updated",
      message: `${updatedUser.name} actualizó su perfil`,
      actor: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
    })
  }

  const getAllUsers = (): User[] => {
    const savedUsers = localStorage.getItem("rrhh_users_v2")
    return savedUsers ? JSON.parse(savedUsers) : []
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      createQuickUser,
      hasPermission,
      getModulePermission,
      updateUserAvatar,
      updateUserProfile,
      getAllUsers,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
