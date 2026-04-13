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
import { Clock, CheckCircle2, AlertCircle } from "lucide-react"

// Obtener la siguiente quincena
function getNextBiweekly(): string {
  const today = new Date()
  const day = today.getDate()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const year = today.getFullYear()

  if (day < 15) {
    return `${year}-${month}-Q2`
  } else {
    const nextMonth = today.getMonth() === 11 ? "01" : String(today.getMonth() + 2).padStart(2, "0")
    const nextYear = today.getMonth() === 11 ? year + 1 : year
    return `${nextYear}-${nextMonth}-Q1`
  }
}

export default function AdelantosPage() {
  const { user: currentUser } = useAuth()
  const { employees, requests, addRequest } = useEmployees()
  const [amount, setAmount] = useState("")
  const [showDialog, setShowDialog] = useState(false)

  const currentEmployee = employees.find((e) => e.id === currentUser?.id)
  const userRequests = useMemo(
    () => requests.filter((r) => r.employeeId === currentUser?.id && r.type === "payroll_advance"),
    [requests, currentUser?.id]
  )

  const pendingRequests = userRequests.filter((r) => r.status === "pending")
  const approvedRequests = userRequests.filter((r) => r.status === "approved")
  const processedRequests = userRequests.filter((r) => r.status === "processed")

  const nextBiweekly = getNextBiweekly()
  const quinzenalBruto = (currentEmployee?.salary || 0) / 2

  const handleSubmit = () => {
    if (!amount || !currentEmployee) return

    addRequest({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      type: "payroll_advance",
      title: "Adelanto de Nómina",
      description: `Solicitud de adelanto de RD$ ${parseFloat(amount).toLocaleString()} para la quincena ${nextBiweekly}`,
      startDate: new Date().toISOString(),
      endDate: null,
      days: null,
      amount: parseFloat(amount),
      avatar: currentEmployee.avatar || "",
      targetPeriod: nextBiweekly,
    })

    setAmount("")
    setShowDialog(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Solicitar Adelanto de Nómina</h1>
        <p className="text-gray-600 mt-2">
          Solicita un adelanto que se descontará automáticamente en la próxima quincena
        </p>
      </div>

      {/* Tarjeta de Solicitud */}
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Adelanto</CardTitle>
          <CardDescription>
            Se descontará automáticamente de tu nómina de {nextBiweekly}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600">Quincenal Bruto</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                RD$ {quinzenalBruto.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Próxima quincena a descontar: <strong>{nextBiweekly}</strong>
              </div>
            </div>

            <div>
              <Label>Monto del Adelanto (RD$)</Label>
              <Input
                type="number"
                min="0"
                step="100"
                max={quinzenalBruto}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ej: 2000"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Máximo permitido: RD$ {quinzenalBruto.toLocaleString()}
              </p>
            </div>

            {amount && (
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Adelanto:</span>
                    <span className="font-semibold">RD$ {parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Se descontará en:</span>
                    <span className="font-semibold text-blue-600">{nextBiweekly}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Neto estimado:</span>
                    <span className="font-semibold">
                      RD$ {(quinzenalBruto - parseFloat(amount)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => setShowDialog(true)}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > quinzenalBruto}
              className="w-full"
            >
              Solicitar Adelanto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{approvedRequests.length}</div>
              <div className="text-sm text-gray-600">Aprobados</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold">{processedRequests.length}</div>
              <div className="text-sm text-gray-600">Procesados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solicitudes Pendientes */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Pendientes</CardTitle>
            <CardDescription>Esperando revisión</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                  <div>
                    <div className="font-semibold">RD$ {req.amount?.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Quincena destino: {req.targetPeriod || "—"}</div>
                  </div>
                  <Badge variant="secondary">Pendiente</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adelantos Aprobados */}
      {approvedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Adelantos Aprobados</CardTitle>
            <CardDescription>Se descontarán en la quincena indicada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvedRequests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-blue-600">RD$ {req.amount?.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Quincena: {req.targetPeriod}</div>
                    </div>
                    <Badge className="bg-blue-600">Aprobado</Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    Se descontará automáticamente en tu nómina del {req.targetPeriod}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adelantos Procesados */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Adelantos Descontados</CardTitle>
            <CardDescription>Ya fueron aplicados a tu nómina</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div>
                    <div className="font-semibold">RD$ {req.amount?.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Descontado en: {req.targetPeriod}</div>
                  </div>
                  <Badge variant="secondary" className="bg-green-200 text-green-800">
                    Procesado
                  </Badge>
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
            <AlertDialogTitle>Confirmar Solicitud de Adelanto</AlertDialogTitle>
            <AlertDialogDescription>
              {amount && (
                <div className="space-y-3 mt-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Monto</div>
                    <div className="text-2xl font-bold text-blue-600">RD$ {parseFloat(amount).toLocaleString()}</div>
                  </div>
                  <p className="text-sm text-gray-700">
                    Este adelanto se descontará automáticamente de tu nómina de <strong>{nextBiweekly}</strong>. No
                    podrás recibir la nómina completa hasta que este adelanto sea descontado.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="flex-1">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Confirmar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
