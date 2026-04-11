"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEmployees } from "@/lib/employees-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Send,
  Eye,
  ThumbsUp,
  ThumbsDown,
  User,
  FileText,
  DollarSign,
} from "lucide-react"
import { logActivity as logGlobalActivity } from "@/lib/activity-log"
import { logAction } from "@/lib/audit-log"
import { getNominaActual } from "@/lib/nomina"

export default function AprobacionesPage() {
  const { user } = useAuth()
  const { employees } = useEmployees()
  const [nominaState, setNominaState] = useState(null)
  const [payrollHistory, setPayrollHistory] = useState<any[]>([])
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")

  useEffect(() => {
    // Cargar nómina actual
    const current = getNominaActual()
    setNominaState(current)

    // Cargar historial
    const history = JSON.parse(localStorage.getItem("rrhh_nomina_historial") || "[]")
    setPayrollHistory(history)
  }, [])

  const pendingApprovals = payrollHistory.filter(p => p.status === "pending_approval")
  const approvedPayrolls = payrollHistory.filter(p => p.status === "approved")
  const rejectedPayrolls = payrollHistory.filter(p => p.status === "rejected")

  const handleApprovePayroll = (payrollId: string) => {
    if (!user) return

    // Actualizar estado
    setPayrollHistory(prev => prev.map(p => 
      p.id === payrollId ? { ...p, status: "approved", approvedBy: user.id, approvedAt: new Date().toISOString() } : p
    ))

    // Log de auditoría
    logAction(
      user.id,
      `Aprobó nómina ${payrollId}`,
      "approve",
      "payroll",
      payrollId,
      [{ field: "status", oldValue: "pending_approval", newValue: "approved" }],
      { notes: approvalNotes }
    )

    logGlobalActivity({
      type: "payroll.approved",
      message: `Nómina aprobada (${payrollId})`,
      actor: { id: user.id, name: user.name, email: user.email, role: user.role }
    })

    setSelectedPayroll(null)
    setApprovalNotes("")
    setShowDetails(false)
  }

  const handleRejectPayroll = (payrollId: string) => {
    if (!user) return

    setPayrollHistory(prev => prev.map(p => 
      p.id === payrollId ? { ...p, status: "rejected", rejectedBy: user.id, rejectedAt: new Date().toISOString() } : p
    ))

    logAction(
      user.id,
      `Rechazó nómina ${payrollId}`,
      "reject",
      "payroll",
      payrollId,
      [{ field: "status", oldValue: "pending_approval", newValue: "rejected" }],
      { notes: approvalNotes }
    )

    logGlobalActivity({
      type: "payroll.rejected",
      message: `Nómina rechazada (${payrollId}) - ${approvalNotes}`,
      actor: { id: user.id, name: user.name, email: user.email, role: user.role }
    })

    setSelectedPayroll(null)
    setApprovalNotes("")
    setShowDetails(false)
  }

  if (user?.role === "empleado") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Aprobaciones de Nómina</h1>
          <p className="text-muted-foreground">Este módulo está disponible solo para administradores</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No tienes acceso a este módulo</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Flujo de Aprobación de Nómina</h1>
        <p className="text-muted-foreground">Revisar, aprobar o rechazar nóminas procesadas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pendientes
              </p>
              <p className="text-3xl font-bold text-foreground">{pendingApprovals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Aprobadas
              </p>
              <p className="text-3xl font-bold text-foreground">{approvedPayrolls.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Rechazadas
              </p>
              <p className="text-3xl font-bold text-foreground">{rejectedPayrolls.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pendientes <Badge className="ml-2" variant="outline">{pendingApprovals.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprobadas <Badge className="ml-2" variant="outline">{approvedPayrolls.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rechazadas <Badge className="ml-2" variant="outline">{rejectedPayrolls.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Pendientes */}
        <TabsContent value="pending" className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No hay nóminas pendientes de aprobación</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map(payroll => (
                <Dialog key={payroll.id} open={selectedPayroll?.id === payroll.id && showDetails} onOpenChange={(open) => {
                  if (!open) {
                    setSelectedPayroll(null)
                    setShowDetails(false)
                  }
                }}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => {
                      setSelectedPayroll(payroll)
                    }}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{payroll.period}</p>
                            <p className="text-sm text-muted-foreground">{payroll.employeeCount} empleados • RD$ {payroll.totalBruto?.toLocaleString() || 0}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Pendiente
                            </Badge>
                            <Eye className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>

                  {selectedPayroll && (
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Revisar Nómina</DialogTitle>
                        <DialogDescription>
                          {selectedPayroll.period} • {selectedPayroll.employeeCount} empleados
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Resumen */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg bg-secondary/50 p-3">
                            <p className="text-xs text-muted-foreground">Salario Bruto Total</p>
                            <p className="text-2xl font-bold text-foreground">
                              RD$ {selectedPayroll.totalBruto?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div className="rounded-lg bg-secondary/50 p-3">
                            <p className="text-xs text-muted-foreground">Deducciones</p>
                            <p className="text-2xl font-bold text-destructive">
                              RD$ {selectedPayroll.totalDeductions?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div className="rounded-lg bg-secondary/50 p-3">
                            <p className="text-xs text-muted-foreground">Neto Total</p>
                            <p className="text-2xl font-bold text-accent">
                              RD$ {selectedPayroll.totalNeto?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div className="rounded-lg bg-secondary/50 p-3">
                            <p className="text-xs text-muted-foreground">Costo Empresa</p>
                            <p className="text-2xl font-bold text-foreground">
                              RD$ {selectedPayroll.totalCostoEmpresa?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>

                        {/* Tabla de empleados */}
                        {selectedPayroll.employees && selectedPayroll.employees.length > 0 && (
                          <div className="rounded-lg border border-border overflow-hidden">
                            <Table className="text-sm">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Empleado</TableHead>
                                  <TableHead className="text-right">Bruto</TableHead>
                                  <TableHead className="text-right">Desc.</TableHead>
                                  <TableHead className="text-right">Neto</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedPayroll.employees.slice(0, 5).map((emp: any) => (
                                  <TableRow key={emp.id}>
                                    <TableCell>{emp.name}</TableCell>
                                    <TableCell className="text-right">{emp.bruto?.toLocaleString() || 0}</TableCell>
                                    <TableCell className="text-right text-destructive">{emp.totalDescuentos?.toLocaleString() || 0}</TableCell>
                                    <TableCell className="text-right font-medium">{emp.neto?.toLocaleString() || 0}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            {selectedPayroll.employees.length > 5 && (
                              <div className="p-2 text-center text-xs text-muted-foreground border-t">
                                +{selectedPayroll.employees.length - 5} empleados más
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notas */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Notas de Aprobación/Rechazo</label>
                          <textarea
                            value={approvalNotes}
                            onChange={(e) => setApprovalNotes(e.target.value)}
                            placeholder="Añade observaciones si es necesario..."
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder-muted-foreground"
                            rows={3}
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              handleRejectPayroll(selectedPayroll.id)
                            }}
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => {
                              handleApprovePayroll(selectedPayroll.id)
                            }}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
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
        </TabsContent>

        {/* Aprobadas */}
        <TabsContent value="approved" className="space-y-4">
          {approvedPayrolls.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  No hay nóminas aprobadas aún
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {approvedPayrolls.map(payroll => (
                <Card key={payroll.id} className="hover:bg-secondary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{payroll.period}</p>
                        <p className="text-sm text-muted-foreground">
                          {payroll.employeeCount} empleados • Aprobado {new Date(payroll.approvedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Aprobada
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Rechazadas */}
        <TabsContent value="rejected" className="space-y-4">
          {rejectedPayrolls.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  No hay nóminas rechazadas
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rejectedPayrolls.map(payroll => (
                <Card key={payroll.id} className="border-destructive/50 hover:bg-destructive/5 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{payroll.period}</p>
                        <p className="text-sm text-muted-foreground">
                          {payroll.employeeCount} empleados • Rechazada {new Date(payroll.rejectedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="destructive">Rechazada</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
