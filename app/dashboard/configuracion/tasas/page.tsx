"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Save,
  RefreshCw,
  Percent,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock
} from "lucide-react"
import {
  DEFAULT_NOMINA_CONFIG,
  getConfigNomina,
  habilitarEdicionConfig,
  isConfigEditable,
  saveConfigNomina,
  bloquearEdicionConfig,
} from "@/lib/nomina"

export default function TasasPage() {
  const [config, setConfig] = useState(DEFAULT_NOMINA_CONFIG)
  const [editable, setEditable] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saved, setSaved] = useState(false)
  const isLocked = useMemo(() => !editable, [editable])

  useEffect(() => {
    const cfg = getConfigNomina()
    setConfig(cfg)
    setEditable(isConfigEditable())
  }, [])

  const handleSave = () => {
    try {
      saveConfigNomina(config)
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      alert(e?.message || "No se pudo guardar la configuración.")
    }
  }

  const handleReset = () => {
    setConfig(structuredClone(DEFAULT_NOMINA_CONFIG))
    setHasChanges(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tasas y Retenciones</h1>
          <p className="text-muted-foreground">Configura las tasas de aportes e impuestos</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (editable) {
                bloquearEdicionConfig()
                setEditable(false)
              } else {
                const ok = habilitarEdicionConfig()
                if (ok) setEditable(true)
              }
            }}
            className="gap-2"
          >
            {editable ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {editable ? "Edición habilitada" : "Habilitar edición"}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Restaurar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Status */}
      {saved && (
        <Card className="bg-accent/10 border-accent">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            <span className="text-accent font-medium">Configuracion guardada exitosamente</span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AFP */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              AFP - Administradora de Fondos de Pensiones
            </CardTitle>
            <CardDescription>Configuracion de aportes al fondo de pensiones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="afp-employee">Aporte Empleado (%)</Label>
                <Input
                  id="afp-employee"
                  type="number"
                  step="0.01"
                  disabled={isLocked}
                  value={config.afp.empleado}
                  onChange={(e) => {
                    setConfig({ ...config, afp: { ...config.afp, empleado: parseFloat(e.target.value) } })
                    setHasChanges(true)
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="afp-employer">Aporte Empleador (%)</Label>
                <Input
                  id="afp-employer"
                  type="number"
                  step="0.01"
                  disabled={isLocked}
                  value={config.afp.empleador}
                  onChange={(e) => {
                    setConfig({ ...config, afp: { ...config.afp, empleador: parseFloat(e.target.value) } })
                    setHasChanges(true)
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="afp-ceiling">Tope Salarial (RD$)</Label>
              <Input
                id="afp-ceiling"
                type="number"
                disabled={isLocked}
                value={config.afp.tope}
                onChange={(e) => {
                  setConfig({ ...config, afp: { ...config.afp, tope: parseInt(e.target.value) } })
                  setHasChanges(true)
                }}
              />
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
              Total AFP: {(Number(config.afp.empleado) + Number(config.afp.empleador)).toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        {/* SFS */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Percent className="h-5 w-5 text-accent" />
              SFS - Seguro Familiar de Salud
            </CardTitle>
            <CardDescription>Configuracion de aportes al seguro de salud</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sfs-employee">Aporte Empleado (%)</Label>
                <Input
                  id="sfs-employee"
                  type="number"
                  step="0.01"
                  disabled={isLocked}
                  value={config.sfs.empleado}
                  onChange={(e) => {
                    setConfig({ ...config, sfs: { ...config.sfs, empleado: parseFloat(e.target.value) } })
                    setHasChanges(true)
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sfs-employer">Aporte Empleador (%)</Label>
                <Input
                  id="sfs-employer"
                  type="number"
                  step="0.01"
                  disabled={isLocked}
                  value={config.sfs.empleador}
                  onChange={(e) => {
                    setConfig({ ...config, sfs: { ...config.sfs, empleador: parseFloat(e.target.value) } })
                    setHasChanges(true)
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sfs-ceiling">Tope Salarial (RD$)</Label>
              <Input
                id="sfs-ceiling"
                type="number"
                disabled={isLocked}
                value={config.sfs.tope}
                onChange={(e) => {
                  setConfig({ ...config, sfs: { ...config.sfs, tope: parseInt(e.target.value) } })
                  setHasChanges(true)
                }}
              />
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
              Total SFS: {(Number(config.sfs.empleado) + Number(config.sfs.empleador)).toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        {/* ISR */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-chart-3" />
              ISR - Impuesto Sobre la Renta
            </CardTitle>
            <CardDescription>Tabla de tasas por tramos de ingresos anuales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tramo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Desde (RD$)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hasta (RD$)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tasa</th>
                  </tr>
                </thead>
                <tbody>
                  {config.isr.map((bracket, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 font-medium text-foreground">Tramo {idx + 1}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {Number(bracket.desde) === 0 ? "RD$ 0" : `RD$ ${Number(bracket.desde).toLocaleString()}`}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {bracket.hasta === Infinity ? "Sin limite" : `RD$ ${Number(bracket.hasta).toLocaleString()}`}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${Number(bracket.tasa) === 0 ? 'text-accent' : 'text-foreground'}`}>
                          {Number(bracket.tasa)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-chart-3/10 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-chart-3 shrink-0 mt-0.5" />
              <p className="text-sm text-chart-3">
                Las tasas de ISR son establecidas por la DGII. Asegurate de mantener estos valores actualizados segun la legislacion vigente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ARL */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">ARL - Riesgos Laborales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="arl">Tasa Empleador (%)</Label>
              <Input
                id="arl"
                type="number"
                step="0.01"
                disabled={isLocked}
                value={config.arl.empleador}
                onChange={(e) => {
                  setConfig({ ...config, arl: { empleador: parseFloat(e.target.value) } })
                  setHasChanges(true)
                }}
              />
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
              Esta tasa se aplica al <span className="text-foreground font-medium">bruto</span> (aporte empleador).
            </div>
          </CardContent>
        </Card>

        {/* Auto-calculation */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Configuracion Automatica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Calculo automatico ISR</p>
                <p className="text-sm text-muted-foreground">Aplicar tabla de ISR automaticamente</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Validar topes salariales</p>
                <p className="text-sm text-muted-foreground">Alertar cuando se exceda el tope</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Redondeo automatico</p>
                <p className="text-sm text-muted-foreground">Redondear centavos en nomina</p>
              </div>
              <Switch />
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
              Estado:{" "}
              <span className="text-foreground font-medium">
                {editable ? "Edición habilitada (puedes modificar y guardar)" : "Bloqueado (solo lectura)"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
