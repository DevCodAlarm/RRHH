"use client"

import { useMemo } from "react"
import { AlertTriangle, Camera, CheckCircle2, MapPin, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePresence } from "@/lib/presence-context"

export function PresenceMonitor() {
  const { score, events, isChecking, inGeofence, hasAlert, rolePolicy, requestPresenceCheck } = usePresence()

  const latest = events[0]
  const badgeVariant = hasAlert ? "destructive" : "secondary"

  const triggerLabel = useMemo(() => {
    if (!latest) return "Sin validaciones"
    if (latest.trigger === "login") return "Login"
    if (latest.trigger === "hourly") return "Revision horaria"
    return "Revision manual"
  }, [latest])

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Score de Presencia</CardTitle>
          <Badge variant={badgeVariant}>{hasAlert ? "Alerta < 95" : "Normal"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Score actual</p>
            <p className="text-2xl font-semibold">{score}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Geocerca</p>
            <p className="text-sm font-medium flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4" />
              {inGeofence === null ? "Pendiente" : inGeofence ? "Dentro del area" : "Fuera del area"}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Autorreconocimiento facial</p>
            <p className="text-sm font-medium flex items-center gap-2 mt-1">
              <Camera className="h-4 w-4" />
              {latest ? `${latest.facialScore}%` : "Sin lectura"}
            </p>
          </div>
        </div>

        {rolePolicy && (
          <div className="text-xs text-muted-foreground rounded-lg border p-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Frecuencia segun rol: cada {rolePolicy.checkIntervalMinutes} min. Score minimo: {rolePolicy.minimumScore}
          </div>
        )}

        {hasAlert && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive p-3 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            El score bajo de 95. Notificar a RRHH y supervisor.
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Ultima revision: {latest ? `${new Date(latest.timestamp).toLocaleString()} (${triggerLabel})` : "N/A"}
          </div>
          <Button onClick={() => void requestPresenceCheck("manual")} disabled={isChecking}>
            {isChecking ? "Validando..." : "Validar ahora"}
          </Button>
        </div>

        {events.length > 0 && (
          <div className="space-y-2">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                <span className="text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                <span className="flex items-center gap-1">
                  {event.geofenceOk ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                  {event.confidenceScore}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
