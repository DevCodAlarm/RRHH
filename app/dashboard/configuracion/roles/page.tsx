"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Shield,
  Users,
  Edit,
  Trash2,
  CheckCircle2,
  Settings,
  Eye,
  FileText,
  DollarSign,
  UserCheck
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const roles = [
  {
    id: 1,
    name: "Administrador",
    description: "Acceso completo al sistema",
    users: 3,
    color: "bg-primary",
    permissions: {
      dashboard: { view: true, edit: true },
      employees: { view: true, edit: true, delete: true },
      payroll: { view: true, process: true, approve: true },
      loans: { view: true, create: true, approve: true },
      requests: { view: true, approve: true },
      reports: { view: true, export: true },
      settings: { view: true, edit: true },
    }
  },
  {
    id: 2,
    name: "Recursos Humanos",
    description: "Gestion de personal y nomina",
    users: 5,
    color: "bg-accent",
    permissions: {
      dashboard: { view: true, edit: false },
      employees: { view: true, edit: true, delete: false },
      payroll: { view: true, process: true, approve: false },
      loans: { view: true, create: true, approve: false },
      requests: { view: true, approve: true },
      reports: { view: true, export: true },
      settings: { view: false, edit: false },
    }
  },
  {
    id: 3,
    name: "Supervisor",
    description: "Aprobaciones y reportes de equipo",
    users: 12,
    color: "bg-chart-3",
    permissions: {
      dashboard: { view: true, edit: false },
      employees: { view: true, edit: false, delete: false },
      payroll: { view: true, process: false, approve: false },
      loans: { view: true, create: false, approve: false },
      requests: { view: true, approve: true },
      reports: { view: true, export: false },
      settings: { view: false, edit: false },
    }
  },
  {
    id: 4,
    name: "Empleado",
    description: "Acceso basico al sistema",
    users: 140,
    color: "bg-muted",
    permissions: {
      dashboard: { view: true, edit: false },
      employees: { view: false, edit: false, delete: false },
      payroll: { view: false, process: false, approve: false },
      loans: { view: true, create: false, approve: false },
      requests: { view: true, approve: false },
      reports: { view: false, export: false },
      settings: { view: false, edit: false },
    }
  },
]

// Ya no se usa la constante estática de usuarios

const modules = [
  { id: "dashboard", name: "Dashboard", icon: Settings },
  { id: "employees", name: "Empleados", icon: Users },
  { id: "payroll", name: "Nomina", icon: DollarSign },
  { id: "loans", name: "Prestamos", icon: FileText },
  { id: "requests", name: "Solicitudes", icon: UserCheck },
  { id: "reports", name: "Reportes", icon: FileText },
  { id: "settings", name: "Configuracion", icon: Settings },
]

export default function RolesPage() {
  const { getAllUsers } = useAuth()
  const users = getAllUsers()
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<typeof roles[0] | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Roles y Permisos</h1>
          <p className="text-muted-foreground">Administra los niveles de acceso al sistema</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Agregar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar Usuario</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Nombre Completo</Label>
                  <Input id="userName" placeholder="Juan Perez" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Correo Electronico</Label>
                  <Input id="userEmail" type="email" placeholder="juan@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <div className="space-y-2">
                    {roles.map(role => (
                      <label key={role.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer">
                        <input type="radio" name="role" value={role.id} className="sr-only" />
                        <div className={`w-3 h-3 rounded-full ${role.color}`} />
                        <div>
                          <p className="font-medium text-foreground">{role.name}</p>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground">
                    Agregar Usuario
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Rol
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Rol</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Nombre del Rol</Label>
                  <Input id="roleName" placeholder="Nombre del rol" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleDesc">Descripcion</Label>
                  <Input id="roleDesc" placeholder="Breve descripcion" />
                </div>
                <div className="space-y-3">
                  <Label>Permisos</Label>
                  {modules.map(module => {
                    const Icon = module.icon
                    return (
                      <div key={module.id} className="p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{module.name}</span>
                        </div>
                        <div className="flex gap-4 ml-7">
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox />
                            <span className="text-muted-foreground">Ver</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox />
                            <span className="text-muted-foreground">Editar</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox />
                            <span className="text-muted-foreground">Eliminar</span>
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground">
                    Crear Rol
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => (
          <Card 
            key={role.id} 
            className={`bg-card border-border cursor-pointer transition-all ${selectedRole?.id === role.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedRole(role)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${role.color}`}>
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  {role.users}
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-foreground">{role.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Role Permissions */}
      {selectedRole && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedRole.color}`} />
                  Permisos de {selectedRole.name}
                </CardTitle>
                <CardDescription>{selectedRole.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Modulo</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Ver</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Editar</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Aprobar</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module) => {
                    const Icon = module.icon
                    const perms = selectedRole.permissions[module.id as keyof typeof selectedRole.permissions] || {}
                    return (
                      <tr key={module.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{module.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {('view' in perms && perms.view) ? (
                            <CheckCircle2 className="h-5 w-5 text-accent mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {('edit' in perms && perms.edit) || ('process' in perms && perms.process) || ('create' in perms && perms.create) ? (
                            <CheckCircle2 className="h-5 w-5 text-accent mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {('approve' in perms && perms.approve) || ('delete' in perms && perms.delete) ? (
                            <CheckCircle2 className="h-5 w-5 text-accent mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Usuarios del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuario</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rol</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const role = roles.find(r => r.name === user.role)
                  return (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">{user.avatar}</span>
                          </div>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell text-muted-foreground">{user.email}</td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className="gap-1">
                          <div className={`w-2 h-2 rounded-full ${role?.color || 'bg-muted'}`} />
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={user.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}>
                          {user.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
