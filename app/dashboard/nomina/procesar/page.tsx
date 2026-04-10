"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { useEmployees } from "@/lib/employees-context"
import { logActivity as logGlobalActivity } from "@/lib/activity-log"
import {
  syncEmpleadoDesdeContexto
} from "@/lib/nomina"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCompactCurrency } from "@/lib/format"
import {
  getNominaActual,
  initNominaStorage,
  onNominaUpdated,
  procesarNominaPeriodoActual,
  recalcularNominaActual,
} from "@/lib/nomina"
import {
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  FileText,
  Download
} from "lucide-react"

const steps = [
  { id: 1, name: "Cargar Novedades", description: "Horas extra, bonos, comisiones", completed: true },
  { id: 2, name: "Calcular Nomina", description: "Aplicar formulas y deducciones", completed: true },
  { id: 3, name: "Revisar", description: "Verificar montos y ajustar", completed: false, current: true },
  { id: 4, name: "Aprobar", description: "Confirmacion final", completed: false },
  { id: 5, name: "Exportar", description: "Generar archivos de pago", completed: false },
]

export default function ProcesarPage() {
  const { user } = useAuth()
  const { employees: employeeDirectory, loans, requests, settlePayrollDeductions } = useEmployees()
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [nominaState, setNominaState] = useState(() => getNominaActual())
  const [isResumenOpen, setIsResumenOpen] = useState(false)
  const [isPeriodoCompletado, setIsPeriodoCompletado] = useState(false)

  useEffect(() => {
    initNominaStorage()
    setNominaState(getNominaActual())

    const unsub = onNominaUpdated(() => {
      const state = getNominaActual()
      setNominaState(state)
      // Verificar si ya existe en el historial
      if (state) {
        const historial = JSON.parse(localStorage.getItem("rrhh_nomina_historial") || "[]")
        const yaProcesado = historial.some((h: any) => h.periodoId === state.periodo?.key)
        setIsPeriodoCompletado(yaProcesado)
      }
    })

    // Sincronizar activos de RRHH (Préstamos y Adelantos) antes de calcular
    employeeDirectory.forEach(emp => {
      const empLoans = loans.filter(l => l.employeeId === emp.id && l.status === "active")
      const totalLoanCuota = empLoans.reduce((acc, l) => acc + l.monthlyPayment, 0)
      
      const empAdvances = requests.filter(r => r.employeeId === emp.id && r.type === "payroll_advance" && r.status === "approved")
      const totalAdvances = empAdvances.reduce((acc, r) => acc + (r.amount || 0), 0)

      syncEmpleadoDesdeContexto({
        id: emp.id,
        name: emp.name,
        salary: emp.salary,
        prestamos: totalLoanCuota,
        anticipos: totalAdvances
      })
    })

    // Asegura que esté calculado al entrar con los datos frescos
    recalcularNominaActual({ reason: "procesar_page_mount" })

    return () => unsub()
  }, [employeeDirectory, loans, requests])

  const periodo = useMemo(() => {
    const p = nominaState?.periodo
    if (!p) return null
    return {
      name: p.key,
      startDate: p.inicio,
      endDate: p.fin,
      status: "ready",
    }
  }, [nominaState])

  const empleadosCalculados = nominaState?.resultado?.empleados ?? []
  const resumen = nominaState?.resultado?.resumen ?? null

  const empleadosParaResumen = useMemo(() => {
    if (selectedEmployees.length === 0) return empleadosCalculados
    return empleadosCalculados.filter((e) => selectedEmployees.includes(e.id))
  }, [empleadosCalculados, selectedEmployees])

  const resumenSeleccion = useMemo(() => {
    return empleadosParaResumen.reduce(
      (acc, e) => {
        acc.totalBruto += e.bruto || 0
        acc.totalDescuentos += e.totalDescuentos || 0
        acc.totalNeto += e.neto || 0
        acc.totalCostoEmpresa += e.costoEmpresa || 0
        return acc
      },
      { totalBruto: 0, totalDescuentos: 0, totalNeto: 0, totalCostoEmpresa: 0 }
    )
  }, [empleadosParaResumen])

  if (user?.role === "empleado") {
    const employee = employeeDirectory.find((e) => e.email === user.email) ?? employeeDirectory.find((e) => e.name === user.name)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mi Nómina</h1>
          <p className="text-muted-foreground">Detalle personal del período actual</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{periodo?.name ?? "Período actual"}</CardTitle>
                <CardDescription>
                  {periodo ? (
                    <>
                      {new Date(periodo.startDate).toLocaleDateString("es-DO")} -{" "}
                      {new Date(periodo.endDate).toLocaleDateString("es-DO")}
                    </>
                  ) : (
                    "—"
                  )}
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-2 py-1.5">
                <Calendar className="h-4 w-4" />
                Personal
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!employee ? (
              <div className="text-sm text-muted-foreground">
                No encontramos tu perfil de empleado para mostrar tu nómina.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Salario base</div>
                  <div className="mt-1 text-xl font-semibold text-foreground">RD$ {employee.salary.toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Deducciones</div>
                  <div className="mt-1 text-xl font-semibold text-foreground">—</div>
                  <div className="text-xs text-muted-foreground">Visible al procesar (admin/rrhh)</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Neto</div>
                  <div className="mt-1 text-xl font-semibold text-foreground">—</div>
                  <div className="text-xs text-muted-foreground">Visible al procesar (admin/rrhh)</div>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              Tu rol no puede <span className="text-foreground font-medium">procesar</span> nómina general ni ver listados completos.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSelectAll = () => {
    if (selectedEmployees.length === empleadosCalculados.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(empleadosCalculados.map(e => e.id))
    }
  }

  const handleProcess = () => {
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          try {
            procesarNominaPeriodoActual({ selectedEmployees })
            
            // Liquidar deducciones en RRHH
            selectedEmployees.forEach(empId => {
              const result = empleadosCalculados.find(e => e.id === empId)
              if (result) {
                settlePayrollDeductions(empId, {
                  loan: result.descuentosDetalle.prestamos,
                  advance: result.descuentosDetalle.anticipos
                })

                // Re-sincronizar para limpiar los inputs de la nómina para el futuro
                const updatedEmp = employeeDirectory.find(e => e.id === empId)
                if (updatedEmp) {
                  // Obtenemos préstamos actualizados del contexto (esto es un poco complejo en el mismo render, 
                  // pero el syncEmpleadoDesdeContexto lo hará en el siguiente paso o via storage)
                }
              }
            })

            setIsPeriodoCompletado(true)

            logGlobalActivity({
              type: "payroll.processed",
              message: `Nómina procesada para ${selectedEmployees.length} empleados (${periodo?.name})`,
              actor: { id: user?.id, name: user?.name, email: user?.email, role: user?.role }
            })
          } catch (e: any) {
            alert(e?.message || "No se pudo procesar la nómina.")
          }
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Procesar Nomina</h1>
          <p className="text-muted-foreground">Periodo: {periodo?.name ?? "—"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Calendar className="h-4 w-4" />
            {periodo ? (
              <>
                {new Date(periodo.startDate).toLocaleDateString('es-DO')} - {new Date(periodo.endDate).toLocaleDateString('es-DO')}
              </>
            ) : (
              "—"
            )}
          </Badge>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-accent text-accent-foreground' 
                      : step.current 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-muted-foreground'
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${step.current ? 'text-primary' : 'text-foreground'}`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground hidden md:block">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 lg:w-24 h-0.5 mx-2 ${
                    step.completed ? 'bg-accent' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{empleadosCalculados.length}</p>
                <p className="text-xs text-muted-foreground">Empleados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-3/10 text-chart-3">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCompactCurrency(resumen?.totalBruto ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Salario Bruto</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCompactCurrency(resumen?.totalDescuentos ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Deducciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCompactCurrency(resumen?.totalNeto ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Neto a Pagar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Procesando nomina...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Detalle por Empleado</CardTitle>
              <CardDescription>Selecciona los empleados a procesar</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsResumenOpen(true)}
                disabled={empleadosCalculados.length === 0}
              >
                <FileText className="h-4 w-4" />
                Ver Resumen
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={handleProcess}
                disabled={isProcessing || empleadosCalculados.length === 0}
              >
                <Play className="h-4 w-4" />
                Procesar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">
                    <Checkbox 
                      checked={selectedEmployees.length === empleadosCalculados.length && empleadosCalculados.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Empleado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Bruto</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">AFP</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">SFS</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">ISR</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden xl:table-cell">Préstamos</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden xl:table-cell">Adelantos</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Otros desc.</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Neto</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {empleadosCalculados.map((employee) => (
                  <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4">
                      <Checkbox 
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEmployees([...selectedEmployees, employee.id])
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id))
                          }
                        }}
                      />
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground">{employee.nombre}</td>
                    <td className="py-4 px-4 text-right text-foreground">RD$ {employee.bruto.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right hidden lg:table-cell text-destructive">-RD$ {employee.afp.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right hidden lg:table-cell text-destructive">-RD$ {employee.sfs.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right hidden lg:table-cell text-destructive">-RD$ {employee.isr.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right hidden xl:table-cell text-destructive">-RD$ {employee.descuentosDetalle.prestamos.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right hidden xl:table-cell text-destructive">-RD$ {employee.descuentosDetalle.anticipos.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right hidden lg:table-cell text-destructive">-RD$ {employee.otrosDescuentos.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-medium text-accent">RD$ {employee.neto.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant={isPeriodoCompletado ? "default" : "secondary"} className="gap-1">
                        {isPeriodoCompletado ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Procesado
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            Pendiente
                          </>
                        )}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Borrador
        </Button>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Aprobar Nomina
        </Button>
      </div>

      <Dialog open={isResumenOpen} onOpenChange={setIsResumenOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              Detalle de Nómina ({selectedEmployees.length ? "selección" : "general"}) — {periodo?.name ?? "—"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs text-muted-foreground">Empleados</div>
              <div className="mt-1 text-lg font-semibold text-foreground">{empleadosParaResumen.length}</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs text-muted-foreground">Total Bruto</div>
              <div className="mt-1 text-lg font-semibold text-foreground">RD$ {resumenSeleccion.totalBruto.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs text-muted-foreground">Total Descuentos</div>
              <div className="mt-1 text-lg font-semibold text-foreground">RD$ {resumenSeleccion.totalDescuentos.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs text-muted-foreground">Total Neto</div>
              <div className="mt-1 text-lg font-semibold text-foreground">RD$ {resumenSeleccion.totalNeto.toLocaleString()}</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Empleado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Bruto</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">AFP</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">SFS</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">ISR</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Préstamos</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Adelantos</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Otros desc.</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Neto</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Costo Empresa</th>
                </tr>
              </thead>
              <tbody>
                {empleadosParaResumen.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{e.nombre}</td>
                    <td className="py-3 px-4 text-right text-foreground">RD$ {e.bruto.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-destructive">-RD$ {e.afp.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-destructive">-RD$ {e.sfs.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-destructive">-RD$ {e.isr.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-destructive">-RD$ {e.descuentosDetalle.prestamos.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-destructive">-RD$ {e.descuentosDetalle.anticipos.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-destructive">-RD$ {e.otrosDescuentos.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-medium text-accent">RD$ {e.neto.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-foreground">RD$ {e.costoEmpresa.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
