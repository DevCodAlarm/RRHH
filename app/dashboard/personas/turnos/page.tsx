"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Clock, Users, Sun, Moon, Coffee } from "lucide-react"

const shifts = [
  {
    id: 1,
    name: "Turno Matutino",
    startTime: "08:00",
    endTime: "16:00",
    breakDuration: 60,
    employees: 45,
    color: "bg-chart-3",
    icon: Sun
  },
  {
    id: 2,
    name: "Turno Vespertino",
    startTime: "14:00",
    endTime: "22:00",
    breakDuration: 60,
    employees: 32,
    color: "bg-chart-4",
    icon: Coffee
  },
  {
    id: 3,
    name: "Turno Nocturno",
    startTime: "22:00",
    endTime: "06:00",
    breakDuration: 45,
    employees: 18,
    color: "bg-chart-1",
    icon: Moon
  },
]

import { useEmployees } from "@/lib/employees-context"

const weekDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

export default function TurnosPage() {
  const { user } = useAuth()
  const { employees } = useEmployees()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Generar datos de turnos dinámicos basados en la lista de empleados
  const scheduleData = employees.map((emp, idx) => ({
    id: emp.id,
    employee: emp.name,
    shifts: idx % 2 === 0 ? [1, 1, 1, 1, 1, 0, 0] : [2, 2, 2, 2, 2, 0, 0] // Asignación de turnos mock
  }))

  const getShiftBadge = (shiftId: number) => {
    if (shiftId === 0) return <span className="text-muted-foreground">-</span>
    const shift = shifts.find(s => s.id === shiftId)
    if (!shift) return null
    return (
      <Badge className={`${shift.color} text-white text-xs`}>
        {shift.startTime}
      </Badge>
    )
  }

  // Filtrar turnos según el rol del usuario
  const getDisplaySchedule = () => {
    if (user?.role === "empleado") {
      // Mostrar solo el turno del empleado actual
      // En una app real, esto vendría del servidor/database
      // Por ahora usamos el primer empleado como demo
      return scheduleData.filter(s => s.id === user?.id || scheduleData.length === 5)?.slice(0, 1)
    }
    // Admin/RRHH ven todos
    return scheduleData
  }

  const displaySchedule = getDisplaySchedule()
  const isEmployee = user?.role === "empleado"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEmployee ? "Mis Turnos" : "Turnos"}
          </h1>
          <p className="text-muted-foreground">
            {isEmployee 
              ? "Tu horario de trabajo actual"
              : "Gestiona los horarios de trabajo de tu equipo"}
          </p>
        </div>
        {!isEmployee && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Turno
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Turno</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="shiftName">Nombre del Turno</Label>
                <Input id="shiftName" placeholder="Turno Especial" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Hora Inicio</Label>
                  <Input id="startTime" type="time" defaultValue="08:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Hora Fin</Label>
                  <Input id="endTime" type="time" defaultValue="16:00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="breakTime">Tiempo de Descanso (minutos)</Label>
                <Input id="breakTime" type="number" defaultValue="60" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  Crear Turno
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Shift Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shifts.map((shift) => {
          const Icon = shift.icon
          const count = scheduleData.filter(s => s.shifts.includes(shift.id)).length
          return (
            <Card key={shift.id} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${shift.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {count} {count === 1 ? 'empleado' : 'empleados'}
                  </Badge>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-foreground">{shift.name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {shift.startTime} - {shift.endTime}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Descanso: {shift.breakDuration} min
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Weekly Schedule */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Horario Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Empleado</th>
                  {weekDays.map((day) => (
                    <th key={day} className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displaySchedule.map((row, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 font-medium text-foreground">{row.employee}</td>
                    {row.shifts.map((shiftId, dayIdx) => (
                      <td key={dayIdx} className="py-3 px-2 text-center">
                        {getShiftBadge(shiftId)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
