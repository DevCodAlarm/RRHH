"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useEmployees } from "@/lib/employees-context"
import { getPeriodosProcesados, initNominaStorage, onNominaUpdated } from "@/lib/nomina"
import {
  Search,
  Download,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter
} from "lucide-react"

export default function HistorialPage() {
  const { user } = useAuth()
  const { employees } = useEmployees()
  const [hist, setHist] = useState(() => getPeriodosProcesados())

  useEffect(() => {
    initNominaStorage()
    setHist(getPeriodosProcesados())
    const unsub = onNominaUpdated(() => setHist(getPeriodosProcesados()))
    return () => unsub()
  }, [])

  const yearSummary = useMemo(() => {
    if (hist.length === 0) {
      return { totalPaid: 0, totalDeductions: 0, avgPerPeriod: 0, growth: 0 }
    }
    const totalPaid = hist.reduce((acc, r) => acc + (r.resultado?.resumen?.totalNeto ?? 0), 0)
    const totalDeductions = hist.reduce((acc, r) => acc + (r.resultado?.resumen?.totalDescuentos ?? 0), 0)
    const avgPerPeriod = totalPaid / hist.length
    // crecimiento simple: compara último vs anterior si existe
    const growth =
      hist.length >= 2 && (hist[1].resultado?.resumen?.totalNeto ?? 0) > 0
        ? (((hist[0].resultado?.resumen?.totalNeto ?? 0) - (hist[1].resultado?.resumen?.totalNeto ?? 0)) /
            (hist[1].resultado?.resumen?.totalNeto ?? 1)) *
          100
        : 0
    return { totalPaid, totalDeductions, avgPerPeriod, growth }
  }, [hist])

  if (user?.role === "empleado") {
    const employee = employees.find((e) => e.email === user.email) ?? employees.find((e) => e.name === user.name)

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Mi Historial de Nómina</h1>
            <p className="text-muted-foreground">Solo tus pagos y recibos</p>
          </div>
          <Button variant="outline" className="gap-2" disabled>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            {!employee ? (
              <div className="text-sm text-muted-foreground">
                No encontramos tu perfil de empleado para mostrar tu historial.
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                <div>
                  <div className="text-sm font-medium text-foreground">{employee.name}</div>
                  <div className="text-xs text-muted-foreground">{employee.department} · {employee.position}</div>
                </div>
                <Badge variant="outline">Empleado</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recibos recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              Los recibos personales se habilitan cuando el admin procese períodos (historial global).
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              En tu rol no se muestran totales globales ni datos de otros empleados.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Historial de Nomina</h1>
          <p className="text-muted-foreground">Registro completo de pagos realizados</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Historial
        </Button>
      </div>

      {/* Year Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">RD$ {(yearSummary.totalPaid / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-muted-foreground">Total Pagado 2026</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">RD$ {(yearSummary.totalDeductions / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-muted-foreground">Total Deducciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-3/10 text-chart-3">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">RD$ {(yearSummary.avgPerPeriod / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-muted-foreground">Promedio/Periodo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{yearSummary.growth >= 0 ? "+" : ""}{yearSummary.growth.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Crecimiento YTD</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por periodo..."
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                2026
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Pagos Realizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Periodo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Fecha</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Empleados</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Bruto</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Deducciones</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Neto</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Var.</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {hist.map((record, idx) => {
                  const prev = hist[idx + 1]
                  const net = record.resultado?.resumen?.totalNeto ?? 0
                  const prevNet = prev?.resultado?.resumen?.totalNeto ?? 0
                  const change = prevNet > 0 ? ((net - prevNet) / prevNet) * 100 : 0
                  const bruto = record.resultado?.resumen?.totalBruto ?? 0
                  const desc = record.resultado?.resumen?.totalDescuentos ?? 0
                  const empleadosCount = record.resultado?.empleados?.length ?? 0

                  return (
                  <tr key={record.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <FileText className="h-4 w-4 text-accent" />
                        </div>
                        <span className="font-medium text-foreground">{record.periodo.key}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell text-muted-foreground">
                      {new Date(record.processedAt).toLocaleDateString('es-DO')}
                    </td>
                    <td className="py-4 px-4 text-right hidden lg:table-cell text-foreground">
                      {empleadosCount}
                    </td>
                    <td className="py-4 px-4 text-right text-foreground">
                      RD$ {bruto.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right hidden lg:table-cell text-destructive">
                      -RD$ {desc.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-accent">
                      RD$ {net.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right hidden md:table-cell">
                      <span className={`flex items-center justify-end gap-1 ${change >= 0 ? 'text-accent' : 'text-destructive'}`}>
                        {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(change).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
            {hist.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">Aún no hay períodos procesados. Ve a “Procesar Nómina” y presiona “Procesar”.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
