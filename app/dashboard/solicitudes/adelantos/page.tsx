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
  DollarSign,
  Calendar,
  Wallet
} from "lucide-react"

import { useEmployees, HRRequest } from "@/lib/employees-context"
import { logActivity as logGlobalActivity } from "@/lib/activity-log"

function AdelantosContent() {
  const { user } = useAuth()
  const { requests, addRequest, updateRequestStatus, logActivity } = useEmployees()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Form states
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formAmount, setFormAmount] = useState("")

  // Filtrar solicitudes por tipo 'payroll_advance' y rol
  const getDisplayRequests = () => {
    const baseRequests = requests.filter(req => req.type === "payroll_advance")
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
      type: "payroll_advance",
      amount: parseFloat(formAmount),
      title: formTitle || `Adelanto de Nómina: ${formAmount}`,
      description: formDescription || `Solicitud de adelanto por un monto de RD$ ${formAmount}`,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      days: null,
      avatar: user.name.charAt(0)
    })

    logGlobalActivity({
      type: "request.created",
      message: `${user.name} solicitó un adelanto de RD$ ${formAmount}`,
      actor: { id: user.id, name: user.name, email: user.email, role: user.role },
    })

    logActivity({
      type: "solicitud",
      title: "Solicitud de adelanto de nómina",
      description: `${user.name} solicitó adelanto: RD$ ${formAmount}`,
      status: "pending",
      userId: user.id
    })

    setIsAddDialogOpen(false)
    setFormTitle("")
    setFormDescription("")
    setFormAmount("")
  }

  const handleUpdateStatus = (id: string, newStatus: HRRequest["status"], reqTitle: string, empName: string) => {
    updateRequestStatus(id, newStatus)
    logGlobalActivity({
      type: newStatus === "approved" ? "request.approved" : "request.rejected",
      message: `${newStatus === "approved" ? "Aprobado" : "Rechazado"} adelanto de nómina para ${empName}`,
      actor: { id: user?.id, name: user?.name, email: user?.email, role: user?.role },
    })

    logActivity({
      type: "solicitud",
      title: `Adelanto de Nómina ${newStatus === "approved" ? "Aprobado" : "Rechazado"}`,
      description: `${newStatus === "approved" ? "Aprobado" : "Rechazado"} adelanto de RD$ ${formAmount} para ${empName}`,
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
            <Wallet className="h-6 w-6 text-accent" />
            {isEmployee ? "Mis Adelantos de Nómina" : "Gestión de Adelantos"}
          </h1>
          <p className="text-muted-foreground">
            {isEmployee ? "Solicita adelantos sobre tu salario próximo" : "Administra las solicitudes de adelanto del personal"}
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
                <DialogTitle>Solicitar Adelanto de Nómina</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto Solicitado (RD$)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    value={formAmount} 
                    onChange={(e) => setFormAmount(e.target.value)} 
                    required 
                  />
                  <p className="text-[10px] text-muted-foreground italic">Sujeto a aprobación y políticas de la empresa.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Motivo (Opcional)</Label>
                  <Input id="title" placeholder="Ej: Gasto médico imprevisto" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Comentarios adicionales</Label>
                  <Textarea id="description" placeholder="Detalles sobre la urgencia o plan de pago..." rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
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
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Aprobadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{displayRequests.length}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Trámites</p>
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
              placeholder="Buscar por empleado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>
        </div>

        <TabsContent value={filter} className="mt-0">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Historial de Adelantos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                    <Wallet className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay solicitudes de adelanto registradas</p>
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <div key={request.id} className="p-4 rounded-xl border border-border bg-background/50 hover:bg-secondary/20 transition-all duration-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-accent">{request.avatar}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-foreground">{request.employeeName}</span>
                              <Badge variant="secondary" className="bg-accent/10 text-accent hover:bg-accent/20 border-none">
                                Adelanto de Nómina
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

export default function AdelantosPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AdelantosContent />
    </Suspense>
  )
}
