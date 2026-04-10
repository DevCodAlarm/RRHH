"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth, roleDescriptions } from "@/lib/auth-context"
import { useEmployees } from "@/lib/employees-context"
import { 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar,
  Shield,
  FileText,
  Clock,
  DollarSign,
  Edit,
  Save,
  X
} from "lucide-react"

export default function PerfilPage() {
  const { user, updateUserAvatar, updateUserProfile } = useAuth()
  const { getEmployeeById, updateEmployee } = useEmployees()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Obtener datos extendidos del empleado
  const employeeData = user ? getEmployeeById(user.id) : null

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: employeeData?.phone || "",
    address: employeeData?.address || "",
    department: user?.department || "",
    position: user?.position || "",
    cedula: employeeData?.cedula || "",
    bankAccount: employeeData?.bankAccount || "",
    bankName: employeeData?.bankName || "",
    emergencyContact: employeeData?.emergencyContact || "",
    emergencyPhone: employeeData?.emergencyPhone || "",
  })

  // Sincronizar formData cuando cambia el usuario o datos del empleado
  // (útil si hay actualizaciones externas mientras la página está abierta)
  useEffect(() => {
    if (user && employeeData) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: employeeData.phone,
        address: employeeData.address || "",
        department: user.department || "",
        position: user.position || "",
        cedula: employeeData.cedula || "",
        bankAccount: employeeData.bankAccount || "",
        bankName: employeeData.bankName || "",
        emergencyContact: employeeData.emergencyContact || "",
        emergencyPhone: employeeData.emergencyPhone || "",
      }))
    }
  }, [user, employeeData])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateUserAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (!user) return

    // Actualizar identidad (AuthContext)
    updateUserProfile({
      name: formData.name,
      department: formData.department,
      position: formData.position,
    })

    // Actualizar datos de empleado (EmployeesContext)
    updateEmployee(user.id, {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      department: formData.department,
      position: formData.position,
      cedula: formData.cedula,
      bankAccount: formData.bankAccount,
      bankName: formData.bankName,
      emergencyContact: formData.emergencyContact,
      emergencyPhone: formData.emergencyPhone,
    })

    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu informacion personal y preferencias</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <Badge className={roleDescriptions[user.role].color}>
                {roleDescriptions[user.role].name}
              </Badge>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                  <p className="text-muted-foreground">{user.position || roleDescriptions[user.role].name}</p>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user.department || "Sin departamento"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{roleDescriptions[user.role].description}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">Miembro desde Marzo 2026</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informacion Personal</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="payroll">Mi Nomina</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
              <CardDescription>Actualiza tu informacion de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electronico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="809-000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Direccion</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tu direccion"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula</Label>
                  <Input
                    id="cedula"
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    disabled={!isEditing}
                    placeholder="000-0000000-0"
                  />
                </div>
              </div>

              {/* Sección de Banco */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold mb-3">Información Bancaria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Banco</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">No. Cuenta</Label>
                    <Input
                      id="bankAccount"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Contacto de Emergencia */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold mb-3">Contacto de Emergencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Nombre de contacto</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Teléfono de emergencia</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mis Documentos</CardTitle>
              <CardDescription>Documentos laborales y personales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Contrato de trabajo", date: "15 Ene 2026", type: "PDF" },
                  { name: "Cedula de identidad", date: "10 Ene 2026", type: "PDF" },
                  { name: "Certificado de salud", date: "12 Ene 2026", type: "PDF" },
                  { name: "Carta de trabajo", date: "01 Mar 2026", type: "PDF" },
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">Subido: {doc.date}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{doc.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Nomina</CardTitle>
              <CardDescription>Ultimas nominas procesadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { period: "Marzo 2026 - 2da Quincena", amount: "RD$ 45,000.00", status: "Pagado" },
                  { period: "Marzo 2026 - 1ra Quincena", amount: "RD$ 45,000.00", status: "Pagado" },
                  { period: "Febrero 2026 - 2da Quincena", amount: "RD$ 45,000.00", status: "Pagado" },
                  { period: "Febrero 2026 - 1ra Quincena", amount: "RD$ 45,000.00", status: "Pagado" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.period}</p>
                        <p className="text-lg font-semibold text-emerald-600">{item.amount}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Asistencia</CardTitle>
              <CardDescription>Tu historial de entrada y salida</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "31 Mar 2026", entry: "08:00 AM", exit: "05:00 PM", hours: "8h", status: "Completo" },
                  { date: "30 Mar 2026", entry: "08:15 AM", exit: "05:30 PM", hours: "8h 15m", status: "Completo" },
                  { date: "29 Mar 2026", entry: "08:00 AM", exit: "05:00 PM", hours: "8h", status: "Completo" },
                  { date: "28 Mar 2026", entry: "09:00 AM", exit: "05:00 PM", hours: "7h", status: "Tarde" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.date}</p>
                        <p className="text-sm text-muted-foreground">Entrada: {item.entry} - Salida: {item.exit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{item.hours}</p>
                      <Badge className={item.status === "Completo" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
