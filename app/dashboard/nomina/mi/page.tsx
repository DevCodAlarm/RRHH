"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useEmployees } from "@/lib/employees-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatCompactCurrency } from "@/lib/format"
import { initNominaStorage, getNominaActual, onNominaUpdated } from "@/lib/nomina"
import { Calendar, DollarSign, HandCoins } from "lucide-react"

type SolicitudLocal = {
  id: string
  employee: string
  type: string
  title: string
  description: string
  startDate: string | null
  endDate: string | null
  days: number | null
  status: "pending" | "approved" | "rejected"
  createdAt: string
  avatar: string
  meta?: Record<string, unknown>
}

const SOLICITUDES_KEY = "rrhh_solicitudes"

function readJSON<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return structuredClone(fallback)
  try {
    return JSON.parse(raw) as T
  } catch {
    return structuredClone(fallback)
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function nowISO() {
  return new Date().toISOString()
}

function makeId(prefix = "id") {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`
}

export default function MiNominaPage() {
  const { user } = useAuth()
  const { employees: directory } = useEmployees()
  const [state, setState] = useState(() => getNominaActual())
  const [open, setOpen] = useState(false)
  const [monto, setMonto] = useState("")
  const [motivo, setMotivo] = useState("")

  useEffect(() => {
    initNominaStorage()
    setState(getNominaActual())
    const unsub = onNominaUpdated(() => setState(getNominaActual()))
    return () => unsub()
  }, [])

  const periodo = state?.periodo
  const empleados = state?.resultado?.empleados ?? []

  const empleadoNomina = useMemo(() => {
    if (!user) return null
    const byName = empleados.find((e) => e.nombre.toLowerCase() === user.name.toLowerCase())
    if (byName) return byName
    // fallback: si no existe en nómina demo, al menos muestra su salario base desde directorio
    const dir = directory.find((e) => e.email === user.email) ?? directory.find((e) => e.name === user.name)
    if (!dir) return null
    return {
      id: `emp-${user.id}`,
      nombre: user.name,
      bruto: dir.salary / 2,
      afp: 0,
      sfs: 0,
      isr: 0,
      otrosDescuentos: 0,
      totalDescuentos: 0,
      neto: dir.salary / 2,
      aportes: { afpEmpleador: 0, sfsEmpleador: 0, arl: 0 },
      costoEmpresa: dir.salary / 2,
      detalles: {
        sueldoQuincenal: dir.salary / 2,
        salarioDiario: dir.salary / 23.83,
        descuentoAusencia: 0,
        ingresosAdicionales: 0,
        salarioCotizable: dir.salary / 2,
      },
    }
  }, [directory, empleados, user])

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mi Nómina</h1>
          <p className="text-muted-foreground">Tus ingresos, deducciones y neto del período actual</p>
        </div>
        <Badge variant="outline" className="gap-2 py-1.5">
          <Calendar className="h-4 w-4" />
          {periodo ? `${periodo.inicio} - ${periodo.fin}` : "—"}
        </Badge>
      </div>

      {!empleadoNomina ? (
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-sm text-muted-foreground">
            No encontramos datos de nómina para tu usuario todavía.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/10 text-chart-3">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bruto</p>
                    <p className="text-xl font-semibold text-foreground">{formatCompactCurrency(empleadoNomina.bruto)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">AFP</div>
                <div className="mt-1 text-lg font-semibold text-destructive">- {formatCompactCurrency(empleadoNomina.afp)}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">SFS</div>
                <div className="mt-1 text-lg font-semibold text-destructive">- {formatCompactCurrency(empleadoNomina.sfs)}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Neto</div>
                <div className="mt-1 text-lg font-semibold text-accent">{formatCompactCurrency(empleadoNomina.neto)}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Detalle</CardTitle>
              <CardDescription>Valores calculados (quincenal)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Sueldo quincenal</div>
                  <div className="mt-1 font-semibold text-foreground">{formatCompactCurrency(empleadoNomina.detalles.sueldoQuincenal)}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Ingresos adicionales</div>
                  <div className="mt-1 font-semibold text-foreground">{formatCompactCurrency(empleadoNomina.detalles.ingresosAdicionales)}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Descuento por ausencias</div>
                  <div className="mt-1 font-semibold text-foreground">{formatCompactCurrency(empleadoNomina.detalles.descuentoAusencia)}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">ISR</div>
                  <div className="mt-1 font-semibold text-destructive">- {formatCompactCurrency(empleadoNomina.isr)}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Otros descuentos</div>
                  <div className="mt-1 font-semibold text-destructive">- {formatCompactCurrency(empleadoNomina.otrosDescuentos)}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs text-muted-foreground">Total descuentos</div>
                  <div className="mt-1 font-semibold text-destructive">- {formatCompactCurrency(empleadoNomina.totalDescuentos)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <HandCoins className="h-4 w-4" />
                Solicitar adelanto de nómina
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Solicitud de Adelanto</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4 mt-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const amount = Number(monto)
                  if (!Number.isFinite(amount) || amount <= 0) return alert("Monto inválido.")
                  if (amount > empleadoNomina.neto) return alert("El monto no puede ser mayor que tu neto estimado.")

                  const all = readJSON<SolicitudLocal[]>(SOLICITUDES_KEY, [])
                  const req: SolicitudLocal = {
                    id: makeId("sol"),
                    employee: user.name,
                    type: "payroll_advance",
                    title: "Adelanto de nómina",
                    description: motivo || "Solicitud de adelanto de nómina",
                    startDate: null,
                    endDate: null,
                    days: null,
                    status: "pending",
                    createdAt: nowISO(),
                    avatar: user.name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase(),
                    meta: { amount },
                  }
                  all.unshift(req)
                  writeJSON(SOLICITUDES_KEY, all)
                  setOpen(false)
                  setMonto("")
                  setMotivo("")
                  alert("Solicitud enviada. Puedes verla en Solicitudes.")
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto (RD$)</Label>
                  <Input id="monto" type="number" value={monto} onChange={(e) => setMonto(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo</Label>
                  <Textarea id="motivo" rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground">
                    Enviar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

