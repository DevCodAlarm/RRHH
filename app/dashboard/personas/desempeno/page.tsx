"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { 
  Plus, 
  Search, 
  TrendingUp,
  Star,
  Target,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  BarChart3,
  Shield,
  User
} from "lucide-react"
import { useEmployees } from "@/lib/employees-context"

interface Employee {
  id: string
  name: string
  position: string
  department: string
  avatar?: string
  overallScore: number
  lastReview: string
  nextReview: string
  goals: { completed: number; total: number }
}

interface PerformanceEmployee extends Employee {
  perfId: string
}

interface Goal {
  id: string
  title: string
  description: string
  progress: number
  dueDate: string
  status: "in_progress" | "completed" | "overdue"
}

// No mas mock goals locales

export default function DesempenoPage() {
  const { user, hasPermission } = useAuth()
  const { employees, goals, reviews, addGoal, addReview, updateGoalProgress } = useEmployees()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false)
  const [isNewReviewOpen, setIsNewReviewOpen] = useState(false)
  
  // Estados para formularios
  const [newGoalData, setNewGoalData] = useState({
    employeeId: "",
    title: "",
    description: "",
    dueDate: ""
  })

  const [newReviewData, setNewReviewData] = useState({
    employeeId: "",
    productivity: 5,
    teamwork: 5,
    communication: 5,
    leadership: 5,
    comments: ""
  })

  const performanceEmployees: PerformanceEmployee[] = employees.map((emp: any) => {
    const empGoals = goals.filter(g => g.employeeId === emp.id)
    const empReviews = reviews.filter(r => r.employeeId === emp.id)
    const latestScore = empReviews.length > 0 ? empReviews[0].score : 85

    return {
      ...emp,
      perfId: emp.id,
      overallScore: latestScore,
      lastReview: empReviews.length > 0 ? empReviews[0].date : "Enero 2026",
      nextReview: "Abril 2026",
      goals: { 
        completed: empGoals.filter(g => g.status === "completed").length, 
        total: empGoals.length 
      }
    }
  })

  const filteredEmployees = performanceEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Verificar permiso
  if (!hasPermission("desempeno", "canView")) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Acceso Restringido</h2>
        <p className="text-muted-foreground text-center max-w-md">
          No tienes permisos para acceder al modulo de desempeno.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Volver al Dashboard
        </Button>
      </div>
    )
  }

  const canCreate = hasPermission("desempeno", "canCreate")
  const canApprove = hasPermission("desempeno", "canApprove")
  const isEmployee = user?.role === "empleado"

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  const getGoalStatusBadge = (status: Goal["status"]) => {
    const styles = {
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-emerald-100 text-emerald-800",
      overdue: "bg-red-100 text-red-800",
    }
    const labels = {
      in_progress: "En progreso",
      completed: "Completado",
      overdue: "Vencido",
    }
    return <Badge className={styles[status]}>{labels[status]}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Desempeno</h1>
          <p className="text-muted-foreground">
            {isEmployee ? "Revisa tu desempeno y objetivos" : "Gestiona evaluaciones y objetivos del equipo"}
          </p>
        </div>
        {canCreate && (
          <div className="flex gap-2">
            <Dialog open={isNewGoalOpen} onOpenChange={setIsNewGoalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Nuevo Objetivo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Objetivo</DialogTitle>
                  <DialogDescription>Define un nuevo objetivo para un colaborador</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Colaborador</Label>
                    <Select onValueChange={(val) => setNewGoalData(prev => ({ ...prev, employeeId: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar colaborador" />
                      </SelectTrigger>
                      <SelectContent>
                        {performanceEmployees.map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goalTitle">Titulo del objetivo</Label>
                    <Input id="goalTitle" placeholder="Ej: Completar certificacion" value={newGoalData.title} onChange={(e) => setNewGoalData(prev => ({ ...prev, title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goalDescription">Descripcion</Label>
                    <Textarea id="goalDescription" placeholder="Describe el objetivo..." rows={3} value={newGoalData.description} onChange={(e) => setNewGoalData(prev => ({ ...prev, description: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goalDueDate">Fecha limite</Label>
                    <Input id="goalDueDate" type="date" value={newGoalData.dueDate} onChange={(e) => setNewGoalData(prev => ({ ...prev, dueDate: e.target.value }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewGoalOpen(false)}>Cancelar</Button>
                  <Button onClick={() => {
                    if (!newGoalData.employeeId || !newGoalData.title) return
                    addGoal({
                      ...newGoalData,
                      progress: 0,
                      status: "in_progress"
                    })
                    setIsNewGoalOpen(false)
                    setNewGoalData({ employeeId: "", title: "", description: "", dueDate: "" })
                  }}>Crear Objetivo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isNewReviewOpen} onOpenChange={setIsNewReviewOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Evaluacion
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Crear Evaluacion de Desempeno</DialogTitle>
                  <DialogDescription>Evalua el desempeno de un colaborador</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Colaborador</Label>
                    <Select onValueChange={(val) => setNewReviewData(prev => ({ ...prev, employeeId: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar colaborador" />
                      </SelectTrigger>
                      <SelectContent>
                        {performanceEmployees.map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Productividad (1-10)</Label>
                      <Select onValueChange={(val) => setNewReviewData(prev => ({ ...prev, productivity: Number(val) }))}>
                        <SelectTrigger><SelectValue placeholder="Puntaje" /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Trabajo en equipo (1-10)</Label>
                      <Select onValueChange={(val) => setNewReviewData(prev => ({ ...prev, teamwork: Number(val) }))}>
                        <SelectTrigger><SelectValue placeholder="Puntaje" /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Comunicacion (1-10)</Label>
                      <Select onValueChange={(val) => setNewReviewData(prev => ({ ...prev, communication: Number(val) }))}>
                        <SelectTrigger><SelectValue placeholder="Puntaje" /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Liderazgo (1-10)</Label>
                      <Select onValueChange={(val) => setNewReviewData(prev => ({ ...prev, leadership: Number(val) }))}>
                        <SelectTrigger><SelectValue placeholder="Puntaje" /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Comentarios</Label>
                    <Textarea placeholder="Comentarios adicionales..." rows={3} value={newReviewData.comments} onChange={(e) => setNewReviewData(prev => ({ ...prev, comments: e.target.value }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewReviewOpen(false)}>Cancelar</Button>
                  <Button onClick={() => {
                    if (!newReviewData.employeeId) return
                    addReview(newReviewData)
                    setIsNewReviewOpen(false)
                    setNewReviewData({ employeeId: "", productivity: 5, teamwork: 5, communication: 5, leadership: 5, comments: "" })
                  }}>Guardar Evaluacion</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {employees.length > 0 ? Math.round(performanceEmployees.reduce((acc, e) => acc + e.overallScore, 0) / employees.length) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Promedio General</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{goals.length}</p>
                <p className="text-sm text-muted-foreground">Objetivos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Evaluaciones Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {performanceEmployees.filter(e => e.overallScore >= 90).length}
                </p>
                <p className="text-sm text-muted-foreground">Top Performers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={isEmployee ? "my-goals" : "team"} className="space-y-4">
        <TabsList>
          {isEmployee && <TabsTrigger value="my-goals">Mis Objetivos</TabsTrigger>}
          {isEmployee && <TabsTrigger value="my-reviews">Mis Evaluaciones</TabsTrigger>}
          {!isEmployee && <TabsTrigger value="team">Equipo</TabsTrigger>}
          {!isEmployee && <TabsTrigger value="goals">Objetivos</TabsTrigger>}
          {!isEmployee && <TabsTrigger value="reviews">Evaluaciones</TabsTrigger>}
        </TabsList>

        {/* Team Tab (for supervisors/admins) */}
        {!isEmployee && (
          <TabsContent value="team" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar colaboradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEmployees.map((emp) => (
                <Card key={emp.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-lg font-semibold text-primary">
                          {emp.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-foreground truncate">{emp.name}</h3>
                            <p className="text-sm text-muted-foreground">{emp.position}</p>
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(emp.overallScore)}`}>
                            {emp.overallScore}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            <span>{emp.goals.completed}/{emp.goals.total} objetivos</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Prox: {emp.nextReview}</span>
                          </div>
                        </div>
                        <Progress value={(emp.goals.completed / emp.goals.total) * 100} className="mt-2 h-1.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        {/* Goals Tab */}
        <TabsContent value={isEmployee ? "my-goals" : "goals"} className="space-y-4">
          <div className="space-y-4">
            {(isEmployee ? goals.filter(g => g.employeeId === user?.id) : goals).map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium text-foreground">{goal.title}</h3>
                          {!isEmployee && (
                            <p className="text-xs text-muted-foreground">
                              Para: {employees.find(e => e.id === goal.employeeId)?.name}
                            </p>
                          )}
                        </div>
                        {getGoalStatusBadge(goal.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Fecha limite: {goal.dueDate}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{goal.progress}%</p>
                        <p className="text-xs text-muted-foreground">Progreso</p>
                      </div>
                      {isEmployee && goal.status !== "completed" && (
                         <Button variant="outline" size="sm" onClick={() => updateGoalProgress(goal.id, 100)}>
                            Marcar Completado
                         </Button>
                      )}
                    </div>
                  </div>
                  <Progress value={goal.progress} className="mt-3" />
                </CardContent>
              </Card>
            ))}
            {(isEmployee ? goals.filter(g => g.employeeId === user?.id) : goals).length === 0 && (
              <div className="text-center py-12 text-muted-foreground italic">
                No hay objetivos asignados.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value={isEmployee ? "my-reviews" : "reviews"} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Evaluaciones</CardTitle>
              <CardDescription>Evaluaciones de desempeno realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(isEmployee ? reviews.filter(r => r.employeeId === user?.id) : reviews).map((rev) => (
                  <div key={rev.id} className="p-4 rounded-lg border border-border bg-secondary/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {!isEmployee && `${employees.find(e => e.id === rev.employeeId)?.name} - `}
                          Calificacion: <span className={getScoreColor(rev.score)}>{rev.score}%</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{rev.date}</p>
                        <p className="text-sm mt-2">{rev.comments}</p>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">Prod: {rev.productivity}</Badge>
                        <Badge variant="outline">Team: {rev.teamwork}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
                {(isEmployee ? reviews.filter(r => r.employeeId === user?.id) : reviews).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground italic">
                    No hay evaluaciones registradas en el historial. 
                    {!isEmployee && " Inicia una nueva evaluación desde el botón superior."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
