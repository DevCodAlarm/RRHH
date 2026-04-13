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
import { syncEmpleadoDesdeContexto } from "@/lib/nomina"
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
  Download,
  Info,
} from "lucide-react"

const steps = [
  { id: 1, name: "Cargar Novedades", description: "Horas extra, bonos, comisiones", completed: true },
  { id: 2, name: "Calcular Nómina", description: "Aplicar fórmulas y deducciones", completed: true },
  { id: 3, name: "Revisar", description: "Verificar montos y ajustar", completed: false, current: true },
  { id: 4, name: "Aprobar", description: "Confirmación final", completed: false },
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
      if (state) {
        const historial = JSON.parse(localStorage.getItem("nomina_periodos_v2") || "[]")
        const yaProcesado = historial.some((h: any) => h?.periodo?.key === state.periodo?.key)
        setIsPeriodoCompletado(yaProcesado)
      }
    })

    return () => unsub()
  }, [])

  // Sincronizar préstamos y adelantos activos a la nómina antes de calcular
  useEffect(() => {
    if (!employeeDirectory.length || !periodo) return

    employeeDirectory.forEach((emp) => {
      const empLoans = loans.filter(
        (l) => l.employeeId === emp.id && l.status === "active"
      )
      // Obtener el descuento para el período actual
      const totalLoanCuota = empLoans.reduce(
        (acc, l) => acc + (l.deductionSchedule?.[periodo.name] || 0),
        0
      )

      const empAdvances = requests.filter(
        (r) => r.employeeId === emp.id && r.type === "payroll_advance" && r.status === "approved" && r.targetPeriod === periodo.name
      )
      const totalAdvances = empAdvances.reduce((acc, r) => acc + (r.amount || 0), 0)

      syncEmpleadoDesdeContexto({
        id: emp.id,
        name: emp.name,
        salary: emp.salary,
        prestamos: totalLoanCuota,
        anticipos: totalAdvances,
      })
    })

    recalcularNominaActual({ reason: "procesar_page_sync" })
  }, [employeeDirectory, loans, requests, periodo])

  const periodo = useMemo(() => {
    const p = nominaState?.periodo
    if (!p) return null
    return {
      name: p.key,
      startDate: p.inicio,
      endDate: p.fin,
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

  // ── Vista empleado ───────────────────────────────────────────────
  if (user?.role === "empleado") {
    const employee =
      employeeDirectory.find((e) => e.email === user.email) ??
      employeeDirectory.find((e) => e.name === user.name)

    const empResult = empleadosCalculados.find((e) => e.id === employee?.id)
    const empLoans = loans.filter(
      (l) => l.employeeId === employee?.id && l.status === "active"
    )
    const empAdvances = requests.filter(
      (r) => r.employeeId === employee?.id && r.type === "payroll_advance" && r.status === "approved" && r.targetPeriod === periodo?.name
    )
    const totalAdvances = empAdvances.reduce((acc, r) => acc + (r.amount || 0), 0)
    const totalLoanCuota = empLoans.reduce((acc, l) => acc + (l.deductionSchedule?.[periodo?.name || ""] || 0), 0)

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
                      {new Date(periodo.startDate).toLocaleDateString("es-DO")} —{" "}
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
                No se encontró tu perfil de empleado.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="text-xs text-muted-foreground">Quincenal Bruto</div>
                    <div className="mt-1 text-xl font-semibold text-foreground">
                      RD$ {(employee.salary / 2).toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="text-xs text-muted-foreground">Descuentos Nómina</div>
                    <div className="mt-1 text-xl font-semibold text-destructive">
                      -{" "}
                      {empResult
                        ? `RD$ ${empResult.totalDescuentos.toLocaleString()}`
                        : "Pendiente"}
                    </div>
                    {(totalLoanCuota > 0 || totalAdvances > 0) && (
                      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                        {totalLoanCuota > 0 && (
                          <div>Préstamos: RD$ {totalLoanCuota.toLocaleString()}</div>
                        )}
                        {totalAdvances > 0 && (
                          <div>Adelantos: RD$ {totalAdvances.toLocaleString()}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="text-xs text-muted-foreground">Neto Estimado</div>
                    <div className="mt-1 text-xl font-semibold text-accent">
                      {empResult ? `RD$ ${empResult.neto.toLocaleString()}` : "Pendiente"}
                    </div>
                  </div>
                </div>

                {/* Préstamos activos del empleado */}
                {empLoans.length > 0 && totalLoanCuota > 0 && (
                  <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Info className="h-4 w-4 text-primary" />
                      Descuentos por Préstamos Activos (Esta Quincena)
                    </div>
                    {empLoans.map((l) => {
                      const descuento = l.deductionSchedule?.[periodo?.name || ""] || 0
                      return (
                        <div key={l.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Descuento — Saldo pendiente: RD$ {l.balance.toLocaleString()}
                          </span>
                          <span className="font-medium text-foreground">
                            -RD$ {descuento.toLocaleString()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {empAdvances.length > 0 && totalAdvances > 0 && (
                  <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-accent">
                      <CheckCircle2 className="h-4 w-4" />
                      Adelanto de nómina (se descontará esta quincena)
                    </div>
                    {empAdvances.map((r) => (
                      <div key={r.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Adelanto aprobado</span>
                        <span className="font-medium text-foreground">
                          -RD$ {(r.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              Tu rol no puede <span className="text-foreground font-medium">procesar</span> nómina
              general. Contacta a RRHH para más detalles.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Handlers admin/rrhh ──────────────────────────────────────────
  const handleSelectAll = () => {
    if (selectedEmployees.length === empleadosCalculados.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(empleadosCalculados.map((e) => e.id))
    }
  }

  const handleProcess = () => {
    const idsToProcess =
      selectedEmployees.length > 0
        ? selectedEmployees
        : empleadosCalculados.map((e) => e.id)

    if (idsToProcess.length === 0) return

    setIsProcessing(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)

          try {
            const record = procesarNominaPeriodoActual({ selectedEmployees: idsToProcess })
            const periodoKey = record?.periodo?.key

            // Liquidar descuentos: aplicar el descuento del préstamo y marcar adelantos como procesados
            idsToProcess.forEach((empId) => {
              if (periodoKey) {
                settlePayrollDeductions(empId, periodoKey)
              }
            })

            // Re-sincronizar nómina con saldos actualizados
            // (los préstamos saldados ya no generan descuento)
            setTimeout(() => {
              const updatedLoans = JSON.parse(localStorage.getItem("rrhh_prestamos_v2") || "[]")
              const updatedReqs = JSON.parse(localStorage.getItem("rrhh_solicitudes_v2") || "[]")

              employeeDirectory.forEach((emp) => {
                const empLoans = updatedLoans.filter(
                  (l: any) =>
                    l.employeeId === emp.id && l.status === "active"
                )
                // Obtener el descuento para la quincena actual
                const totalLoanCuota = empLoans.reduce(
                  (acc: number, l: any) => acc + (l.deductionSchedule?.[periodoKey] || 0),
                  0
                )
                const empAdvances = updatedReqs.filter(
                  (r: any) =>
                    r.employeeId === emp.id &&
                    r.type === "payroll_advance" &&
                    r.status === "approved" &&
                    r.targetPeriod === periodoKey
                )
                const totalAdvances = empAdvances.reduce(
                  (acc: number, r: any) => acc + (r.amount || 0),
                  0
                )
                syncEmpleadoDesdeContexto({
                  id: emp.id,
                  name: emp.name,
                  salary: emp.salary,
                  prestamos: totalLoanCuota,
                  anticipos: totalAdvances,
                })
              })

              recalcularNominaActual({ reason: "post_process_resync" })
            }, 300)

            setIsPeriodoCompletado(true)

            logGlobalActivity({
              type: "payroll.processed",
              message: `Nómina procesada para ${idsToProcess.length} empleados (${periodo?.name})`,
              actor: {
                id: user?.id,
                name: user?.name,
                email: user?.email,
                role: user?.role,
              },
            })
          } catch (e: any) {
            alert(e?.message || "No se pudo procesar la nómina.")
          }

          return 100
        }
        return prev + 10
      })
    }, 280)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Procesar Nómina</h1>
          <p className="text-muted-foreground">Periodo: {periodo?.name ?? "—"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Calendar className="h-4 w-4" />
            {periodo ? (
              <>
                {new Date(periodo.startDate).toLocaleDateString("es-DO")} —{" "}
                {new Date(periodo.endDate).toLocaleDateString("es-DO")}
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
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed
                        ? "bg-accent text-accent-foreground"
                        : step.current
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        step.current ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground hidden md:block">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 lg:w-24 h-0.5 mx-2 ${
                      step.completed ? "bg-accent" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Empleados", value: empleadosCalculados.length.toString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Salario Bruto", value: formatCompactCurrency(resumen?.totalBruto ?? 0), icon: DollarSign, color: "text-chart-3", bg: "bg-chart-3/10" },
          { label: "Deducciones", value: formatCompactCurrency(resumen?.totalDescuentos ?? 0), icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Neto a Pagar", value: formatCompactCurrency(resumen?.totalNeto ?? 0), icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Procesando nómina y liquidando descuentos...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Los préstamos y adelantos se descuentan automáticamente. Si un préstamo queda en cero,
                la siguiente quincena será normal.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isPeriodoCompletado && (
        <div className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <span>Nómina procesada para este período. </span>
            <span className="font-normal text-muted-foreground">
              Los préstamos y adelantos han sido descontados. La siguiente quincena solo incluirá
              los préstamos con saldo pendiente.
            </span>
          </div>
        </div>
      )}

      {/* Employee List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Detalle por Empleado</CardTitle>
              <CardDescription>
                Selecciona los empleados a procesar. Los descuentos de préstamos y adelantos ya están incluidos.
              </CardDescription>
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
                      checked={
                        selectedEmployees.length === empleadosCalculados.length &&
                        empleadosCalculados.length > 0
                      }
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
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Neto</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {empleadosCalculados.map((employee) => {
                  const hasDeductions =
                    employee.descuentosDetalle.prestamos > 0 ||
                    employee.descuentosDetalle.anticipos > 0

                  return (
                    <tr
                      key={employee.id}
                      className={`border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${
                        hasDeductions ? "bg-chart-3/5" : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        <Checkbox
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEmployees([...selectedEmployees, employee.id])
                            } else {
                              setSelectedEmployees(selectedEmployees.filter((id) => id !== employee.id))
                            }
                          }}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">{employee.nombre}</p>
                          {hasDeductions && (
                            <p className="text-[11px] text-chart-3 font-medium mt-0.5">
                              {employee.descuentosDetalle.prestamos > 0 && `Préstamo: -RD$ ${employee.descuentosDetalle.prestamos.toLocaleString()}`}
                              {employee.descuentosDetalle.prestamos > 0 && employee.descuentosDetalle.anticipos > 0 && " · "}
                              {employee.descuentosDetalle.anticipos > 0 && `Adelanto: -RD$ ${employee.descuentosDetalle.anticipos.toLocaleString()}`}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-foreground">
                        RD$ {employee.bruto.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right hidden lg:table-cell text-destructive">
                        -RD$ {employee.afp.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right hidden lg:table-cell text-destructive">
                        -RD$ {employee.sfs.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right hidden lg:table-cell text-destructive">
                        -RD$ {employee.isr.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right hidden xl:table-cell text-destructive">
                        {employee.descuentosDetalle.prestamos > 0
                          ? `-RD$ ${employee.descuentosDetalle.prestamos.toLocaleString()}`
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-4 px-4 text-right hidden xl:table-cell text-destructive">
                        {employee.descuentosDetalle.anticipos > 0
                          ? `-RD$ ${employee.descuentosDetalle.anticipos.toLocaleString()}`
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-accent">
                        RD$ {employee.neto.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge
                          variant={isPeriodoCompletado ? "default" : "secondary"}
                          className="gap-1"
                        >
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
                  )
                })}
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
          Aprobar Nómina
        </Button>
      </div>

      {/* Resumen Dialog */}
      <Dialog open={isResumenOpen} onOpenChange={setIsResumenOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              Detalle de Nómina ({selectedEmployees.length ? "selección" : "todos"}) —{" "}
              {periodo?.name ?? "—"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Empleados", value: empleadosParaResumen.length.toString() },
              { label: "Total Bruto", value: `RD$ ${resumenSeleccion.totalBruto.toLocaleString()}` },
              { label: "Total Descuentos", value: `RD$ ${resumenSeleccion.totalDescuentos.toLocaleString()}` },
              { label: "Total Neto", value: `RD$ ${resumenSeleccion.totalNeto.toLocaleString()}` },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-background p-3">
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="mt-1 text-lg font-semibold text-foreground">{item.value}</div>
              </div>
            ))}
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
                    <td className="py-3 px-4 text-right text-destructive">
                      {e.descuentosDetalle.prestamos > 0
                        ? `-RD$ ${e.descuentosDetalle.prestamos.toLocaleString()}`
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-destructive">
                      {e.descuentosDetalle.anticipos > 0
                        ? `-RD$ ${e.descuentosDetalle.anticipos.toLocaleString()}`
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-accent">
                      RD$ {e.neto.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      RD$ {e.costoEmpresa.toLocaleString()}
                    </td>
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
