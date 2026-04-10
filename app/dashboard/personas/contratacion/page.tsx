"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Users,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Shield,
  UserPlus
} from "lucide-react"

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  status: "pending" | "interview" | "offered" | "hired" | "rejected"
  appliedDate: string
  experience: string
  education: string
}

const mockCandidates: Candidate[] = []

const jobOpenings: any[] = []

export default function ContratacionPage() {
  const { hasPermission } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isNewJobOpen, setIsNewJobOpen] = useState(false)

  // Verificar permiso
  if (!hasPermission("contratacion", "canView")) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Acceso Restringido</h2>
        <p className="text-muted-foreground text-center max-w-md">
          No tienes permisos para acceder al modulo de contratacion.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Volver al Dashboard
        </Button>
      </div>
    )
  }

  const canCreate = hasPermission("contratacion", "canCreate")
  const canApprove = hasPermission("contratacion", "canApprove")

  const getStatusBadge = (status: Candidate["status"]) => {
    const styles = {
      pending: "bg-amber-100 text-amber-800",
      interview: "bg-blue-100 text-blue-800",
      offered: "bg-purple-100 text-purple-800",
      hired: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    }
    const labels = {
      pending: "Pendiente",
      interview: "Entrevista",
      offered: "Oferta",
      hired: "Contratado",
      rejected: "Rechazado",
    }
    return <Badge className={styles[status]}>{labels[status]}</Badge>
  }

  const filteredCandidates = mockCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: mockCandidates.length,
    pending: mockCandidates.filter(c => c.status === "pending").length,
    interview: mockCandidates.filter(c => c.status === "interview").length,
    hired: mockCandidates.filter(c => c.status === "hired").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Contratacion</h1>
          <p className="text-muted-foreground">Gestiona el proceso de reclutamiento y seleccion</p>
        </div>
        {canCreate && (
          <Dialog open={isNewJobOpen} onOpenChange={setIsNewJobOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Vacante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Nueva Vacante</DialogTitle>
                <DialogDescription>Publica una nueva posicion disponible</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Titulo del puesto</Label>
                  <Input id="jobTitle" placeholder="Ej: Analista de RRHH" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobDepartment">Departamento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rrhh">Recursos Humanos</SelectItem>
                      <SelectItem value="tech">Tecnologia</SelectItem>
                      <SelectItem value="finance">Finanzas</SelectItem>
                      <SelectItem value="sales">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Descripcion</Label>
                  <Textarea id="jobDescription" placeholder="Describe las responsabilidades..." rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobSalary">Salario</Label>
                    <Input id="jobSalary" placeholder="RD$ 50,000 - 70,000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de contrato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fulltime">Tiempo completo</SelectItem>
                        <SelectItem value="parttime">Medio tiempo</SelectItem>
                        <SelectItem value="contract">Por contrato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewJobOpen(false)}>Cancelar</Button>
                <Button onClick={() => setIsNewJobOpen(false)}>Publicar Vacante</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Candidatos</p>
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
                <p className="text-2xl font-semibold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.interview}</p>
                <p className="text-sm text-muted-foreground">Entrevistas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.hired}</p>
                <p className="text-sm text-muted-foreground">Contratados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="candidates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="candidates">Candidatos</TabsTrigger>
          <TabsTrigger value="jobs">Vacantes</TabsTrigger>
        </TabsList>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar candidatos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="interview">Entrevista</SelectItem>
                <SelectItem value="offered">Oferta</SelectItem>
                <SelectItem value="hired">Contratado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Candidates List */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredCandidates.map((candidate) => (
                  <div 
                    key={candidate.id} 
                    className="p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-lg font-semibold text-primary">
                            {candidate.name.charAt(0)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-foreground">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.position}</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {candidate.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {candidate.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(candidate.status)}
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedCandidate(candidate)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canApprove && candidate.status === "interview" && (
                            <>
                              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobOpenings.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription>{job.department}</CardDescription>
                    </div>
                    <Badge className={job.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}>
                      {job.status === "active" ? "Activa" : "Cerrada"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {job.applicants} aplicaciones
                    </div>
                    <Button variant="outline" size="sm">Ver candidatos</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Candidate Detail Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Candidato</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">
                    {selectedCandidate.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedCandidate.name}</h3>
                  <p className="text-muted-foreground">{selectedCandidate.position}</p>
                  {getStatusBadge(selectedCandidate.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedCandidate.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telefono</p>
                  <p className="font-medium">{selectedCandidate.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Departamento</p>
                  <p className="font-medium">{selectedCandidate.department}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha de aplicacion</p>
                  <p className="font-medium">{selectedCandidate.appliedDate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Experiencia</p>
                  <p className="font-medium">{selectedCandidate.experience}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Educacion</p>
                  <p className="font-medium">{selectedCandidate.education}</p>
                </div>
              </div>
              {canApprove && (
                <DialogFooter>
                  <Button variant="outline" className="text-red-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Avanzar proceso
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
