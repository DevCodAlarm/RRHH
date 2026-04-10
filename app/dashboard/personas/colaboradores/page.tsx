"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import {
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  Download,
  Mail,
  Phone,
  Building2,
  Users,
  UserCheck,
  UserX
} from "lucide-react"
import { useEmployees } from "@/lib/employees-context"
import { useAuth } from "@/lib/auth-context"
import AnimatedContent from "@/components/animations/AnimatedContent"
import ScrollFloat from "@/components/animations/ScrollFloat"

export default function ColaboradoresPage() {
  const { employees, createEmployee, updateEmployee, deleteEmployee } = useEmployees()
  const { hasPermission } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string; name: string } | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    salary: "",
  })

  const canCreate = hasPermission("colaboradores", "canCreate")
  const canDelete = hasPermission("colaboradores", "canDelete")

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalEmployees = employees.length
  const activeEmployees = employees.filter((employee) => employee.status === "active").length
  const inactiveEmployees = totalEmployees - activeEmployees
  const departments = new Set(employees.map((employee) => employee.department)).size

  const stats = [
    { label: "Total Empleados", value: String(totalEmployees), icon: Users, color: "text-primary" },
    { label: "Activos", value: String(activeEmployees), icon: UserCheck, color: "text-accent" },
    { label: "Inactivos", value: String(inactiveEmployees), icon: UserX, color: "text-destructive" },
    { label: "Departamentos", value: String(departments), icon: Building2, color: "text-chart-3" },
  ]

  const handleCreateEmployee = (event: FormEvent) => {
    event.preventDefault()
    if (!canCreate) return

    const fullName = `${formData.firstName} ${formData.lastName}`.trim()
    createEmployee({
      name: fullName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      position: formData.position,
      salary: Number(formData.salary),
    })

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      salary: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditClick = (employee: any) => {
    setSelectedEmployee(employee)
    const [firstName = "", ...lastNameParts] = employee.name.split(" ")
    setFormData({
      firstName,
      lastName: lastNameParts.join(" "),
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      position: employee.position,
      salary: String(employee.salary),
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateEmployee = (event: FormEvent) => {
    event.preventDefault()
    if (!selectedEmployee) return

    const fullName = `${formData.firstName} ${formData.lastName}`.trim()
    updateEmployee(selectedEmployee.id, {
      name: fullName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      position: formData.position,
      salary: Number(formData.salary),
    })

    setIsEditDialogOpen(false)
    setSelectedEmployee(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <ScrollFloat textClassName="text-foreground">Colaboradores</ScrollFloat>
          <p className="text-muted-foreground">Gestiona la informacion de tu equipo</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" disabled={!canCreate}>
              <Plus className="h-4 w-4" />
              Nuevo Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={handleCreateEmployee}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" placeholder="Juan" value={formData.firstName} onChange={(event) => setFormData((prev) => ({ ...prev, firstName: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" placeholder="Martinez" value={formData.lastName} onChange={(event) => setFormData((prev) => ({ ...prev, lastName: event.target.value }))} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electronico</Label>
                <Input id="email" type="email" placeholder="juan@empresa.com" value={formData.email} onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input id="phone" placeholder="809-555-0100" value={formData.phone} onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input id="department" placeholder="Tecnologia" value={formData.department} onChange={(event) => setFormData((prev) => ({ ...prev, department: event.target.value }))} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Posicion</Label>
                  <Input id="position" placeholder="Desarrollador" value={formData.position} onChange={(event) => setFormData((prev) => ({ ...prev, position: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salario (RD$)</Label>
                  <Input id="salary" type="number" placeholder="50000" min={1000} value={formData.salary} onChange={(event) => setFormData((prev) => ({ ...prev, salary: event.target.value }))} required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  Guardar Empleado
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <AnimatedContent key={stat.label} distance={35} duration={0.45}>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContent>
          )
        })}
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, departamento o posicion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Lista de Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Empleado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Contacto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Departamento</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Salario</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{employee.avatar}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <Badge variant="secondary" className="font-normal">
                        {employee.department}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <span className="text-foreground font-medium">
                        RD$ {employee.salary.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge 
                        variant={employee.status === "active" ? "default" : "secondary"}
                        className={employee.status === "active" 
                          ? "bg-accent/10 text-accent hover:bg-accent/20" 
                          : "bg-muted text-muted-foreground"
                        }
                      >
                        {employee.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/personas/colaboradores/${employee.id}`)}>
                            Ver Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(employee)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Ver Nomina</DropdownMenuItem>
                          {canDelete && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setEmployeeToDelete({ id: employee.id, name: employee.name })}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmacion obligatoria</AlertDialogTitle>
            <AlertDialogDescription>
              Seguro que quieres eliminar este empleado: {employeeToDelete?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!employeeToDelete) return
                deleteEmployee(employeeToDelete.id)
                setEmployeeToDelete(null)
              }}
            >
              Si, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Colaborador</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 mt-4" onSubmit={handleUpdateEmployee}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">Nombre</Label>
                <Input id="edit-firstName" value={formData.firstName} onChange={(event) => setFormData((prev) => ({ ...prev, firstName: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Apellido</Label>
                <Input id="edit-lastName" value={formData.lastName} onChange={(event) => setFormData((prev) => ({ ...prev, lastName: event.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electronico</Label>
              <Input id="edit-email" type="email" value={formData.email} onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefono</Label>
                <Input id="edit-phone" value={formData.phone} onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Departamento</Label>
                <Input id="edit-department" value={formData.department} onChange={(event) => setFormData((prev) => ({ ...prev, department: event.target.value }))} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-position">Posicion</Label>
                <Input id="edit-position" value={formData.position} onChange={(event) => setFormData((prev) => ({ ...prev, position: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-salary">Salario (RD$)</Label>
                <Input id="edit-salary" type="number" value={formData.salary} onChange={(event) => setFormData((prev) => ({ ...prev, salary: event.target.value }))} required />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
