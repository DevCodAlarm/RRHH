"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Calendar,
  Percent
} from "lucide-react"

import { useEmployees, HRLoan } from "@/lib/employees-context"
import { logActivity as logGlobalActivity } from "@/lib/activity-log"

export default function PrestamosPage() {
  const { user } = useAuth()
  const { loans, addLoan, updateLoanStatus, logActivity, employees } = useEmployees()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [detailLoan, setDetailLoan] = useState<HRLoan | null>(null)
  
  // Form states
  const [selectedEmpId, setSelectedEmpId] = useState("")
  const [loanAmount, setLoanAmount] = useState("")
  const [loanTerm, setLoanTerm] = useState("12")
  const [loanRate, setLoanRate] = useState("12")

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(loanAmount) || 0
    const rate = parseFloat(loanRate) / 100 / 12
    const n = parseInt(loanTerm) || 12
    if (principal === 0) return 0
    const payment = (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1)
    return Math.round(payment)
  }

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const empId = user.role === "empleado" ? user.id : selectedEmpId
    const employee = employees.find(e => e.id === empId)
    if (!employee) return

    const amount = parseFloat(loanAmount)
    const monthly = calculateMonthlyPayment()

    addLoan({
      employeeId: empId,
      employeeName: employee.name,
      department: employee.department,
      amount: amount,
      monthlyPayment: monthly,
      interestRate: parseFloat(loanRate),
      term: parseInt(loanTerm),
      startDate: new Date().toISOString().slice(0, 10),
      avatar: employee.avatar,
      status: user.role !== "empleado" ? "active" : "pending"
    })

    logGlobalActivity({
      type: "loan.created",
      message: `Se registró un préstamo de RD$ ${amount.toLocaleString()} para ${employee.name}`,
      actor: { id: user.id, name: user.name, email: user.email, role: user.role },
    })

    logActivity({
      type: "prestamo",
      title: "Nuevo préstamo registrado",
      description: `Se registró un préstamo de RD$ ${amount.toLocaleString()} para ${employee.name}`,
      status: "pending",
      userId: user.id
    })

    setIsAddDialogOpen(false)
    setLoanAmount("")
    setSelectedEmpId("")
  }

  const dynamicStats = [
    { label: "Prestamos Activos", value: loans.filter(l => l.status === "active").length.toString(), icon: DollarSign, color: "text-primary" },
    { label: "Monto Total", value: `RD$ ${(loans.reduce((acc, l) => acc + l.balance, 0) / 1000000).toFixed(1)}M`, icon: TrendingUp, color: "text-accent" },
    { label: "Empleados", value: new Set(loans.map(l => l.employeeId)).size.toString(), icon: Users, color: "text-chart-3" },
    { label: "Tasa Promedio", value: loans.length > 0 ? `${Math.round(loans.reduce((acc, l) => acc + l.interestRate, 0) / loans.length)}%` : "0%", icon: Percent, color: "text-chart-1" },
  ]


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-accent/10 text-accent gap-1"><CheckCircle2 className="h-3 w-3" />Activo</Badge>
      case "completed":
        return <Badge className="bg-muted text-muted-foreground gap-1"><CheckCircle2 className="h-3 w-3" />Completado</Badge>
      case "pending":
        return <Badge className="bg-chart-3/10 text-chart-3 gap-1"><Clock className="h-3 w-3" />Pendiente</Badge>
      case "approved":
        return <Badge className="bg-primary/10 text-primary gap-1"><CheckCircle2 className="h-3 w-3" />Aprobado</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Prestamos y Avances</h1>
          <p className="text-muted-foreground">Gestiona prestamos y avances de nomina</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Prestamo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Prestamo</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={handleCreateLoan}>
              {user?.role !== "empleado" ? (
                <div className="space-y-2">
                  <Label htmlFor="employee">Empleado</Label>
                  <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">Empleado</div>
                  <div className="text-sm text-muted-foreground">{user.name}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto (RD$)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="50000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Plazo (meses)</Label>
                  <Input 
                    id="term" 
                    type="number" 
                    placeholder="12"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Tasa de Interes (%)</Label>
                <Input 
                  id="rate" 
                  type="number" 
                  placeholder="12"
                  value={loanRate}
                  onChange={(e) => setLoanRate(e.target.value)}
                />
              </div>
              
              {/* Calculator Preview */}
              {loanAmount && (
                <Card className="bg-secondary/50 border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Calculator className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Calculo de Cuota</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cuota Mensual</p>
                        <p className="text-xl font-semibold text-foreground">
                          RD$ {calculateMonthlyPayment().toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total a Pagar</p>
                        <p className="text-xl font-semibold text-foreground">
                          RD$ {(calculateMonthlyPayment() * parseInt(loanTerm || "12")).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  Crear Prestamo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicStats.map((stat) => {
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

      {/* Tabs */}
      <Tabs defaultValue="loans" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="loans">Prestamos</TabsTrigger>
          <TabsTrigger value="advances">Avances de Nomina</TabsTrigger>
        </TabsList>

        <TabsContent value="loans">
          {/* Search */}
          <Card className="bg-card border-border mb-4">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar prestamos..." className="pl-9 bg-background" />
              </div>
            </CardContent>
          </Card>

          {/* Loans List */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Prestamos Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(user?.role === "empleado"
                  ? loans.filter((loan) => loan.employeeId === user.id)
                  : loans.filter((loan) => loan.status !== "completed")
                ).map((loan) => (
                  <div key={loan.id} className="p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{loan.avatar}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{loan.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{loan.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(loan.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            {loan.status === "pending" && user?.role !== "empleado" && (
                              <DropdownMenuItem 
                                className="text-accent focus:text-accent font-medium"
                                onClick={() => updateLoanStatus(loan.id, "active")}
                              >
                                Aprobar Préstamo
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setDetailLoan(loan)}>
                              Ver Detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem>Ver Amortizacion</DropdownMenuItem>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Monto Original</p>
                        <p className="font-medium text-foreground">RD$ {loan.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className="font-medium text-foreground">RD$ {loan.balance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Cuota Mensual</p>
                        <p className="font-medium text-foreground">RD$ {loan.monthlyPayment.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Plazo Restante</p>
                        <p className="font-medium text-foreground">{loan.remainingTerm} / {loan.term} meses</p>
                      </div>
                    </div>

                    {loan.status === "active" && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progreso de pago</span>
                          <span className="text-foreground">{Math.round((1 - loan.balance / loan.amount) * 100)}%</span>
                        </div>
                        <Progress value={(1 - loan.balance / loan.amount) * 100} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
                {user?.role === "empleado" && loans.filter((loan) => loan.employeeId === user.id).length === 0 && (
                  <div className="p-6 rounded-lg border border-border bg-secondary/20 text-sm text-muted-foreground">
                    No tienes prestamos registrados aun.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advances">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Avances de Nomina</CardTitle>
                  <CardDescription>Solicitudes de adelanto de salario</CardDescription>
                </div>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Avance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Empleado</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Departamento</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Monto</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="p-8 text-center text-muted-foreground italic">
                      <td colSpan={6} className="py-8">
                        No hay avances de nómina registrados. Puedes solicitar uno desde la pestaña de Solicitudes.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {user?.role === "empleado" && (
                <div className="mt-4 p-4 rounded-lg border border-border bg-secondary/20 text-sm text-muted-foreground">
                  No tienes avances registrados aun.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
 
      {/* Loan Detail Dialog */}
      <Dialog open={!!detailLoan} onOpenChange={(open) => !open && setDetailLoan(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Préstamo — {detailLoan?.employeeName}</DialogTitle>
            <DialogDescription>Historial de pagos y estado actual de la deuda</DialogDescription>
          </DialogHeader>
 
          {detailLoan && (
            <div className="space-y-6 py-4">
              {/* Resumen cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Original</div>
                  <div className="mt-1 text-lg font-semibold">RD$ {detailLoan.amount.toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Balance Pendiente</div>
                  <div className="mt-1 text-lg font-semibold text-accent">RD$ {detailLoan.balance.toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Cuotas Restantes</div>
                  <div className="mt-1 text-lg font-semibold">{detailLoan.remainingTerm} / {detailLoan.term}</div>
                </div>
              </div>
 
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progreso de liquidación</span>
                  <span className="font-medium">{Math.round((1 - detailLoan.balance / detailLoan.amount) * 100)}%</span>
                </div>
                <Progress value={(1 - detailLoan.balance / detailLoan.amount) * 100} className="h-2" />
              </div>
 
              {/* Payments History */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Historial de Pagos
                </h4>
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-secondary/50">
                      <TableRow>
                        <TableHead className="w-[150px]">Fecha</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead className="text-right">Monto Pagado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailLoan.payments && detailLoan.payments.length > 0 ? (
                        detailLoan.payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="text-sm">
                              {new Date(payment.date).toLocaleDateString('es-DO')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {payment.source === "payroll" ? "Nómina" : "Pago Manual"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-accent">
                              RD$ {payment.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6 text-muted-foreground italic">
                            No se han registrado pagos para este préstamo aún.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
