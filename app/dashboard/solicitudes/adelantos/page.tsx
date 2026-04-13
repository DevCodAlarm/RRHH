"use client"

import { useState, useMemo, Suspense } from "react"
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
  Wallet,
  AlertCircle,
  Info,
} from "lucide-react"
import { useEmployees, HRRequest } from "@/lib/employees-context"
import { logActivity as logGlobalActivity } from "@/lib/activity-log"
import { buildPeriodoQuincenalActual } from "@/lib/nomina"

function fmt(n: number) {
  return `RD$ ${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Calcula la quincena siguiente a hoy */
function nextBiweeklyPeriod(): string {
  const today = new Date()
  const next = new Date(today)
  const day = today.getDate()

  if (day <= 14) {
    // Estamos en Q1 → la próxima es Q2 (día 15-fin del mes)
    next.setDate(15)
  } else {
    // Estamos en Q2 → la próxima es Q1 del mes siguiente
    next.setMonth(next.getMonth() + 1)
    next.setDate(1)
  }

  const p = buildPeriodoQuincenalActual(next)
  const [y, m] = p.inicio.split("-")
  const q = p.key.includes("Q1") ? "1" : "2"
  return `Quincena ${q} de ${new Date(p.inicio + "T00:00:00").toLocaleString("es-DO", { month: "long", year: "numeric" })}`
}

function AdelantosContent() {
  const { user } = useAuth()
  const {
    requests,
    addRequest,
    updateRequestStatus,
    logActivity,
    employees,
    getActiveLoanBiweeklyTotal,
    getApprovedAdvancesTotal,
  } = useEmployees()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const [formAmount, setFormAmount] = useState("")
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")

  const isEmployee = user?.role === "empleado"
  const isAdmin = user?.role === "admin" || user?.role === "rrhh"

  // ── Datos del empleado para el preview ──────────────────────────
  const currentEmployee = useMemo(() => {
    if (!user) return null
    return employees.find((e) => e.id === user.id) ?? null
  }, [user, employees])

  const quincenal = currentEmployee ? currentEmployee.salary / 2 : 0
  const loanDeduction = currentEmployee ? getActiveLoanBiweeklyTotal(currentEmployee.id) : 0
  const existingAdvances = currentEmployee ? getApprovedAdvancesTotal(currentEmployee.id) : 0
  const maxAllowable = Math.max(0, quincenal * 0.5) // máx. 50% del quincenal (política)

  const previewNetAfterAdvance = quincenal - loanDeduction - existingAdvances - (parseFloat(formAmount) || 0)
  const nextPeriodLabel = nextBiweeklyPeriod()

  // ── Solicitudes de adelanto ─────────────────────────────────────
  const displayRequests = useMemo(() => {
    const base = requests.filter((r) => r.type === "payroll_advance")
    return isEmployee ? base.filter((r) => r.employeeId === user?.id) : base
  }, [requests, isEmployee, user])

  const filteredRequests = useMemo(() => {
    return displayRequests.filter((r) => {
      const matchFilter = filter === "all" || r.status === filter
      const matchSearch =
        r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchFilter && matchSearch
    })
  }, [displayRequests, filter, searchQuery])

  const pending = displayRequests.filter((r) => r.status === "pending").length
  const approved = displayRequests.filter((r) => r.status === "approved").length
  const totalApprovedAmt = displayRequests
    .filter((r) => r.status === "approved")
    .reduce((acc, r) => acc + (r.amount || 0), 0)

  // ── Crear solicitud ─────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const amount = parseFloat(formAmount)
    if (!amount || amount <= 0) return

    addRequest({
      employeeId: user.id,
      employeeName: user.name,
      type: "payroll_advance",
      amount,
      title: formTitle || `Adelanto de Nómina — ${fmt(amount)}`,
      description: formDescription || `Solicitud de adelanto quincenal por ${fmt(amount)}`,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      days: null,
      avatar: user.name.charAt(0),
    })

    logGlobalActivity({
      type: "request.created",
      message: `${user.name} solicitó un adelanto de ${fmt(amount)}`,
      actor: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
    logActivity({
      type: "solicitud",
      title: "Solicitud de adelanto de nómina",
      description: `${user.name} solicitó adelanto: ${fmt(amount)}`,
      status: "pending",
      userId: user.id,
    })

    setIsAddDialogOpen(false)
    setFormAmount("")
    setFormTitle("")
    setFormDescription("")
  }

  const handleUpdateStatus = (
    id: string,
    newStatus: HRRequest["status"],
    empName: string,
    amount?: number
  ) => {
    updateRequestStatus(id, newStatus)
    logGlobalActivity({
      type: newStatus === "approved" ? "request.approved" : "request.rejected",
      message: `${newStatus === "approved" ? "Aprobado" : "Rechazado"} adelanto de nómina para ${empName}`,
      actor: { id: user?.id, name: user?.name, email: user?.email, role: user?.role },
    })
    logActivity({
      type: "solicitud",
      title: `Adelanto ${newStatus === "approved" ? "Aprobado" : "Rechazado"}`,
      description: `${newStatus === "approved" ? "Aprobado" : "Rechazado"} adelanto${amount ? ` de ${fmt(amount)}` : ""} para ${empName}`,
      status: newStatus === "approved" ? "completed" : "rejected",
      userId: user?.id || "",
    })
  }

  // ── Badge ────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-accent/10 text-accent gap-1 border-0"><CheckCircle2 className="h-3 w-3" />Aprobada</Badge>
      case "pending":
        return <Badge className="bg-chart-3/10 text-chart-3 gap-1 border-0"><Clock className="h-3 w-3" />Pendiente</Badge>
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive gap-1 border-0"><XCircle className="h-3 w-3" />Rechazada</Badge>
      case "processed":
        return <Badge className="bg-muted text-muted-foreground gap-1 border-0"><CheckCircle2 className="h-3 w-3" />Procesada</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-accent" />
            {isEmployee ? "Mis Adelantos de Nómina" : "Gestión de Adelantos"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEmployee
              ? "El monto aprobado se descontará en tu próxima quincena"
              : "Administra las solicitudes de adelanto del personal"}
          </p>
        </div>
        {isEmployee && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="h-4 w-4" />
                Solicitar Adelanto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Solicitar Adelanto de Nómina</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
                {/* Info quincenal */}
                {currentEmployee && (
                  <div className="rounded-lg bg-secondary/50 p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tu quincenal bruto</span>
                      <span className="font-medium text-foreground">{fmt(quincenal)}</span>
                    </div>
                    {loanDeduction > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Desc. préstamos</span>
                        <span className="font-medium text-destructive">-{fmt(loanDeduction)}</span>
                      </div>
                    )}
                    {existingAdvances > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Adelantos pendientes</span>
                        <span className="font-medium text-destructive">-{fmt(existingAdvances)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border pt-1 mt-1">
                      <span className="text-muted-foreground font-medium">Límite recomendado</span>
                      <span className="font-bold text-foreground">{fmt(maxAllowable)}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Monto Solicitado (RD$)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Se descontará en <span className="font-medium text-foreground">{nextPeriodLabel}</span>.
                  </p>
                </div>

                {/* Preview neto */}
                {formAmount && currentEmployee && (
                  <div className={`rounded-lg border p-3 text-sm ${previewNetAfterAdvance < 0 ? "border-destructive/40 bg-destructive/5" : "border-accent/30 bg-accent/5"}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {previewNetAfterAdvance < 0 ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Info className="h-4 w-4 text-accent" />
                      )}
                      <span className="font-medium">Neto estimado en próxima quincena</span>
                    </div>
                    <p className={`text-xl font-bold ${previewNetAfterAdvance < 0 ? "text-destructive" : "text-foreground"}`}>
                      {fmt(Math.max(0, previewNetAfterAdvance))}
                    </p>
                    {previewNetAfterAdvance < 0 && (
                      <p className="text-destructive text-xs mt-1">
                        El monto excede tu saldo disponible. Reduce el adelanto solicitado.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Motivo (opcional)</Label>
                  <Input
                    placeholder="Ej: Gasto médico urgente"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Comentarios adicionales</Label>
                  <Textarea
                    placeholder="Detalles adicionales..."
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!formAmount || parseFloat(formAmount) <= 0}
                    className="bg-primary text-primary-foreground"
                  >
                    Enviar Solicitud
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-3/10 text-chart-3">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pending}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{approved}</p>
              <p className="text-xs text-muted-foreground">Aprobadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalApprovedAmt > 0 ? `RD$ ${(totalApprovedAmt / 1000).toFixed(1)}K` : "RD$ 0"}
              </p>
              <p className="text-xs text-muted-foreground">Monto por Descontar</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approved info for employee */}
      {isEmployee && approved > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
          <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">
              Tienes {fmt(existingAdvances)} en adelantos aprobados
            </p>
            <p className="text-muted-foreground mt-0.5">
              Este monto se descontará automáticamente en tu próxima nómina quincenal (
              {nextPeriodLabel}).
            </p>
          </div>
        </div>
      )}

      {/* Tabs + List */}
      <Tabs defaultValue="all" onValueChange={setFilter} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">
              Pendientes
              {pending > 0 && (
                <Badge className="ml-1.5 h-4 px-1.5 text-[10px] bg-chart-3/20 text-chart-3 border-0">
                  {pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Aprobadas</TabsTrigger>
            <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
            <TabsTrigger value="processed">Procesadas</TabsTrigger>
          </TabsList>

          {isAdmin && (
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empleado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
          )}
        </div>

        <TabsContent value={filter} className="mt-0">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                {filter === "all"
                  ? "Todas las Solicitudes"
                  : filter === "pending"
                  ? "Solicitudes Pendientes"
                  : filter === "approved"
                  ? "Solicitudes Aprobadas"
                  : filter === "rejected"
                  ? "Solicitudes Rechazadas"
                  : "Solicitudes Procesadas"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                  <Wallet className="h-10 w-10 opacity-20" />
                  <p className="text-sm">No hay solicitudes de adelanto en esta categoría</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 rounded-xl border border-border bg-background/50 hover:bg-secondary/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-accent">{request.avatar}</span>
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-foreground text-sm">{request.employeeName}</span>
                              <Badge variant="secondary" className="bg-accent/10 text-accent hover:bg-accent/20 border-0 text-[10px]">
                                Adelanto
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground/90">{request.title}</p>
                            {request.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{request.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(request.createdAt).toLocaleDateString("es-DO")}
                              </span>
                              {request.amount && (
                                <span className="flex items-center gap-1 font-semibold text-foreground">
                                  <DollarSign className="h-3 w-3" />
                                  {fmt(request.amount)}
                                </span>
                              )}
                            </div>
                            {request.status === "approved" && (
                              <p className="text-[11px] text-accent font-medium mt-1">
                                Se descontara en {nextPeriodLabel}
                              </p>
                            )}
                            {request.status === "processed" && (
                              <p className="text-[11px] text-muted-foreground mt-1">
                                Descuento aplicado en nomina
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {getStatusBadge(request.status)}
                          {request.status === "pending" && isAdmin && (
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10 border-destructive/20 h-7 text-xs"
                                onClick={() => handleUpdateStatus(request.id, "rejected", request.employeeName, request.amount)}
                              >
                                Rechazar
                              </Button>
                              <Button
                                size="sm"
                                className="bg-accent hover:bg-accent/90 text-accent-foreground h-7 text-xs"
                                onClick={() => handleUpdateStatus(request.id, "approved", request.employeeName, request.amount)}
                              >
                                Aprobar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function AdelantosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <AdelantosContent />
    </Suspense>
  )
}
