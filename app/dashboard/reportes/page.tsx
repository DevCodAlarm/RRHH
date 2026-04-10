"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart3,
  Download,
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  PieChart,
  FileSpreadsheet,
  Printer
} from "lucide-react"

const reportTypes = [
  {
    id: "payroll-summary",
    name: "Resumen de Nomina",
    description: "Vista general de pagos por periodo",
    icon: DollarSign,
    category: "nomina"
  },
  {
    id: "employee-payroll",
    name: "Nomina por Empleado",
    description: "Detalle individual de cada empleado",
    icon: Users,
    category: "nomina"
  },
  {
    id: "deductions",
    name: "Deducciones",
    description: "AFP, SFS, ISR y otras retenciones",
    icon: FileSpreadsheet,
    category: "nomina"
  },
  {
    id: "department-costs",
    name: "Costos por Departamento",
    description: "Gastos de nomina por area",
    icon: PieChart,
    category: "analisis"
  },
  {
    id: "comparison",
    name: "Comparativa Mensual",
    description: "Evolucion mes a mes",
    icon: TrendingUp,
    category: "analisis"
  },
  {
    id: "headcount",
    name: "Headcount",
    description: "Movimientos de personal",
    icon: Users,
    category: "rrhh"
  },
  {
    id: "absences",
    name: "Ausencias",
    description: "Vacaciones, permisos y licencias",
    icon: Calendar,
    category: "rrhh"
  },
  {
    id: "loans",
    name: "Prestamos Activos",
    description: "Estado de prestamos vigentes",
    icon: FileText,
    category: "financiero"
  },
]

const recentReports = [
  {
    id: 1,
    name: "Resumen Nomina Q1 Marzo 2026",
    type: "Nomina",
    generatedAt: "2026-03-28 14:30",
    format: "PDF",
    size: "245 KB"
  },
  {
    id: 2,
    name: "Deducciones Marzo 2026",
    type: "Nomina",
    generatedAt: "2026-03-27 10:15",
    format: "Excel",
    size: "128 KB"
  },
  {
    id: 3,
    name: "Comparativa Q1 2026",
    type: "Analisis",
    generatedAt: "2026-03-25 16:45",
    format: "PDF",
    size: "512 KB"
  },
]

const stats = [
  { label: "Reportes Generados", value: "156", icon: FileText, color: "text-primary" },
  { label: "Este Mes", value: "23", icon: Calendar, color: "text-accent" },
  { label: "Descargas", value: "89", icon: Download, color: "text-chart-3" },
]

export default function ReportesPage() {
  const categories = [
    { id: "nomina", label: "Nomina" },
    { id: "analisis", label: "Analisis" },
    { id: "rrhh", label: "RRHH" },
    { id: "financiero", label: "Financiero" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reportes</h1>
          <p className="text-muted-foreground">Genera y descarga reportes del sistema</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="2026-03">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026-03">Marzo 2026</SelectItem>
              <SelectItem value="2026-02">Febrero 2026</SelectItem>
              <SelectItem value="2026-01">Enero 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Report Types by Category */}
      {categories.map((category) => {
        const categoryReports = reportTypes.filter(r => r.category === category.id)
        if (categoryReports.length === 0) return null
        
        return (
          <Card key={category.id} className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">{category.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categoryReports.map((report) => {
                  const Icon = report.icon
                  return (
                    <div 
                      key={report.id} 
                      className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{report.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 h-8 gap-1">
                          <Download className="h-3 w-3" />
                          PDF
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 h-8 gap-1">
                          <FileSpreadsheet className="h-3 w-3" />
                          Excel
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Recent Reports */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Reportes Recientes</CardTitle>
              <CardDescription>Ultimos reportes generados</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reporte</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Generado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Formato</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{report.name}</p>
                          <p className="text-xs text-muted-foreground">{report.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <Badge variant="secondary">{report.type}</Badge>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell text-muted-foreground">
                      {report.generatedAt}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">{report.format}</Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
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
