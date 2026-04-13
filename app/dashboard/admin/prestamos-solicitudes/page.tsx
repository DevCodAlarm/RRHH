"use client"

import { useState, useMemo } from "react"
import { useEmployees } from "@/lib/employees-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle, Clock, AlertCircle, DollarSign } from "lucide-react"

export default function LoanApprovalsPage() {
  const { loans, approveLoan, updateLoanStatus } = useEmployees()
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)
  const [interestRate, setInterestRate] = useState("0")
  const [biweeklyInstallments, setBiweeklyInstallments] = useState("2")
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)

  const pendingLoans = useMemo(() => loans.filter((l) => l.status === "pending"), [loans])
  const approvedLoans = useMemo(() => loans.filter((l) => l.status === "approved"), [loans])
  const activeLoans = useMemo(() => loans.filter((l) => l.status === "active"), [loans])
  const completedLoans = useMemo(() => loans.filter((l) => l.status === "completed"), [loans])

  const currentLoan = loans.find((l) => l.id === selectedLoan)

  const handleApprove = () => {
    if (!selectedLoan) return
    const interest = parseFloat(interestRate) || 0
    const installments = parseInt(biweeklyInstallments) || 2
    approveLoan(selectedLoan, interest, installments)
    setShowApprovalDialog(false)
    setSelectedLoan(null)
    setInterestRate("0")
    setBiweeklyInstallments("2")
  }

  const handleReject = () => {
    if (!selectedLoan) return
    updateLoanStatus(selectedLoan, "rejected")
    setShowRejectionDialog(false)
    setSelectedLoan(null)
  }

  const handleActivate = (loanId: string) => {
    updateLoanStatus(loanId, "active")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administración de Préstamos</h1>
        <p className="text-gray-600 mt-2">
          Aprueba solicitudes de préstamos y configura las cuotas quincenales
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold">{pendingLoans.length}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{approvedLoans.length}</div>
              <div className="text-sm text-gray-600">Aprobados</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold">{activeLoans.length}</div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <div className="text-2xl font-bold">{completedLoans.length}</div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solicitudes Pendientes */}
      {pendingLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Pendientes</CardTitle>
            <CardDescription>Revisa y aprueba nuevas solicitudes de préstamos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{loan.employeeName}</div>
                    <div className="text-sm text-gray-600">{loan.department}</div>
                    <div className="text-lg font-bold text-blue-600 mt-1">
                      RD$ {loan.requestedAmount?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedLoan(loan.id)
                        setShowApprovalDialog(true)
                      }}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSelectedLoan(loan.id)
                        setShowRejectionDialog(true)
                      }}
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Préstamos Aprobados (Sin Activar) */}
      {approvedLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Préstamos Aprobados (Pendiente Activar)</CardTitle>
            <CardDescription>
              Configuración realizada. Activa para comenzar con los descuentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvedLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-4 border rounded-lg bg-blue-50"
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-semibold">{loan.employeeName}</div>
                      <div className="text-xs text-gray-600">{loan.department}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">RD$ {loan.balance?.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Total a descontar</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b text-sm">
                    <div>
                      <div className="font-semibold">Cuota Quincenal</div>
                      <div className="text-blue-600">RD$ {loan.biweeklyPayment?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Quincenas</div>
                      <div className="text-blue-600">{loan.biweeklyInstallments}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Interés</div>
                      <div className="text-blue-600">{loan.interestRate}%</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Calendario de Descuentos</h4>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {Object.entries(loan.deductionSchedule || {}).map(([period, amount]) => (
                        <div key={period} className="p-2 bg-white rounded border text-xs">
                          <div className="font-semibold">{period}</div>
                          <div className="text-blue-600">RD$ {amount?.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => handleActivate(loan.id)} className="w-full">
                    Activar Préstamo
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Préstamos Activos */}
      {activeLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Préstamos Activos</CardTitle>
            <CardDescription>En proceso de descuento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold">{loan.employeeName}</div>
                      <div className="text-sm text-gray-600">{loan.department}</div>
                    </div>
                    <Badge variant="default">Activo</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-semibold">Balance</div>
                      <div className="text-green-600">RD$ {loan.balance?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Cuota Quincenal</div>
                      <div>RD$ {loan.biweeklyPayment?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Quincenas Restantes</div>
                      <div>{loan.remainingBiweekly}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Pagos Realizados</div>
                      <div>{loan.payments?.length || 0}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de Aprobación */}
      <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Aprobar Préstamo</AlertDialogTitle>
            <AlertDialogDescription>
              Configura las condiciones del préstamo antes de aprobarlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {currentLoan && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded">
                <div className="font-semibold">{currentLoan.employeeName}</div>
                <div className="text-sm text-muted-foreground">
                  Solicita: RD$ {currentLoan.requestedAmount?.toLocaleString()}
                </div>
              </div>

              <div>
                <Label>Tasa de Interés (%)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Número de Quincenas para Descontar</Label>
                <Select value={biweeklyInstallments} onValueChange={setBiweeklyInstallments}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 quincena</SelectItem>
                    <SelectItem value="2">2 quincenas</SelectItem>
                    <SelectItem value="3">3 quincenas</SelectItem>
                    <SelectItem value="4">4 quincenas</SelectItem>
                    <SelectItem value="6">6 quincenas (3 meses)</SelectItem>
                    <SelectItem value="8">8 quincenas (4 meses)</SelectItem>
                    <SelectItem value="12">12 quincenas (6 meses)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted p-3 rounded text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Monto Original:</span>
                  <span className="font-semibold">RD$ {currentLoan.requestedAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Interés ({interestRate}%):</span>
                  <span className="font-semibold text-destructive">
                    RD$ {Math.round((currentLoan.requestedAmount || 0) * (parseFloat(interestRate) / 100)).toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-1 mt-1 flex justify-between">
                  <span>Total a Descontar:</span>
                  <span className="font-bold">
                    RD$ {Math.round((currentLoan.requestedAmount || 0) * (1 + parseFloat(interestRate) / 100)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-blue-600 font-semibold">
                  <span>Cuota Quincenal:</span>
                  <span>
                    RD$ {Math.round(((currentLoan.requestedAmount || 0) * (1 + parseFloat(interestRate) / 100)) / parseInt(biweeklyInstallments)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <AlertDialogCancel className="flex-1">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700">
              Aprobar Préstamo
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Rechazo */}
      <AlertDialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar Préstamo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas rechazar esta solicitud de préstamo? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="flex-1">No, Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="flex-1 bg-red-600 hover:bg-red-700">
              Sí, Rechazar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
