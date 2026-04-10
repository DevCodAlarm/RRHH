"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useEmployees } from "@/lib/employees-context"
import { getNominaActual, getPeriodosProcesados, initNominaStorage, onNominaUpdated, setPeriodoActual } from "@/lib/nomina"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal
} from "lucide-react"
import { formatCompactCurrency, formatDateRange, formatNumber } from "@/lib/format"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function PeriodosPage() {
  const { user } = useAuth()
  const { employees } = useEmployees()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetalleOpen, setIsDetalleOpen] = useState(false)
  const [detalleId, setDetalleId] = useState<string | null>(null)
  const [hist, setHist] = useState(() => getPeriodosProcesados())
  const [current, setCurrent] = useState(() => getNominaActual())
  const [periodName, setPeriodName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    initNominaStorage()
    setHist(getPeriodosProcesados())
    setCurrent(getNominaActual())
    const unsub = onNominaUpdated(() => {
      setHist(getPeriodosProcesados())
      setCurrent(getNominaActual())
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!isAddDialogOpen) return
    const p = getNominaActual()?.periodo
    setPeriodName(p?.key ?? "")
    setStartDate(p?.inicio ?? "")
    setEndDate(p?.fin ?? "")
  }, [isAddDialogOpen])

  const periods = useMemo(() => {
    return hist.map((r) => ({
      id: r.id,
      name: r.periodo.key,
      startDate: r.periodo.inicio,
      endDate: r.periodo.fin,
      status: "completed",
      employees: r.resultado?.empleados?.length ?? 0,
      grossTotal: r.resultado?.resumen?.totalBruto ?? 0,
      netTotal: r.resultado?.resumen?.totalNeto ?? 0,
    }))
  }, [hist])

  const detalleRecord = useMemo(() => {
    if (!detalleId) return null
    return hist.find((h) => h.id === detalleId) ?? null
  }, [detalleId, hist])

  const stats = useMemo(() => {
    const periodoActual = current?.periodo?.key ?? "—"
    const empleadosCount = current?.resultado?.empleados?.length ?? 0
    const bruto = current?.resultado?.resumen?.totalBruto ?? 0
    const periodosYear = hist.length
    return [
      { label: "Periodo Actual", value: periodoActual, icon: Calendar, color: "text-primary" },
      { label: "Empleados", value: String(empleadosCount), icon: Users, color: "text-accent" },
      { label: "Total Bruto", value: formatCompactCurrency(bruto), icon: DollarSign, color: "text-chart-3" },
      { label: "Periodos", value: String(periodosYear), icon: CheckCircle2, color: "text-chart-1" },
    ]
  }, [current, hist.length])

  if (user?.role === "empleado") {
    const employee = employees.find((e) => e.email === user.email) ?? employees.find((e) => e.name === user.name)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mi Nómina</h1>
          <p className="text-muted-foreground">Acceso solo a tus datos personales</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!employee ? (
              <div className="text-sm text-muted-foreground">
                No encontramos tu perfil de empleado para mostrar tu nómina.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Empleado</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{employee.name}</div>
                  <div className="text-xs text-muted-foreground">{employee.department} · {employee.position}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Salario base</div>
                  <div className="mt-1 text-xl font-semibold text-foreground">RD$ {employee.salary.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Monto referencial (según registro)</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Períodos recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {periods.slice(0, 3).map((period) => (
                <div key={period.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">{period.name}</div>
                    <div className="text-xs text-muted-foreground">{formatDateRange(period.startDate, period.endDate)}</div>
                  </div>
                  {getStatusBadge(period.status)}
                </div>
              ))}
              {periods.length === 0 && (
                <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                  Aún no hay períodos procesados.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-accent/10 text-accent gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completado
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-chart-3/10 text-chart-3 gap-1">
            <Clock className="h-3 w-3" />
            En Proceso
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-muted text-muted-foreground gap-1">
            <AlertCircle className="h-3 w-3" />
            Pendiente
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Periodos de Nomina</h1>
          <p className="text-muted-foreground">Administra los periodos de pago</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Periodo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Periodo</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4 mt-4"
              onSubmit={(e) => {
                e.preventDefault()
                const key = periodName.trim()
                if (!key) return alert("El nombre del período es obligatorio.")
                if (!startDate) return alert("La fecha de inicio es obligatoria.")
                if (!endDate) return alert("La fecha de fin es obligatoria.")
                if (new Date(startDate) > new Date(endDate)) return alert("La fecha inicio no puede ser mayor que la fecha fin.")

                try {
                  setPeriodoActual({ key, inicio: startDate, fin: endDate })
                  setIsAddDialogOpen(false)
                } catch (err: any) {
                  alert(err?.message || "No se pudo guardar el período.")
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="periodName">Nombre del Periodo</Label>
                <Input
                  id="periodName"
                  placeholder="Q1 Abril 2026"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  Crear Periodo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
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

      {/* Periods List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Historial de Periodos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Periodo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Fechas</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Empleados</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total Bruto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Total Neto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{period.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell text-muted-foreground">
                      {formatDateRange(period.startDate, period.endDate)}
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell text-foreground">
                      {period.employees}
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground">
                      RD$ {formatNumber(period.grossTotal)}
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell text-accent font-medium">
                      RD$ {formatNumber(period.netTotal)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(period.status)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setDetalleId(period.id)
                              setIsDetalleOpen(true)
                            }}
                          >
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem>Procesar</DropdownMenuItem>
                          <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
                          <DropdownMenuItem>Exportar Excel</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {periods.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">Aún no hay períodos procesados. Ve a “Procesar Nómina” y presiona “Procesar”.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isDetalleOpen}
        onOpenChange={(open) => {
          setIsDetalleOpen(open)
          if (!open) setDetalleId(null)
        }}
      >
        <DialogContent className="sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Detalle Nómina — {detalleRecord?.periodo.key ?? "—"}</DialogTitle>
          </DialogHeader>

          {!detalleRecord ? (
            <div className="text-sm text-muted-foreground">No se encontró la nómina.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Empleados</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{detalleRecord.resultado.empleados.length}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Total Bruto</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">RD$ {detalleRecord.resultado.resumen.totalBruto.toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Total Descuentos</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">RD$ {detalleRecord.resultado.resumen.totalDescuentos.toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Total Neto</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">RD$ {detalleRecord.resultado.resumen.totalNeto.toLocaleString()}</div>
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
                    {detalleRecord.resultado.empleados.map((e) => (
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
