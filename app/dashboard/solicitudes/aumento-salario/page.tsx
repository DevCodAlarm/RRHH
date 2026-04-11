"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEmployees } from "@/lib/employees-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, CheckCircle2, XCircle, Clock } from "lucide-react"
import { logActivity as logGlobalActivity } from "@/lib/activity-log"

interface SalaryRequest {
  id: string
  userId: string
  type: "salary_increase"
  status: "pending" | "approved" | "rejected"
  createdAt: string
  details: {
    currentSalary: number
    requestedSalary: number
    justification: string
    employeeName?: string
  }
}

const SALARY_REQUESTS_KEY = "rrhh_salary_requests"

function getSalaryRequests(): SalaryRequest[] {
  try {
    return JSON.parse(localStorage.getItem(SALARY_REQUESTS_KEY) || "[]")
  } catch {
    return []
  }
}

function saveSalaryRequests(requests: SalaryRequest[]) {
  localStorage.setItem(SALARY_REQUESTS_KEY, JSON.stringify(requests))
}

export default function SalaryIncreaseRequestsPage() {
  const { user } = useAuth()
  const { employees: employeeDirectory, updateEmployee } = useEmployees()
  const [requests, setRequests] = useState<SalaryRequest[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    currentSalary: "",
    requestedSalary: "",
    justification: "",
  })

  // Cargar solicitudes del localStorage
  useEffect(() => {
    setRequests(getSalaryRequests())
  }, [])

  const userRequests = user?.role === "empleado" 
    ? requests.filter(r => r.userId === user.id)
    : requests

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const newRequest: SalaryRequest = {
      id: `sreq_${Date.now()}`,
      userId: user.id,
      type: "salary_increase",
      status: "pending",
      createdAt: new Date().toISOString(),
      details: {
        currentSalary: parseFloat(formData.currentSalary),
        requestedSalary: parseFloat(formData.requestedSalary),
        justification: formData.justification,
        employeeName: user.name,
      },
    }

    const updated = [...requests, newRequest]
    setRequests(updated)
    saveSalaryRequests(updated)

    logGlobalActivity({
      type: "request.created",
      message: `${user.name} solicitó aumento de RD$ ${formData.currentSalary} a RD$ ${formData.requestedSalary}`,
      actor: { id: user.id, name: user.name, email: user.email, role: user.role },
    })

    setFormData({
      currentSalary: "",
      requestedSalary: "",
      justification: "",
    })
    setIsDialogOpen(false)
  }

  const handleApprove = (requestId: string) => {
    const request = requests.find(r => r.id === requestId)
    if (!request) return

    const updated = requests.map(r =>
      r.id === requestId ? { ...r, status: "approved" as const } : r
    )
    setRequests(updated)
    saveSalaryRequests(updated)

    // Actualizar salario del empleado
    const employee = employeeDirectory.find(e => e.id === request.userId)
    if (employee) {
      updateEmployee(request.userId, {
        ...employee,
        salary: request.details.requestedSalary,
      })
    }

    logGlobalActivity({
      type: "request.approved",
      message: `Aumento de salario aprobado para ${request.details.employeeName}`,
      actor: { id: user?.id, name: user?.name, email: user?.email, role: user?.role },
    })
  }

  const handleReject = (requestId: string) => {
    const updated = requests.map(r =>
      r.id === requestId ? { ...r, status: "rejected" as const } : r
    )
    setRequests(updated)
    saveSalaryRequests(updated)

    logGlobalActivity({
      type: "request.rejected",
      message: `Aumento de salario rechazado`,
      actor: { id: user?.id, name: user?.name, email: user?.email, role: user?.role },
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 gap-1"><Clock className="h-3 w-3" />Pendiente</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800 gap-1"><CheckCircle2 className="h-3 w-3" />Aprobada</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 gap-1"><XCircle className="h-3 w-3" />Rechazada</Badge>
      default:
        return null
    }
  }

  const isEmployee = user?.role === "empleado"

  return (
    <main className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-accent" />
            Solicitudes de Aumento de Nómina
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEmployee ? "Solicita un aumento de salario" : "Administra solicitudes de aumento"}
          </p>
        </div>
        {isEmployee && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Solicitud
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar Aumento de Nómina</DialogTitle>
                <DialogDescription>
                  Proporciona los detalles de tu solicitud de aumento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="current">Salario Actual (RD$)</Label>
                  <Input
                    id="current"
                    type="number"
                    placeholder="0.00"
                    value={formData.currentSalary}
                    onChange={(e) => setFormData({ ...formData, currentSalary: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="requested">Salario Solicitado (RD$)</Label>
                  <Input
                    id="requested"
                    type="number"
                    placeholder="0.00"
                    value={formData.requestedSalary}
                    onChange={(e) => setFormData({ ...formData, requestedSalary: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="justification">Justificación</Label>
                  <Textarea
                    id="justification"
                    placeholder="Explica el motivo de tu solicitud..."
                    value={formData.justification}
                    onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Enviar Solicitud
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-foreground">
            {userRequests.filter(r => r.status === "pending").length}
          </div>
          <p className="text-sm text-muted-foreground">Pendientes</p>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {userRequests.filter(r => r.status === "approved").length}
          </div>
          <p className="text-sm text-muted-foreground">Aprobadas</p>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">
            {userRequests.filter(r => r.status === "rejected").length}
          </div>
          <p className="text-sm text-muted-foreground">Rechazadas</p>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Salario Actual</TableHead>
                <TableHead>Solicitado</TableHead>
                <TableHead>Incremento</TableHead>
                <TableHead>Justificación</TableHead>
                <TableHead>Estado</TableHead>
                {!isEmployee && <TableHead>Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isEmployee ? 6 : 7} className="text-center text-muted-foreground py-8">
                    No hay solicitudes de aumento
                  </TableCell>
                </TableRow>
              ) : (
                userRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.details.employeeName || "—"}</TableCell>
                    <TableCell>RD$ {request.details.currentSalary?.toLocaleString()}</TableCell>
                    <TableCell>RD$ {request.details.requestedSalary?.toLocaleString()}</TableCell>
                    <TableCell>
                      {request.details.requestedSalary && request.details.currentSalary 
                        ? `RD$ ${(request.details.requestedSalary - request.details.currentSalary).toLocaleString()}`
                        : "—"
                      }
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                      {request.details.justification}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    {!isEmployee && request.status === "pending" && (
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                          className="text-destructive"
                        >
                          Rechazar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Aprobar
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </main>
  )
}
