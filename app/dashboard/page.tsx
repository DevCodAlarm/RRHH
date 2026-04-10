"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react"
import { SmartCalendarPro } from "@/components/calendar/smart-calendar"
import { AnnouncementManager } from "@/components/announcements/announcement-manager"
import { useAuth } from "@/lib/auth-context"
import { PresenceMonitor } from "@/components/security/presence-monitor"
import AnimatedContent from "@/components/animations/AnimatedContent"
import ScrollFloat from "@/components/animations/ScrollFloat"

interface UserSession {
  name: string
  company?: string
}

import { useEmployees } from "@/lib/employees-context"

export default function DashboardPage() {
  const { user: authUser } = useAuth()
  const { activities, requests, loans, employees } = useEmployees()
  const [user, setUser] = useState<UserSession | null>(null)

  useEffect(() => {
    const session = localStorage.getItem("rrhh-session")
    if (session) {
      setUser(JSON.parse(session))
    }
  }, [])

  const stats = [
    {
      title: "Total Empleados",
      value: employees.length.toString(),
      change: "+0",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Nomina Mensual",
      value: employees.reduce((acc, emp) => acc + emp.salary, 0) >= 1000000 
        ? `RD$ ${(employees.reduce((acc, emp) => acc + emp.salary, 0) / 1000000).toFixed(1)}M`
        : `RD$ ${(employees.reduce((acc, emp) => acc + emp.salary, 0)).toLocaleString()}`,
      change: "+0%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Solicitudes Pendientes",
      value: requests.filter(r => r.status === "pending").length.toString(),
      change: "0",
      changeType: "positive" as const,
      icon: FileText,
    },
    {
      title: "Prestamos Activos",
      value: loans.filter(l => l.status === "active").length.toString(),
      change: "0",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-accent" />
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive"
      case "medium":
        return "bg-warning/10 text-warning-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <ScrollFloat containerClassName="mb-1" textClassName="text-foreground">
            {`Bienvenido, ${user?.name || "Usuario"}`}
          </ScrollFloat>
          <p className="text-muted-foreground">
            {user?.company ? `${user.company} - ` : ""}
            Aqui tienes un resumen de tu sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Marzo 2026
          </Button>
          {authUser?.role !== "empleado" && (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <DollarSign className="h-4 w-4" />
              Procesar Nomina
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {(authUser?.role === "empleado"
        ? [
            { 
              title: "Mis Solicitudes", 
              value: requests.filter(r => r.employeeId === authUser.id).length.toString(), 
              change: requests.filter(r => r.employeeId === authUser.id && r.status === "pending").length > 0 ? `+${requests.filter(r => r.employeeId === authUser.id && r.status === "pending").length}` : "0", 
              changeType: "positive" as const, 
              icon: FileText 
            },
            { 
              title: "Mis Prestamos", 
              value: loans.filter(l => l.employeeId === authUser.id).length.toString(), 
              change: loans.filter(l => l.employeeId === authUser.id && l.status === "active").length.toString(), 
              changeType: "positive" as const, 
              icon: TrendingUp 
            },
            { title: "Mi Calendario", value: "Marzo", change: "", changeType: "positive" as const, icon: Calendar },
          ]
        : stats
      ).map((stat) => {
          const Icon = stat.icon
          return (
            <AnimatedContent key={stat.title} distance={50} duration={0.55} ease="power3.out">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {stat.change ? (
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          stat.changeType === "positive" ? "text-accent" : "text-destructive"
                        }`}
                      >
                        {stat.changeType === "positive" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {stat.change}
                      </div>
                    ) : (
                      <div />
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContent>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay actividad reciente.</p>
                  <p className="text-xs">Las acciones que realices aparecerán aquí.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Proximas Tareas</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-6 text-center text-sm text-muted-foreground">
                No hay tareas pendientes para esta semana.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anuncios y Calendario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <Card className="lg:col-span-2 bg-card border-border overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Calendario del Mes</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <SmartCalendarPro />
          </CardContent>
        </Card>

        {/* Anuncios */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <AnnouncementManager userId={authUser?.id || "default-user"} isAdmin={authUser?.role === "admin" || authUser?.role === "rrhh"} />
          </CardContent>
        </Card>
      </div>

      <AnimatedContent distance={40} duration={0.5}>
        <PresenceMonitor />
      </AnimatedContent>
    </div>
  )
}
