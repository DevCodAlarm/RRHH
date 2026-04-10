"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, User, Building2, Shield, Users } from "lucide-react"
import { useAuth, UserRole, roleDescriptions, rolePermissions } from "@/lib/auth-context"

interface QuickUserSetupProps {
  onBack: () => void
}

const roles: { id: UserRole; label: string; description: string; icon: typeof Shield; permissions: string[] }[] = [
  { 
    id: "admin", 
    label: "Administrador", 
    description: "Acceso completo al sistema",
    icon: Shield,
    permissions: ["Todo el sistema", "Crear/Editar/Eliminar", "Aprobar todo"]
  },
  { 
    id: "rrhh", 
    label: "RRHH", 
    description: "Gestion de personal y nomina",
    icon: User,
    permissions: ["Colaboradores", "Nomina", "Prestamos", "Solicitudes"]
  },
  { 
    id: "supervisor", 
    label: "Supervisor", 
    description: "Aprobaciones y reportes de equipo",
    icon: Building2,
    permissions: ["Ver colaboradores", "Desempeno", "Aprobar solicitudes"]
  },
  { 
    id: "empleado", 
    label: "Empleado", 
    description: "Acceso limitado a informacion personal",
    icon: Users,
    permissions: ["Mi perfil", "Mis solicitudes", "Mi historial"]
  },
]

export function QuickUserSetup({ onBack }: QuickUserSetupProps) {
  const router = useRouter()
  const { createQuickUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "admin" as UserRole,
    password: ""
  })

  const handleContinue = () => {
    if (step < 2) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simular creacion
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Crear usuario con el contexto de auth
    createQuickUser(formData.name, formData.email, formData.role)
    
    router.push("/dashboard")
  }

  const selectedRole = roles.find(r => r.id === formData.role)

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio de sesion
      </button>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Configuracion rapida
        </h2>
        <p className="text-muted-foreground">
          Crea tu cuenta en segundos y comienza a gestionar tu equipo
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-secondary'}`} />
        <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre completo
              </Label>
              <Input
                id="name"
                placeholder="Juan Perez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electronico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11 bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">
                Nombre de la empresa
              </Label>
              <Input
                id="company"
                placeholder="Mi Empresa SRL"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="h-11 bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contrasena
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimo 8 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 bg-background"
                required
                minLength={8}
              />
            </div>

            <Button
              type="button"
              onClick={handleContinue}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!formData.name || !formData.email || !formData.company || !formData.password}
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <Label className="text-sm font-medium">
                Selecciona tu rol
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                El rol determina a que partes del sistema tendras acceso
              </p>
            </div>
            
            <div className="space-y-3">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      formData.role === role.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 bg-background"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        formData.role === role.id 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-secondary-foreground"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{role.label}</span>
                          {formData.role === role.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {role.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {role.permissions.map((perm, idx) => (
                            <span key={idx} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-11"
              >
                Atras
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creando...
                  </div>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </div>
          </div>
        )}
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Al crear una cuenta, aceptas nuestros{" "}
        <a href="#" className="text-primary hover:underline">terminos de servicio</a>
        {" "}y{" "}
        <a href="#" className="text-primary hover:underline">politica de privacidad</a>
      </p>
    </div>
  )
}
