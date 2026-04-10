"use client"

import { useAuth } from "@/lib/auth-context"
import { SmartCalendarPro } from "@/components/calendar/smart-calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CalendarPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Calendario
        </h1>
        <p className="text-muted-foreground mt-2">
          {user?.role === "empleado" 
            ? "Tu calendario de trabajo y eventos personales" 
            : "Gestionar calendario de empleados y eventos"}
        </p>
      </div>

      {/* Calendario */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>
            {user?.role === "empleado" 
              ? "Mi Calendario" 
              : "Calendario General"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SmartCalendarPro />
        </CardContent>
      </Card>

      {/* Información */}
      {user?.role === "empleado" && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">📌 Tu Calendario</h3>
              <p className="text-sm text-blue-800">
                Aquí puedes ver tus días de trabajo, licencias, días de pago y feriados nacionales.
              </p>
              <p className="text-sm text-blue-800">
                Los eventos son marcados por tu administrador. Si tienes preguntas, contacta con RH.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {(user?.role === "admin" || user?.role === "rrhh") && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-amber-900">📌 Gestión de Calendario</h3>
              <p className="text-sm text-amber-800">
                ✅ Haz clic en cualquier día para marcar como: Trabajado, Licencia, Día de pago, etc.
              </p>
              <p className="text-sm text-amber-800">
                🇩🇴 Los feriados nacionales dominicanos aparecen automáticamente en rojo.
              </p>
              <p className="text-sm text-amber-800">
                📊 Los eventos se guardan automáticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}