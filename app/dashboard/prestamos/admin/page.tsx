"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEmployees } from "@/lib/employees-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  DollarSign,
  Percent,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  calculateLoanWithInterest,
  createPaymentPlan,
  savePaymentPlan,
  saveInterestRate,
  getInterestRate,
  getLoanStatus,
} from "@/lib/loan-management"
import { logAction } from "@/lib/audit-log"

export default function PrestamosAdminPage() {
  const { user } = useAuth()
  const { loans, updateLoanStatus, employees } = useEmployees()
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)
  const [interestRate, setInterestRate] = useState("15")
  const [installments, setInstallments] = useState("2") // Quincenas
  const [showDialog, setShowDialog] = useState(false)
  
  // Filter pending loans
  const pendingLoans = loans.filter(l => l.status === "pending")
  const activeLoans = loans.filter(l => l.status === "active")
  const completedLoans = loans.filter(l => l.status === "completed")

  const handleApproveLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId)
    if (!loan) return

    const rate = parseFloat(interestRate) || 0
    const quincenas = parseInt(installments) || 2

    // Calcular monto final con interés
    const months = Math.ceil(quincenas / 2)
    const calculation = calculateLoanWithInterest(loan.amount, rate, months)

    // Guardar tasa de interés
    saveInterestRate(loanId, rate)

    // Crear plan de pago quincenales
    const plan = createPaymentPlan(loanId, loan.employeeId, calculation.total, quincenas)
    savePaymentPlan(plan)

    // Actualizar estado del préstamo
    updateLoanStatus(loanId, "active")

    // Log de auditoría
    if (user) {
      logAction(
        user.id,
        `Aprobó préstamo de RD$ ${loan.amount.toLocaleString()}`,
        "approve",
        "loan",
        loanId,
        [
          { field: "status", oldValue: "pending", newValue: "active" },
          { field: "interestRate", oldValue: 0, newValue: rate },
          { field: "installments", oldValue: 0, newValue: quincenas },
        ],
        { reason: `Tasa: ${rate}%, Cuotas: ${quincenas} quincenas` }
      )
    }

    setShowDialog(false)
    setSelectedLoan(null)
  }

  const handleRejectLoan = (loanId: string) => {
    updateLoanStatus(loanId, "rejected")
    if (user) {
      logAction(user.id, "Rechazó solicitud de préstamo", "reject", "loan", loanId)
    }
  }

  const currentLoan = selectedLoan ? loans.find(l => l.id === selectedLoan) : null
  const months = Math.ceil(parseInt(installments) / 2) || 1
  const loanCalc = currentLoan ? calculateLoanWithInterest(currentLoan.amount, parseFloat(interestRate), months) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Gestión de Préstamos (Admin)</h1>
        <p className="text-muted-foreground">Configurar tasas de interés y planes de pago</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Solicitudes Pendientes</p>
              <p className="text-3xl font-bold text-foreground">{pendingLoans.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Préstamos Activos</p>
              <p className="text-3xl font-bold text-foreground">{activeLoans.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completados</p>
              <p className="text-3xl font-bold text-foreground">{completedLoans.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solicitudes Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Pendientes de Aprobación</CardTitle>
          <CardDescription>Configura interés y plan de pago para cada solicitud</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingLoans.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No hay solicitudes pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLoans.map(loan => (
                <Dialog key={loan.id} open={selectedLoan === loan.id && showDialog} onOpenChange={(open) => {
                  if (!open) setSelectedLoan(null)
                  setShowDialog(open)
                }}>
                  <DialogTrigger asChild>
                    <div
                      onClick={() => setSelectedLoan(loan.id)}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{loan.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{loan.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">RD$ {loan.amount.toLocaleString()}</p>
                        <Badge className="mt-1 bg-amber-100 text-amber-800">Pendiente</Badge>
                      </div>
                    </div>
                  </DialogTrigger>

                  {currentLoan && (
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Aprobar Préstamo</DialogTitle>
                        <DialogDescription>
                          Configura la tasa de interés y plan de pago para {currentLoan.employeeName}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Monto Original */}
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Monto Solicitado</p>
                          <p className="text-2xl font-bold text-foreground">
                            RD$ {currentLoan.amount.toLocaleString()}
                          </p>
                        </div>

                        {/* Tasa de Interés */}
                        <div className="space-y-2">
                          <Label htmlFor="rate">Tasa de Interés Anual (%)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="rate"
                              type="number"
                              value={interestRate}
                              onChange={(e) => setInterestRate(e.target.value)}
                              placeholder="15"
                              step="0.5"
                              min="0"
                              max="100"
                            />
                            <Percent className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Plan de Pago */}
                        <div className="space-y-2">
                          <Label htmlFor="installments">Plan de Pago (Quincenas)</Label>
                          <Select value={installments} onValueChange={setInstallments}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 quincenas (1 mes)</SelectItem>
                              <SelectItem value="4">4 quincenas (2 meses)</SelectItem>
                              <SelectItem value="6">6 quincenas (3 meses)</SelectItem>
                              <SelectItem value="8">8 quincenas (4 meses)</SelectItem>
                              <SelectItem value="12">12 quincenas (6 meses)</SelectItem>
                              <SelectItem value="24">24 quincenas (12 meses)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Cálculo */}
                        {loanCalc && (
                          <div className="space-y-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Principal</span>
                              <span className="font-medium">RD$ {loanCalc.principal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Interés Total</span>
                              <span className="font-medium">RD$ {loanCalc.interestAmount.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-primary/20 pt-2 mt-2 flex justify-between">
                              <span className="font-semibold">Total a Pagar</span>
                              <span className="font-bold text-lg">RD$ {loanCalc.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2">
                              <span className="text-muted-foreground">Por Quincena</span>
                              <span className="font-medium">RD$ {(loanCalc.total / parseInt(installments)).toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              handleRejectLoan(currentLoan.id)
                              setShowDialog(false)
                              setSelectedLoan(null)
                            }}
                          >
                            Rechazar
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => handleApproveLoan(currentLoan.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Aprobar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Préstamos Activos */}
      <Card>
        <CardHeader>
          <CardTitle>Préstamos Activos</CardTitle>
          <CardDescription>Préstamos aprobados en proceso de pago</CardDescription>
        </CardHeader>
        <CardContent>
          {activeLoans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay préstamos activos
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Interés</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeLoans.map(loan => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{loan.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{loan.department}</p>
                        </div>
                      </TableCell>
                      <TableCell>RD$ {loan.amount.toLocaleString()}</TableCell>
                      <TableCell>{getInterestRate(loan.id).toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled>Ver Detalles</DropdownMenuItem>
                            <DropdownMenuItem disabled>Modificar Interés</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
