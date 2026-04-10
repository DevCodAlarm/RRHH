"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useEmployees } from "@/lib/employees-context"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar,
  Shield,
  FileText,
  Clock,
  DollarSign,
  ArrowLeft,
  User as UserIcon,
  Briefcase,
  CreditCard,
  HeartPulse
} from "lucide-react"

export default function DetalleColaboradorPage() {
  const { id } = useParams()
  const router = useRouter()
  const { getEmployeeById } = useEmployees()
  
  const employee = getEmployeeById(id as string)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-muted-foreground text-lg">Colaborador no encontrado</p>
        <Button onClick={() => router.push("/dashboard/personas/colaboradores")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la lista
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/personas/colaboradores")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Perfil del Colaborador</h1>
            <p className="text-muted-foreground">Detalles completos de la ficha del empleado</p>
          </div>
        </div>
      </div>

      {/* Profile Card Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={employee.avatar} alt={employee.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              <Badge variant={employee.status === "active" ? "default" : "secondary"} className={employee.status === "active" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                {employee.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{employee.name}</h2>
                <p className="text-lg text-muted-foreground font-medium">{employee.position}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{employee.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-foreground">Inici\u00f3 el {employee.startDate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-semibold">RD$ {employee.salary.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="personal" className="flex gap-2">
            <UserIcon className="h-4 w-4" />
            Informacion Personal
          </TabsTrigger>
          <TabsTrigger value="employment" className="flex gap-2">
            <Briefcase className="h-4 w-4" />
            Datos Laborales
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex gap-2">
            <CreditCard className="h-4 w-4" />
            Financiero
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex gap-2">
            <HeartPulse className="h-4 w-4" />
            Salud y Emergencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                Datos de Identidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Nombre Completo</p>
                  <p className="text-base text-foreground">{employee.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">C\u00e9dula de Identidad</p>
                  <p className="text-base text-foreground">{employee.cedula || "No registrada"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Correo Electr\u00f3nico</p>
                  <p className="text-base text-foreground">{employee.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Tel\u00e9fono</p>
                  <p className="text-base text-foreground">{employee.phone}</p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Direcci\u00f3n de Residencia</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <p className="text-base text-foreground">{employee.address || "No registrada"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Informaci\u00f3n del Puesto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Departamento</p>
                  <p className="text-base text-foreground">{employee.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Posici\u00f3n</p>
                  <p className="text-base text-foreground">{employee.position}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Fecha de Ingreso</p>
                  <p className="text-base text-foreground">{employee.startDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Estado de Empleo</p>
                  <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                    {employee.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Datos para Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Salario Bruto Mensual</p>
                  <p className="text-xl font-bold text-accent">RD$ {employee.salary.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Instituci\u00f3n Bancaria</p>
                  <p className="text-base text-foreground">{employee.bankName || "No registrada"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">N\u00famero de Cuenta</p>
                  <p className="text-base font-mono text-foreground">{employee.bankAccount || "No registrada"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                Contactos de Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Nombre de Contacto</p>
                  <p className="text-base text-foreground">{employee.emergencyContact || "No registrado"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Tel\u00e9fono de Emergencia</p>
                  <p className="text-base text-foreground font-medium">{employee.emergencyPhone || "No registrado"}</p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Nota Administrativa</h4>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Esta informaci\u00f3n es confidencial y solo debe ser utilizada en casos de fuerza mayor o para fines administrativos autorizados.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
