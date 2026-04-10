"use client"

import { useState, Suspense } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
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
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Laptop,
  Monitor,
  Calendar,
  Package
} from "lucide-react"

import { useEmployees, HRRequest } from "@/lib/employees-context"
import { logActivity as logGlobalActivity } from "@/lib/activity-log"

function EquipoContent() {
  const { user } = useAuth()
  const { requests, addRequest, updateRequestStatus, logActivity } = useEmployees()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Form states
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")

  // Filtrar solicitudes por tipo 'equipment' y rol
  const getDisplayRequests = () => {
    const baseRequests = requests.filter(req => req.type === "equipment")
    if (user?.role === "empleado") {
      return baseRequests.filter(req => req.employeeId === user.id)
    }
    return baseRequests
  }

  const displayRequests = getDisplayRequests()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    addRequest({
      employeeId: user.id,
      employeeName: user.name,
      type: "equipment",
      title: formTitle,
      description: formDescription,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      days: null,
      avatar: user.name.charAt(0)
    })

    logGlobalActivity({
      type: "request.created",
      message: `${user.name} solicitó nuevo equipo: ${formTitle}`,
      actor: { id: user.id, name: user.name, email: user.email, role: user.role },
    })

    logActivity({
      type: "solicitud",
      title: "Solicitud de equipo",
      description: `${user.name} solicitó nuevo equipo: ${formTitle}`,
      status: "pending",
      userId: user.id
    })

    setIsAddDialogOpen(false)
    setFormTitle("")
    setFormDescription("")
  }

  const handleUpdateStatus = (id: string, newStatus: HRRequest["status"], reqTitle: string, empName: string) => {
    updateRequestStatus(id, newStatus)
    logGlobalActivity({
      type: newStatus === "approved" ? "request.approved" : "request.rejected",
      message: `${newStatus === "approved" ? "Aceptada" : "Rechazada"} solicitud de equipo para ${empName}`,
      actor: { id: user?.id, name: user?.name, email: user?.email, role: user?.role },
    })

    logActivity({
      type: "solicitud",
      title: `Solicitud de Equipo ${newStatus === "approved" ? "Aceptada" : "Rechazada"}`,
      description: `${newStatus === "approved" ? "Aceptada" : "Rechazada"} solicitud de equipo para ${empName}`,
      status: newStatus === "approved" ? "completed" : "rejected",
      userId: user?.id || ""
    })
  }

  const filteredRequests = displayRequests.filter(req => {
    const matchesFilter = filter === "all" || req.status === filter
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-accent/10 text-accent gap-1"><CheckCircle2 className="h-3 w-3" />Aprobada</Badge>
      case "pending":
        return <Badge className="bg-chart-3/10 text-chart-3 gap-1"><Clock className="h-3 w-3" />Pendiente</Badge>
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive gap-1"><XCircle className="h-3 w-3" />Rechazada</Badge>
      default:
        return null
    }
  }

  const isEmployee = user?.role === "empleado"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Laptop className="h-6 w-6 text-primary" />
            {isEmployee ? "Mis Solicitudes de Equipo" : "Gestión de Equipamiento"}
          </h1>
          <p className="text-muted-foreground">
            {isEmployee ? "Solicita herramientas, hardware o suministros necesarios para tu labor" : "Administra los recursos y herramientas asignadas al personal"}
          </p>
        </div>
        {isEmployee && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="h-4 w-4" />
                Nueva Solicitud
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Solicitud de Equipo / Hardware</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="title">¿Qué necesitas?</Label>
                  <Input id="title" placeholder="Ej: Monitor 27', Teclado Mecánico, Licencia Adobe..." value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Justificación y especificaciones</Label>
                  <Textarea id="description" placeholder="Explica por qué necesitas este equipo y cualquier detalle técnico..." rows={4} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} required />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground">
                    Enviar Solicitud
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-chart-3/10 text-chart-3">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{displayRequests.filter(r => r.status === "pending").length}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{displayRequests.filter(r => r.status === "approved").length}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Entregados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{displayRequests.length}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Pedidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-background">Todas</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-background">Pendientes</TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-background">Aprobadas</TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-background">Rechazadas</TabsTrigger>
          </TabsList>
          
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por empleado o equipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>
        </div>

        <TabsContent value={filter} className="mt-0">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Inventario de Solicitudes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                    <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay solicitudes de equipo registradas</p>
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <div key={request.id} className="p-4 rounded-xl border border-border bg-background/50 hover:bg-secondary/20 transition-all duration-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">{request.avatar}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-foreground">{request.employeeName}</span>
                              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                Equipo
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground/90">{request.title}</p>
                            {request.description && <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5 font-medium text-foreground/70">
                                <Calendar className="h-3.5 w-3.5" />
                                Solicitado: {new Date(request.createdAt).toLocaleDateString('es-DO')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          {getStatusBadge(request.status)}
                          {request.status === "pending" && !isEmployee && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-destructive hover:bg-destructive/10 border-destructive/20 h-8"
                                onClick={() => handleUpdateStatus(request.id, "rejected", request.title, request.employeeName)}
                              >
                                Rechazar
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-accent hover:bg-accent/90 text-accent-foreground h-8 shadow-sm"
                                onClick={() => handleUpdateStatus(request.id, "approved", request.title, request.employeeName)}
                              >
                                Aprobar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function EquipoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <EquipoContent />
    </Suspense>
  )
}
