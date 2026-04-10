"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ZoomIn, ZoomOut } from "lucide-react"

import { useEmployees } from "@/lib/employees-context"

interface OrgNode {
  id: string
  name: string
  position: string
  department: string
  avatar: string
  children?: OrgNode[]
}

const departmentColors: Record<string, string> = {
  "Dirección General": "bg-chart-1",
  "Recursos Humanos": "bg-chart-2",
  "Tecnología": "bg-primary",
  "Operaciones": "bg-chart-3",
  "Contabilidad": "bg-chart-4",
  "Finanzas": "bg-chart-3",
  "Ventas": "bg-chart-5",
}

function OrgCard({ node, isRoot = false }: { node: OrgNode, isRoot?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`p-4 rounded-xl bg-card border-2 border-border hover:border-primary/50 transition-colors ${isRoot ? 'shadow-lg' : ''}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${departmentColors[node.department] || 'bg-muted'} flex items-center justify-center text-white font-semibold`}>
            {node.avatar}
          </div>
          <div>
            <p className="font-semibold text-foreground">{node.name}</p>
            <p className="text-sm text-muted-foreground">{node.position}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {node.department}
            </Badge>
          </div>
        </div>
      </div>
      
      {node.children && node.children.length > 0 && (
        <>
          <div className="w-px h-8 bg-border" />
          <div className="relative flex items-start">
            {node.children.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-border" 
                style={{ width: `calc(100% - 120px)` }} 
              />
            )}
            <div className="flex gap-6">
              {node.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-8 bg-border" />
                  <OrgCard node={child} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function OrganigramaPage() {
  const { employees } = useEmployees()

  // Construir jerarquía dinámica para los 5 usuarios seed
  const buildHierarchy = (): OrgNode | null => {
    const findEmp = (id: string) => employees.find(e => e.id === id)
    
    const rootEmp = findEmp("usr-001")
    if (!rootEmp) return null

    const node1: OrgNode = { ...rootEmp, children: [] }
    
    // Nivel 2: RRHH, Supervisor, Contabilidad
    const emp2 = findEmp("usr-002")
    const emp3 = findEmp("usr-003")
    const emp4 = findEmp("usr-004")
    const emp5 = findEmp("usr-005")

    if (emp2) node1.children?.push({ ...emp2, children: [] })
    if (emp3) {
      const node3: OrgNode = { ...emp3, children: [] }
      // Nivel 3: Desarrollador reporta a Supervisor
      if (emp5) node3.children?.push({ ...emp5, children: [] })
      node1.children?.push(node3)
    }
    if (emp4) node1.children?.push({ ...emp4, children: [] })

    return node1
  }

  const dynamicOrgData = buildHierarchy()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Organigrama</h1>
          <p className="text-muted-foreground">Estructura organizacional dinámica de la empresa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {Object.entries(departmentColors).map(([dept, color]) => (
              <div key={dept} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-sm text-muted-foreground">{dept}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Org Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Estructura Organizacional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto py-8">
            <div className="min-w-max flex justify-center">
              {dynamicOrgData ? (
                <OrgCard node={dynamicOrgData} isRoot />
              ) : (
                <p className="text-muted-foreground">No se pudo cargar el organigrama.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
