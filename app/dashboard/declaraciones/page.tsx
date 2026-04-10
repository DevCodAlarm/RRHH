"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  FileText,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  DollarSign
} from "lucide-react"
import { formatDate, formatNumber } from "@/lib/format"

const declarations = [
  {
    id: 1,
    name: "TSS - Marzo 2026",
    type: "TSS",
    period: "Marzo 2026",
    dueDate: "2026-04-10",
    status: "pending",
    amount: 425488,
    employees: 156,
  },
  {
    id: 2,
    name: "ISR - Q1 2026",
    type: "ISR",
    period: "Enero - Marzo 2026",
    dueDate: "2026-04-15",
    status: "pending",
    amount: 656250,
    employees: 156,
  },
  {
    id: 3,
    name: "TSS - Febrero 2026",
    type: "TSS",
    period: "Febrero 2026",
    dueDate: "2026-03-10",
    status: "completed",
    amount: 418750,
    employees: 154,
  },
  {
    id: 4,
    name: "TSS - Enero 2026",
    type: "TSS",
    period: "Enero 2026",
    dueDate: "2026-02-10",
    status: "completed",
    amount: 412000,
    employees: 152,
  },
]

const upcomingDeadlines = [
  { name: "TSS Marzo", date: "10 Abril", daysLeft: 10 },
  { name: "ISR Q1", date: "15 Abril", daysLeft: 15 },
  { name: "IR-17", date: "20 Abril", daysLeft: 20 },
]

const tssBreakdown = {
  afp: {
    employee: 2.87,
    employer: 7.10,
    total: 9.97,
    amount: 247500,
  },
  sfs: {
    employee: 3.04,
    employer: 7.09,
    total: 10.13,
    amount: 177988,
  },
}

export default function DeclaracionesPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-accent/10 text-accent gap-1"><CheckCircle2 className="h-3 w-3" />Presentada</Badge>
      case "pending":
        return <Badge className="bg-chart-3/10 text-chart-3 gap-1"><Clock className="h-3 w-3" />Pendiente</Badge>
      case "late":
        return <Badge className="bg-destructive/10 text-destructive gap-1"><AlertTriangle className="h-3 w-3" />Atrasada</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Declaraciones</h1>
          <p className="text-muted-foreground">Gestiona tus declaraciones de impuestos y TSS</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Upload className="h-4 w-4" />
            Generar Declaracion
          </Button>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-chart-3" />
            Proximos Vencimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.name} className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{deadline.name}</span>
                  <Badge variant="outline" className="text-chart-3">
                    {deadline.daysLeft} dias
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {deadline.date}
                </div>
                <Progress value={100 - (deadline.daysLeft / 30) * 100} className="h-1.5 mt-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TSS Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">AFP - Fondo de Pensiones</CardTitle>
            <CardDescription>Aportes para el periodo actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-semibold text-foreground">{tssBreakdown.afp.employee}%</p>
                  <p className="text-xs text-muted-foreground">Empleado</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-semibold text-foreground">{tssBreakdown.afp.employer}%</p>
                  <p className="text-xs text-muted-foreground">Empleador</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-2xl font-semibold text-primary">{tssBreakdown.afp.total}%</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monto a Declarar</span>
                  <span className="text-xl font-semibold text-foreground">
                    RD$ {formatNumber(tssBreakdown.afp.amount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">SFS - Seguro Familiar de Salud</CardTitle>
            <CardDescription>Aportes para el periodo actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-semibold text-foreground">{tssBreakdown.sfs.employee}%</p>
                  <p className="text-xs text-muted-foreground">Empleado</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-semibold text-foreground">{tssBreakdown.sfs.employer}%</p>
                  <p className="text-xs text-muted-foreground">Empleador</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10">
                  <p className="text-2xl font-semibold text-accent">{tssBreakdown.sfs.total}%</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monto a Declarar</span>
                  <span className="text-xl font-semibold text-foreground">
                    RD$ {formatNumber(tssBreakdown.sfs.amount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Declarations History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Historial de Declaraciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Declaracion</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Periodo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Vencimiento</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Monto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {declarations.map((declaration) => (
                  <tr key={declaration.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{declaration.name}</p>
                          <p className="text-xs text-muted-foreground">{declaration.employees} empleados</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell text-muted-foreground">
                      {declaration.period}
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell text-muted-foreground">
                      {formatDate(declaration.dueDate)}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-foreground">
                      RD$ {formatNumber(declaration.amount)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(declaration.status)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Download className="h-4 w-4" />
                          Archivo
                        </Button>
                        {declaration.status === "pending" && (
                          <Button size="sm" className="bg-primary text-primary-foreground">
                            Presentar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
