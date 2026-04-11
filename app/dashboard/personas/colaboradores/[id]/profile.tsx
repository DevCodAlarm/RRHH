"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useEmployees } from "@/lib/employees-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react"
import { getLogsByUserId } from "@/lib/audit-log"
import { getAllPaymentPlans } from "@/lib/loan-management"

export default function ColaboradorProfilePage() {
  const params = useParams()
  const employeeId = params.id as string
  const { getEmployeeById, loans } = useEmployees()
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  const employee = getEmployeeById(employeeId)
  const employeeLoans = loans.filter(l => l.employeeId === employeeId)
  const employeePaymentPlans = getAllPaymentPlans().filter(p => p.employeeId === employeeId)

  useEffect(() => {
    const logs = getLogsByUserId(employeeId)
    setAuditLogs(logs)
  }, [employeeId])

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
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Empleado no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Perfil del Colaborador</h1>
        <p className="text-muted-foreground">Información detallada y auditoría</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={employee.avatar} alt={employee.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              <Badge className="mt-3" variant={employee.status === "active" ? "default" : "secondary"}>
                {employee.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{employee.name}</h2>
                <p className="text-muted-foreground">{employee.position}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>RD$ {employee.salary.toLocaleString()} / mes</span>
                </div>
                <div className="flex items-center gap-3 text-sm col-span-full">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Desde: {new Date(employee.startDate).toLocaleDateString("es-DO")}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="loans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="loans">Préstamos</TabsTrigger>
          <TabsTrigger value="requests">Solicitudes</TabsTrigger>
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
          <TabsTrigger value="info">Información</TabsTrigger>
        </TabsList>

        {/* Préstamos */}
        <TabsContent value="loans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préstamos del Empleado</CardTitle>
              <CardDescription>Historial y estado actual</CardDescription>
            </CardHeader>
            <CardContent>
              {employeeLoans.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No tiene préstamos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employeeLoans.map(loan => (
                    <div key={loan.id} className="p-4 rounded-lg border border-border space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">Préstamo de RD$ {loan.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Tasa: {loan.interestRate}% | Cuota: RD$ {loan.monthlyPayment.toLocaleString()}
                          </p>
                        </div>
                        <Badge className={loan.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {loan.status === "active" ? "Activo" : loan.status === "completed" ? "Completado" : "Pendiente"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Saldo: RD$ {loan.balance.toLocaleString()} | Plazo: {loan.remainingTerm}/{loan.term} meses
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solicitudes */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes del Empleado</CardTitle>
              <CardDescription>Adelantos, permisos y otras solicitudes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Sistema de solicitudes en desarrollo
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auditoría */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Auditoría</CardTitle>
              <CardDescription>Historial completo de acciones y cambios</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No hay registros de auditoría</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLogs.slice(0, 20).map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors">
                      <div className="mt-1">
                        {log.actionType === "create" && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                        {log.actionType === "update" && <Clock className="h-4 w-4 text-amber-600" />}
                        {log.actionType === "delete" && <AlertCircle className="h-4 w-4 text-red-600" />}
                        {log.actionType === "approve" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {log.actionType === "reject" && <AlertCircle className="h-4 w-4 text-red-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.target} • {new Date(log.createdAt).toLocaleString("es-DO")}
                        </p>
                        {log.metadata?.reason && (
                          <p className="text-xs text-muted-foreground mt-1">{log.metadata.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Información Personal */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cédula</p>
                  <p className="font-medium">{employee.cedula || "No especificada"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                  <p className="font-medium">
                    {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString("es-DO") : "No especificada"}
                  </p>
                </div>
                <div className="col-span-full">
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium">{employee.address || "No especificada"}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-semibold mb-4">Información Bancaria</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Banco</p>
                    <p className="font-medium">{employee.bankName || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Cuenta</p>
                    <p className="font-medium">{employee.bankAccount || "No especificado"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-semibold mb-4">Contacto de Emergencia</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contacto</p>
                    <p className="font-medium">{employee.emergencyContact || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{employee.emergencyPhone || "No especificado"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
