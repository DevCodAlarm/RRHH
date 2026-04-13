"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Calculator,
  Percent,
  CreditCard,
  Wallet,
  ChevronDown,
  XCircle,
  Info,
} from "lucide-react"
import { useEmployees, HRLoan } from "@/lib/employees-context"
import { logActivity as logGlobalActivity } from "@/lib/activity-log"

function fmt(n: number) {
  return `RD$ ${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function PrestamosPage() {
  const { user } = useAuth()
  const { loans, addLoan, updateLoanStatus, payLoanManual, logActivity, employees } = useEmployees()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [detailLoan, setDetailLoan] = useState<HRLoan | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Form states
  const [selectedEmpId, setSelectedEmpId] = useState("")
  const [loanAmount, setLoanAmount] = useState("")
  const [loanTerm, setLoanTerm] = useState("12")
  const [loanRate, setLoanRate] = useState("0")
  const [installments, setInstallments] = useState("auto")
  const [customInstallments, setCustomInstallments] = useState("")

  const isEmployee = user?.role === "empleado"
  const isAdmin = user?.role === "admin" || user?.role === "rrhh"

  // ── Cálculo de cuota ────────────────────────────────────────────
  const calcBiweekly = () => {
    const principal = parseFloat(loanAmount) || 0
    const rate = parseFloat(loanRate) / 100 / 12
    const n = parseInt(loanTerm) || 12
    if (principal === 0) return 0
    if (rate === 0) return Math.round((principal / n) / 2)
    const monthly = (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1)
    return Math.round(monthly / 2)
  }

  const calcTotal = () => {
    const biweekly = calcBiweekly()
    const terms = parseInt(loanTerm) || 12
    return biweekly * terms * 2
  }

  // ── Crear préstamo ───────────────────────────────────────────────
  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const empId = isEmployee ? user.id : selectedEmpId
    const employee = employees.find((e) => e.id === empId)
    if (!employee) return

    const amount = parseFloat(loanAmount)
    const biweekly = calcBiweekly()
    const monthly = biweekly * 2
    const termMonths = parseInt(loanTerm) || 12
    const termBiweekly = termMonths * 2

    let resolvedInstallments: number | null = null
    if (installments === "auto") {
      resolvedInstallments = null // distribuido hasta saldarlo
    } else if (installments === "custom" && customInstallments) {
      resolvedInstallments = parseInt(customInstallments)
    } else if (installments !== "auto") {
      resolvedInstallments = parseInt(installments)
    }

    addLoan({
      employeeId: empId,
      employeeName: employee.name,
      department: employee.department,
      amount,
      monthlyPayment: monthly,
      biweeklyPayment: biweekly,
      termBiweekly,
      term: termMonths,
      interestRate: parseFloat(loanRate),
      startDate: new Date().toISOString().slice(0, 10),
      avatar: employee.avatar,
      status: isEmployee ? "pending" : "active",
      installments: resolvedInstallments,
      installmentCount: resolvedInstallments ?? termBiweekly,
    })

    logGlobalActivity({
      type: "loan.created",
      message: `Se registró un préstamo de ${fmt(amount)} para ${employee.name}`,
      actor: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
    logActivity({
      type: "prestamo",
      title: "Nuevo préstamo registrado",
      description: `Préstamo de ${fmt(amount)} para ${employee.name}`,
      status: "pending",
      userId: user.id,
    })

    setIsAddDialogOpen(false)
    setLoanAmount("")
    setSelectedEmpId("")
    setLoanTerm("12")
    setLoanRate("0")
    setInstallments("auto")
    setCustomInstallments("")
  }

  // ── Filtros ──────────────────────────────────────────────────────
  const displayLoans = useMemo(() => {
    let base = isEmployee
      ? loans.filter((l) => l.employeeId === user?.id)
      : loans

    if (searchQuery) {
      base = base.filter(
        (l) =>
          l.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.department?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return base
  }, [loans, isEmployee, user, searchQuery])

  const activeLoans = displayLoans.filter((l) => l.status === "active" || l.status === "approved")
  const pendingLoans = displayLoans.filter((l) => l.status === "pending")
  const completedLoans = displayLoans.filter((l) => l.status === "completed")

  // ── Stats ────────────────────────────────────────────────────────
  const totalBalance = activeLoans.reduce((acc, l) => acc + l.balance, 0)
  const totalBiweekly = activeLoans.reduce((acc, l) => acc + (l.biweeklyPayment ?? l.monthlyPayment / 2), 0)
  const uniqueEmps = new Set(activeLoans.map((l) => l.employeeId)).size

  const stats = [
    { label: "Préstamos Activos", value: activeLoans.length.toString(), icon: CreditCard, color: "text-primary" },
    { label: "Saldo Total", value: `RD$ ${(totalBalance / 1000).toFixed(1)}K`, icon: TrendingUp, color: "text-accent" },
    { label: "Empleados con Deuda", value: uniqueEmps.toString(), icon: Users, color: "text-chart-3" },
    { label: "Descuento Quincenal", value: `RD$ ${totalBiweekly.toLocaleString()}`, icon: Percent, color: "text-chart-1" },
  ]

  // ── Badges ───────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-accent/10 text-accent gap-1 border-0"><CheckCircle2 className="h-3 w-3" />Activo</Badge>
      case "approved":
        return <Badge className="bg-primary/10 text-primary gap-1 border-0"><CheckCircle2 className="h-3 w-3" />Aprobado</Badge>
      case "completed":
        return <Badge className="bg-muted text-muted-foreground gap-1 border-0"><CheckCircle2 className="h-3 w-3" />Saldado</Badge>
      case "pending":
        return <Badge className="bg-chart-3/10 text-chart-3 gap-1 border-0"><Clock className="h-3 w-3" />Pendiente</Badge>
      default:
        return null
    }
  }

  // ── Loan card ────────────────────────────────────────────────────
  const LoanCard = ({ loan }: { loan: HRLoan }) => {
    const progressPct = loan.amount > 0 ? ((loan.amount - loan.balance) / loan.amount) * 100 : 0
    const biweekly = loan.biweeklyPayment ?? loan.monthlyPayment / 2

    return (
      <div className="p-4 rounded-xl border border-border bg-background/60 hover:bg-secondary/20 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-primary">{loan.avatar}</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{loan.employeeName}</p>
              <p className="text-xs text-muted-foreground">{loan.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(loan.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {loan.status === "pending" && isAdmin && (
                  <DropdownMenuItem
                    className="text-accent"
                    onClick={() => updateLoanStatus(loan.id, "active")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Aprobar Préstamo
                  </DropdownMenuItem>
                )}
                {(loan.status === "active" || loan.status === "approved") && isAdmin && (
                  <DropdownMenuItem
                    onClick={() => {
                      const amount = parseFloat(prompt(`Pago manual para ${loan.employeeName} (balance: ${fmt(loan.balance)}):`) || "0")
                      if (amount > 0) payLoanManual(loan.id, amount)
                    }}
                  >
                    <Wallet className="h-4 w-4 mr-2" /> Pago Manual
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setDetailLoan(loan)}>
                  <Info className="h-4 w-4 mr-2" /> Ver Detalle
                </DropdownMenuItem>
                {loan.status === "pending" && isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => updateLoanStatus(loan.id, "completed")}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Rechazar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Monto Original</p>
            <p className="font-semibold text-foreground text-sm">{fmt(loan.amount)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Saldo Pendiente</p>
            <p className="font-semibold text-accent text-sm">{fmt(loan.balance)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Cuota Quincenal</p>
            <p className="font-semibold text-foreground text-sm">{fmt(biweekly)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Quincenas Rest.</p>
            <p className="font-semibold text-foreground text-sm">{loan.remainingTerm} / {loan.termBiweekly ?? loan.term * 2}</p>
          </div>
        </div>

        {(loan.status === "active" || loan.status === "approved") && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progreso de pago</span>
              <span className="font-medium text-foreground">{Math.round(progressPct)}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>
        )}

        {loan.status === "completed" && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-accent font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Préstamo saldado. Nómina vuelve a la normalidad.
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Préstamos</h1>
          <p className="text-muted-foreground">
            Gestiona préstamos con descuento quincenal automático en nómina
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Préstamo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Préstamo</DialogTitle>
              <DialogDescription>
                El monto se descontará en cuotas quincenales hasta saldarlo.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4 mt-2" onSubmit={handleCreateLoan}>
              {/* Empleado */}
              {isEmployee ? (
                <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Solicitante: </span>
                  <span className="font-medium text-foreground">{user?.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Empleado</Label>
                  <Select value={selectedEmpId} onValueChange={setSelectedEmpId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} — {emp.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Monto y plazo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monto (RD$)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="50000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plazo (meses)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="12"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Tasa */}
              <div className="space-y-2">
                <Label>Tasa de Interés Mensual (%)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={loanRate}
                  onChange={(e) => setLoanRate(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">Ingresa 0 para préstamo sin interés.</p>
              </div>

              {/* Cuotas */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label>Descuento en nómina</Label>
                  <Select value={installments} onValueChange={setInstallments}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automático (distribuido hasta saldarlo)</SelectItem>
                      <SelectItem value="1">1 quincena (descuento único)</SelectItem>
                      <SelectItem value="2">2 quincenas</SelectItem>
                      <SelectItem value="4">4 quincenas (2 meses)</SelectItem>
                      <SelectItem value="6">6 quincenas (3 meses)</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  {installments === "custom" && (
                    <Input
                      type="number"
                      min="1"
                      placeholder="Número de quincenas"
                      value={customInstallments}
                      onChange={(e) => setCustomInstallments(e.target.value)}
                    />
                  )}
                </div>
              )}

              {/* Preview */}
              {loanAmount && (
                <Card className="bg-secondary/40 border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground text-sm">Resumen del préstamo</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Cuota Quincenal</p>
                        <p className="font-bold text-foreground">{fmt(calcBiweekly())}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Cuota Mensual</p>
                        <p className="font-bold text-foreground">{fmt(calcBiweekly() * 2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Total a Pagar</p>
                        <p className="font-bold text-foreground">{fmt(calcTotal())}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-muted-foreground italic">
                      El descuento de {fmt(calcBiweekly())} se aplicará automáticamente en cada quincena hasta saldarlo.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  {isEmployee ? "Enviar Solicitud" : "Registrar Préstamo"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {!isEmployee && (
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
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="active">
              Activos
              {activeLoans.length > 0 && (
                <Badge className="ml-1.5 h-4 px-1.5 text-[10px] bg-primary/20 text-primary border-0">
                  {activeLoans.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pendientes
              {pendingLoans.length > 0 && (
                <Badge className="ml-1.5 h-4 px-1.5 text-[10px] bg-chart-3/20 text-chart-3 border-0">
                  {pendingLoans.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Saldados</TabsTrigger>
          </TabsList>

          {!isEmployee && (
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar préstamos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          )}
        </div>

        <TabsContent value="active" className="space-y-3">
          {activeLoans.length === 0 ? (
            <EmptyState icon={<CreditCard className="h-10 w-10" />} text="No hay préstamos activos" />
          ) : (
            activeLoans.map((loan) => <LoanCard key={loan.id} loan={loan} />)
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3">
          {pendingLoans.length === 0 ? (
            <EmptyState icon={<Clock className="h-10 w-10" />} text="No hay préstamos pendientes de aprobación" />
          ) : (
            pendingLoans.map((loan) => <LoanCard key={loan.id} loan={loan} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completedLoans.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="h-10 w-10" />} text="No hay préstamos saldados" />
          ) : (
            completedLoans.map((loan) => <LoanCard key={loan.id} loan={loan} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailLoan} onOpenChange={(open) => !open && setDetailLoan(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Préstamo — {detailLoan?.employeeName}</DialogTitle>
            <DialogDescription>Historial de pagos y estado de la deuda</DialogDescription>
          </DialogHeader>
          {detailLoan && (
            <div className="space-y-5 py-2">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Original", value: fmt(detailLoan.amount) },
                  { label: "Saldo Pendiente", value: fmt(detailLoan.balance), accent: true },
                  { label: "Cuota Quincenal", value: fmt(detailLoan.biweeklyPayment ?? detailLoan.monthlyPayment / 2) },
                  { label: "Quincenas Rest.", value: `${detailLoan.remainingTerm}` },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`mt-1 text-base font-bold ${item.accent ? "text-accent" : "text-foreground"}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Progress */}
              {detailLoan.status !== "pending" && (
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Progreso de pago</span>
                    <span className="font-medium">
                      {Math.round(((detailLoan.amount - detailLoan.balance) / detailLoan.amount) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={((detailLoan.amount - detailLoan.balance) / detailLoan.amount) * 100}
                    className="h-3"
                  />
                </div>
              )}

              <Separator />

              {/* Payment history */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Historial de Pagos</h3>
                {detailLoan.payments && detailLoan.payments.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {detailLoan.payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/40 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                          <span className="text-foreground font-medium">{fmt(p.amount)}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border">
                            {p.source === "payroll" ? "Nómina" : "Manual"}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {new Date(p.date).toLocaleDateString("es-DO")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Sin pagos registrados aún. Los descuentos se aplicarán al procesar la nómina.
                  </p>
                )}
              </div>

              {detailLoan.status === "completed" && (
                <div className="flex items-center gap-2 rounded-lg bg-accent/10 text-accent px-4 py-3 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Préstamo completamente saldado. La nómina ya no incluye este descuento.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 border-2 border-dashed border-border rounded-xl text-muted-foreground">
      <div className="opacity-20">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  )
}
