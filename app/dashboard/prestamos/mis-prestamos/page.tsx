"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, CreditCard, DollarSign, Calendar, CheckCircle2, Clock } from "lucide-react"

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
  deductions?: Array<{ id: string; payrollPeriod: string; amount: number; appliedPayroll: boolean }>
}

interface Advance {
  id: string
  userId: string
  amount: number
  requestedDate: string
  status: "pending" | "approved" | "rejected"
  appliedToPayroll?: string
}

const LOANS_KEY = "rrhh_loans_admin"
const ADVANCES_KEY = "rrhh_advances"

function getLoans(): Loan[] {
  try {
    return JSON.parse(localStorage.getItem(LOANS_KEY) || "[]")
  } catch {
    return []
  }
}

function getAdvances(): Advance[] {
  try {
    return JSON.parse(localStorage.getItem(ADVANCES_KEY) || "[]")
  } catch {
    return []
  }
}

export default function MisPrestamosPagr() {
  const { user } = useAuth()
  const [loans, setLoans] = useState<Loan[]>([])
  const [advances, setAdvances] = useState<Advance[]>([])
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)

  useEffect(() => {
    setLoans(getLoans())
    setAdvances(getAdvances())
  }, [])

  if (!user) {
    return <div className="text-center py-8">No autenticado</div>
  }

  const myLoans = loans.filter(l => l.userId === user.id)
  const myAdvances = advances.filter(a => a.userId === user.id)

  const activeLoan = myLoans.find(l => l.status === "approved" && l.remainingAmount > 0)
  const totalDebt = myLoans.reduce((sum, loan) => sum + loan.remainingAmount, 0)
  const paidAmount = myLoans.reduce((sum, loan) => sum + loan.paidAmount, 0)

  // Generar cronograma de pagos
  const paymentSchedule = activeLoan
    ? activeLoan.deductions.map((ded) => ({
        period: ded.payrollPeriod,
        amount: ded.amount,
        applied: ded.appliedPayroll,
      }))
    : []

  const chartData = [
    { name: "Original", monto: activeLoan?.amount || 0 },
    { name: "Pagado", monto: activeLoan?.paidAmount || 0 },
    { name: "Pendiente", monto: activeLoan?.remainingAmount || 0 },
  ]

  return (
    <main className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-accent" />
            Mis Préstamos
          </h1>
          <p className="text-muted-foreground mt-2">Gestiona tus préstamos y adelantos</p>
        </div>
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Solicitar Préstamo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Préstamo</DialogTitle>
              <DialogDescription>
                Completa el formulario para solicitar un préstamo. El administrador lo revisará y configurará los términos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Forma simplificada de solicitud. El administrador configurará automáticamente:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Tasa de interés según políticas</li>
                <li>Número de cuotas disponibles</li>
                <li>Descuentos automáticos de nómina</li>
              </ul>
              <Button className="w-full" onClick={() => setIsRequestDialogOpen(false)}>
                Ir a Solicitudes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Deuda Total</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                RD$ {totalDebt.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary opacity-20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pagado</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                RD$ {paidAmount.toLocaleString()}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Préstamos Activos</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {myLoans.filter(l => l.status === "approved").length}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-accent opacity-20" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Préstamos Activos</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="advances">Adelantos</TabsTrigger>
        </TabsList>

        {/* Préstamos Activos */}
        <TabsContent value="active">
          <Card>
            {myLoans.filter(l => l.status === "approved").length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No tienes préstamos activos
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {myLoans.filter(l => l.status === "approved").map((loan) => (
                  <div key={loan.id} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Préstamo #{loan.id.slice(-4)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Solicitado: {new Date(loan.requestedDate).toLocaleDateString("es-DO")}
                        </p>
                      </div>
                      <Badge>
                        {loan.interestRate}% interés
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Monto Original</p>
                        <p className="font-semibold text-foreground">RD$ {loan.amount.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Pagado</p>
                        <p className="font-semibold text-green-600">RD$ {loan.paidAmount.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Pendiente</p>
                        <p className="font-semibold text-destructive">RD$ {loan.remainingAmount.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Cuotas</p>
                        <p className="font-semibold text-foreground">
                          {loan.deductions.filter(d => d.appliedPayroll).length}/{loan.installments}
                        </p>
                      </div>
                    </div>

                    {/* Cronograma */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Cronograma de Pagos</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2">Período</th>
                              <th className="text-right py-2">Cuota</th>
                              <th className="text-center py-2">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loan.deductions.map((ded) => (
                              <tr key={ded.id} className="border-b border-border last:border-0">
                                <td className="py-2">{ded.payrollPeriod}</td>
                                <td className="text-right">RD$ {ded.amount.toLocaleString()}</td>
                                <td className="text-center">
                                  {ded.appliedPayroll ? (
                                    <Badge className="bg-green-100 text-green-800">Pagado</Badge>
                                  ) : (
                                    <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Historial */}
        <TabsContent value="history">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Interés</TableHead>
                    <TableHead>Cuotas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLoans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Sin historial de préstamos
                      </TableCell>
                    </TableRow>
                  ) : (
                    myLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-mono text-sm">#{loan.id.slice(-4)}</TableCell>
                        <TableCell>RD$ {loan.amount.toLocaleString()}</TableCell>
                        <TableCell>{loan.interestRate}%</TableCell>
                        <TableCell>{loan.installments}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              loan.status === "approved"
                                ? "bg-blue-100 text-blue-800"
                                : loan.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {loan.status === "approved" ? "Activo" : loan.status === "paid" ? "Pagado" : "Pendiente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(loan.requestedDate).toLocaleDateString("es-DO")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Adelantos */}
        <TabsContent value="advances">
          <Card>
            <div className="p-6">
              {myAdvances.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No tienes adelantos registrados
                </div>
              ) : (
                <div className="space-y-4">
                  {myAdvances.map((advance) => (
                    <div key={advance.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">Adelanto RD$ {advance.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          Solicitado: {new Date(advance.requestedDate).toLocaleDateString("es-DO")}
                        </p>
                      </div>
                      <Badge
                        className={
                          advance.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {advance.status === "approved" ? "Aprobado" : "Pendiente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
