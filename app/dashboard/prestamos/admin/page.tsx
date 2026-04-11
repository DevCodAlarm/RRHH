"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEmployees } from "@/lib/employees-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, DollarSign, CheckCircle2, XCircle } from "lucide-react"
import { logActivity as logGlobalActivity } from "@/lib/activity-log"

interface Loan {
  id: string
  userId: string
  amount: number
  requestedDate: string
  approvalDate?: string
  status: "pending" | "approved" | "rejected"
  interestRate: number
  installments: number
  paymentFrequency: "quincenal" | "mensual"
  remainingAmount: number
  paidAmount: number
}

const LOANS_KEY = "rrhh_loans_admin"

function getLoans(): Loan[] {
  try {
    return JSON.parse(localStorage.getItem(LOANS_KEY) || "[]")
  } catch {
    return []
  }
}

function saveLoans(loans: Loan[]) {
  localStorage.setItem(LOANS_KEY, JSON.stringify(loans))
}

export default function LoansAdminPage() {
  const { user } = useAuth()
  const { employees } = useEmployees()
  const [loans, setLoans] = useState<Loan[]>([])
  
  useEffect(() => {
    setLoans(getLoans())
  }, [])
  const [formData, setFormData] = useState({
    userId: "",
    amount: "",
    interestRate: "",
    installments: "",
    paymentFrequency: "quincenal" as "quincenal" | "mensual",
  })

  // Verificar que el usuario sea admin
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8">
          <p className="text-destructive">No tienes permiso para acceder a esta página</p>
        </Card>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newLoan: Loan = {
      id: `loan_${Date.now()}`,
      userId: formData.userId,
      amount: parseFloat(formData.amount),
      requestedDate: new Date().toISOString(),
      status: "pending",
      interestRate: parseFloat(formData.interestRate),
      installments: parseInt(formData.installments),
      paymentFrequency: formData.paymentFrequency,
      remainingAmount: parseFloat(formData.amount),
      paidAmount: 0,
    }

    const updated = [...loans, newLoan]
    setLoans(updated)
    saveLoans(updated)

    logGlobalActivity({
      type: "loan.created",
      message: `Préstamo creado para empleado ${formData.userId}: RD$ ${formData.amount}`,
      actor: { id: user?.id, name: user?.name, email: user?.email, role: user?.role },
    })

    setFormData({
      userId: "",
      amount: "",
      interestRate: "",
      installments: "",
      paymentFrequency: "quincenal",
    })
  }

  const handleApproveLoan = (loanId: string) => {
    const updated = loans.map(loan =>
      loan.id === loanId
        ? { ...loan, status: "approved", approvalDate: new Date().toISOString() }
        : loan
    )
    setLoans(updated)
    saveLoans(updated)

    logGlobalActivity({
      type: "loan.approved",
      message: `Préstamo aprobado: RD$ ${loans.find(l => l.id === loanId)?.amount}`,
      actor: { id: user?.id, name: user?.name, email: user?.email, role: user?.role },
    })
  }

  const handleRejectLoan = (loanId: string) => {
    const updated = loans.map(loan =>
      loan.id === loanId ? { ...loan, status: "rejected" } : loan
    )
    setLoans(updated)
    saveLoans(updated)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "paid": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazado",
      paid: "Pagado",
    }
    return labels[status] || status
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Préstamos</h1>
        <p className="text-muted-foreground mt-2">Crear, aprobar y gestionar préstamos de empleados</p>
      </div>

      {/* Crear Préstamo */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Préstamo
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Préstamo</DialogTitle>
            <DialogDescription>
              Ingresa los detalles del préstamo para el empleado
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="userId">Empleado</Label>
              <Input
                id="userId"
                placeholder="ID del empleado"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="amount">Monto (RD$)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Ej: 5000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rate">Tasa Interés (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  placeholder="Ej: 5"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="installments">Cuotas</Label>
                <Input
                  id="installments"
                  type="number"
                  placeholder="Ej: 2"
                  value={formData.installments}
                  onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="frequency">Frecuencia de Pago</Label>
              <Select
                value={formData.paymentFrequency}
                onValueChange={(value) => setFormData({ ...formData, paymentFrequency: value as "quincenal" | "mensual" })}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quincenal">Quincenal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Crear Préstamo</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tabla de Préstamos */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Interés</TableHead>
                <TableHead>Cuotas</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No hay préstamos registrados
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.userId}</TableCell>
                    <TableCell>RD$ {loan.amount.toLocaleString()}</TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell>{loan.installments}</TableCell>
                    <TableCell className="capitalize">{loan.paymentFrequency}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(loan.status)}>
                        {getStatusLabel(loan.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {loan.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveLoan(loan.id)}
                            className="gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectLoan(loan.id)}
                            className="gap-1 text-destructive"
                          >
                            <XCircle className="h-3 w-3" />
                            Rechazar
                          </Button>
                        </>
                      )}
                    </TableCell>
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
