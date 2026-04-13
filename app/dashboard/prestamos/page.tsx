"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEmployees } from "@/lib/employees-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CheckCircle2, Clock, AlertCircle, TrendingDown } from "lucide-react"

export default function LoansPage() {
  const { user: currentUser } = useAuth()
  const { employees, loans, addLoan } = useEmployees()
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [showDialog, setShowDialog] = useState(false)

  const userLoans = useMemo(() => loans.filter((l) => l.employeeId === currentUser?.id), [loans, currentUser?.id])

  const pendingLoans = userLoans.filter((l) => l.status === "pending")
  const approvedLoans = userLoans.filter((l) => l.status === "approved")
  const activeLoans = userLoans.filter((l) => l.status === "active")
  const completedLoans = userLoans.filter((l) => l.status === "completed")
  const rejectedLoans = userLoans.filter((l) => l.status === "rejected")

  const handleSubmit = () => {
    if (!amount || !currentUser) return

    console.log("[v0] Loan request - CurrentUser:", currentUser.id, currentUser.name, "Amount:", amount)
    console.log("[v0] Available employees:", employees.map(e => ({ id: e.id, name: e.name })))
    
    addLoan({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department || "General",
      requestedAmount: parseFloat(amount),
      interestRate: 0,
      biweeklyInstallments: 0,
      balance: 0,
      biweeklyPayment: 0,
      remainingBiweekly: 0,
      deductionSchedule: {},
      avatar: currentUser.avatar || "",
    })
    
    console.log("[v0] Loan added successfully")

    setAmount("")
    setReason("")
    setShowDialog(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Solicitar Préstamo</h1>
        <p className="text-gray-600 mt-2">
          Solicita un préstamo que será revisado y configurado por el administrador
        </p>
      </div>

      {/* Tarjeta de Solicitud */}
      <Card>
        <CardHeader>
          <CardTitle>Nueva Solicitud de Préstamo</CardTitle>
          <CardDescription>
            El administrador revisará tu solicitud y configurará la tasa de interés y número de cuotas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <div>
              <Label>Monto Solicitado (RD$)</Label>
              <Input
                type="number"
                min="0"
                step="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ej: 5000"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Cantidad que necesitas</p>
            </div>

            <div>
              <Label>Razón (Opcional)</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Emergencia médica, educación"
                className="mt-1"
              />
            </div>

            <Button
              onClick={() => setShowDialog(true)}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full"
            >
              Solicitar Préstamo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Solicitudes */}
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
              <TrendingDown className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold">{activeLoans.length}</div>
              <div className="text-sm text-gray-600">En Descuento</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <div className="text-2xl font-bold">{completedLoans.length}</div>
              <div className="text-sm text-gray-600">Pagados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solicitudes Pendientes */}
      {pendingLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Pendientes</CardTitle>
            <CardDescription>Esperando revisión del administrador</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingLoans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                  <div>
                    <div className="font-semibold">RD$ {loan.requestedAmount?.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">
                      Solicitado el{" "}
                      {new Date(loan.requestedAt).toLocaleDateString("es-DO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <Badge variant="secondary">Pendiente</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Préstamos Aprobados */}
      {approvedLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Préstamos Aprobados</CardTitle>
            <CardDescription>Configuración completada, esperando activación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvedLoans.map((loan) => (
                <div key={loan.id} className="p-4 border rounded-lg bg-blue-50">
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-600">Monto Aprobado</div>
                      <div className="text-lg font-bold text-blue-600">
                        RD$ {loan.balance?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-600">Cuota Quincenal</div>
                      <div className="text-lg font-bold text-blue-600">
                        RD$ {loan.biweeklyPayment?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-600">Interés</div>
                      <div className="text-lg font-bold text-blue-600">{loan.interestRate}%</div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm font-semibold mb-2">Calendario de Descuentos</div>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(loan.deductionSchedule || {}).map(([period, amount]) => (
                        <div key={period} className="p-2 bg-gray-50 rounded text-xs text-center">
                          <div className="font-semibold text-gray-700">{period}</div>
                          <div className="text-blue-600 font-bold">
                            RD$ {amount?.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 mt-3">
                    El administrador activará este préstamo próximamente y los descuentos comenzarán en las fechas indicadas.
                  </div>
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
            <CardTitle>Préstamos en Proceso de Pago</CardTitle>
            <CardDescription>Se descuentan en tu nómina según el calendario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeLoans.map((loan) => (
                <div key={loan.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-semibold">RD$ {loan.balance?.toLocaleString()} pendientes</div>
                      <div className="text-sm text-gray-600">
                        {loan.remainingBiweekly} quincena{loan.remainingBiweekly !== 1 ? "s" : ""} restante
                        {loan.remainingBiweekly !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <Badge>En Descuento</Badge>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-600 mb-1">Progreso de Pago</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${100 - (loan.remainingBiweekly / loan.biweeklyInstallments) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Próximos Descuentos */}
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm font-semibold mb-2">Próximos Descuentos</div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(loan.deductionSchedule || {})
                        .slice(0, 3)
                        .map(([period, amount]) => (
                          <div key={period} className="text-xs">
                            <div className="text-gray-600">{period}</div>
                            <div className="font-bold text-green-600">
                              RD$ {amount?.toLocaleString()}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {loan.payments && loan.payments.length > 0 && (
                    <div className="text-xs text-gray-600 mt-3">
                      Pagos realizados: {loan.payments.length}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Préstamos Completados */}
      {completedLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Préstamos Completados</CardTitle>
            <CardDescription>Préstamos que ya han sido pagados en su totalidad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedLoans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div>
                    <div className="font-semibold">RD$ {loan.requestedAmount?.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">
                      Pagado en{" "}
                      {new Date(loan.approvedAt || new Date()).toLocaleDateString("es-DO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-200 text-green-800">
                    Completado
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Préstamos Rechazados */}
      {rejectedLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Rechazadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rejectedLoans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                  <div>
                    <div className="font-semibold">RD$ {loan.requestedAmount?.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Solicitud rechazada</div>
                  </div>
                  <Badge variant="destructive">Rechazado</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de Confirmación */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Solicitud de Préstamo</AlertDialogTitle>
            <AlertDialogDescription>
              {amount && (
                <div className="space-y-3 mt-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Monto Solicitado</div>
                    <div className="text-2xl font-bold text-blue-600">RD$ {parseFloat(amount).toLocaleString()}</div>
                  </div>
                  <p className="text-sm text-gray-700">
                    Tu solicitud será revisada por el administrador, quien decidirá la tasa de interés y el número de
                    quincenas para el descuento.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="flex-1">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Solicitar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
