"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { 
  Building2, 
  Globe, 
  Bell, 
  Lock, 
  Palette,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Shield
} from "lucide-react"

export default function ConfiguracionPage() {
  const { user, hasPermission } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [companyData, setCompanyData] = useState({
    name: "Mi Empresa SRL",
    rnc: "123-45678-9",
    email: "info@miempresa.com",
    phone: "809-555-0100",
    address: "Santo Domingo, Republica Dominicana",
    website: "www.miempresa.com"
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    payrollReminder: true,
    requestAlerts: true,
    weeklyReport: false
  })

  // Verificar permiso
  if (!hasPermission("configuracion", "canView")) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Acceso Restringido</h2>
        <p className="text-muted-foreground text-center max-w-md">
          No tienes permisos para acceder a la configuracion del sistema. 
          Contacta a un administrador si necesitas acceso.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Volver al Dashboard
        </Button>
      </div>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Configuracion</h1>
          <p className="text-muted-foreground">Administra la configuracion general del sistema</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">
            <Building2 className="h-4 w-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informacion de la Empresa</CardTitle>
              <CardDescription>Datos generales de tu empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 pb-4 border-b border-border">
                <div className="w-24 h-24 rounded-lg bg-secondary flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">PNG, JPG hasta 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la empresa</Label>
                  <Input
                    id="companyName"
                    value={companyData.name}
                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rnc">RNC</Label>
                  <Input
                    id="rnc"
                    value={companyData.rnc}
                    onChange={(e) => setCompanyData({ ...companyData, rnc: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Correo electronico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyEmail"
                      className="pl-10"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyPhone"
                      className="pl-10"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyAddress">Direccion</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyAddress"
                      className="pl-10"
                      value={companyData.address}
                      onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Sitio web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyWebsite"
                      className="pl-10"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>Configura como y cuando recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por correo</Label>
                  <p className="text-sm text-muted-foreground">Recibir notificaciones via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones push</Label>
                  <p className="text-sm text-muted-foreground">Notificaciones en el navegador</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorio de nomina</Label>
                  <p className="text-sm text-muted-foreground">Alertas antes del cierre de nomina</p>
                </div>
                <Switch
                  checked={notifications.payrollReminder}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, payrollReminder: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de solicitudes</Label>
                  <p className="text-sm text-muted-foreground">Nuevas solicitudes pendientes</p>
                </div>
                <Switch
                  checked={notifications.requestAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, requestAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reporte semanal</Label>
                  <p className="text-sm text-muted-foreground">Resumen semanal por email</p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tema y Apariencia</CardTitle>
              <CardDescription>Personaliza la apariencia del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Tema</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-4 rounded-lg border-2 border-primary bg-primary/5 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded bg-white border border-border" />
                    <span className="text-sm font-medium">Claro</span>
                  </button>
                  <button className="p-4 rounded-lg border-2 border-border hover:border-primary/50 flex flex-col items-center gap-2 transition-colors">
                    <div className="w-8 h-8 rounded bg-slate-900" />
                    <span className="text-sm font-medium">Oscuro</span>
                  </button>
                  <button className="p-4 rounded-lg border-2 border-border hover:border-primary/50 flex flex-col items-center gap-2 transition-colors">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-white to-slate-900" />
                    <span className="text-sm font-medium">Sistema</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Color de acento</Label>
                <div className="flex gap-3">
                  {["#0066FF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"].map((color) => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded-full border-2 border-transparent hover:border-foreground/50 transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Configura las opciones de seguridad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Cambiar contrasena</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input type="password" placeholder="Contrasena actual" />
                  <Input type="password" placeholder="Nueva contrasena" />
                </div>
                <Button variant="outline" size="sm">Actualizar contrasena</Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="space-y-0.5">
                  <Label>Autenticacion de dos factores</Label>
                  <p className="text-sm text-muted-foreground">Agrega una capa extra de seguridad</p>
                </div>
                <Button variant="outline" size="sm">Configurar</Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="space-y-0.5">
                  <Label>Sesiones activas</Label>
                  <p className="text-sm text-muted-foreground">Administra tus sesiones abiertas</p>
                </div>
                <Button variant="outline" size="sm">Ver sesiones</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
