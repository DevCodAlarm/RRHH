"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight, Shield, User, Building2, Users, LogIn } from "lucide-react"
import { useAuth, SEED_USERS, type UserRole } from "@/lib/auth-context"

interface LoginFormProps {
  onQuickSetup: () => void
}

const roleIcons: Record<UserRole, typeof Shield> = {
  admin: Shield,
  rrhh: User,
  supervisor: Building2,
  empleado: Users,
}

const roleColors: Record<UserRole, string> = {
  admin: "from-violet-500/20 to-purple-500/20 border-violet-500/30 hover:border-violet-400/60",
  rrhh: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400/60",
  supervisor: "from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-400/60",
  empleado: "from-emerald-500/20 to-green-500/20 border-emerald-500/30 hover:border-emerald-400/60",
}

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  rrhh: "Recursos Humanos",
  supervisor: "Supervisor",
  empleado: "Empleado",
}

const roleIconColors: Record<UserRole, string> = {
  admin: "text-violet-400",
  rrhh: "text-blue-400",
  supervisor: "text-amber-400",
  empleado: "text-emerald-400",
}

export function LoginForm({ onQuickSetup }: LoginFormProps) {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    // Simular delay para UX
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const success = await login(formData.email, formData.password)
    
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Correo o contraseña incorrectos. Verifica tus credenciales e intenta de nuevo.")
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async (userId: string) => {
    const user = SEED_USERS.find(u => u.id === userId)
    if (!user) return

    setLoadingUserId(userId)
    setError("")

    // Simular delay para UX
    await new Promise(resolve => setTimeout(resolve, 800))

    const success = await login(user.email, user.password)
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Error al iniciar sesión. Intenta de nuevo.")
      setLoadingUserId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Bienvenido de nuevo
        </h2>
        <p className="text-muted-foreground">
          Ingresa tus credenciales o selecciona un usuario para acceder
        </p>
      </div>

      {/* ==========================================
          ACCESO RÁPIDO: 5 Usuarios Realistas
          ========================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Acceso rápido</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 gap-2">
          {SEED_USERS.map((seedUser) => {
            const Icon = roleIcons[seedUser.role]
            const isLoadingThis = loadingUserId === seedUser.id
            return (
              <button
                key={seedUser.id}
                type="button"
                onClick={() => handleQuickLogin(seedUser.id)}
                disabled={loadingUserId !== null}
                className={`relative group w-full p-3 rounded-xl border bg-gradient-to-r ${roleColors[seedUser.role]} transition-all duration-300 text-left hover:shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-background/80 border border-border/50 flex items-center justify-center text-sm font-bold text-foreground">
                      {seedUser.avatar}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-background border border-border/50 flex items-center justify-center`}>
                      <Icon className={`w-2.5 h-2.5 ${roleIconColors[seedUser.role]}`} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{seedUser.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground truncate">{seedUser.position}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/60 text-muted-foreground font-medium border border-border/30">
                        {roleLabels[seedUser.role]}
                      </span>
                    </div>
                  </div>

                  {/* Login arrow / spinner */}
                  <div className="shrink-0">
                    {isLoadingThis ? (
                      <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ==========================================
          FORMULARIO DE LOGIN MANUAL
          ========================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">O ingresa manualmente</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Correo electronico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-11 bg-background border-input"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Contrasena
              </Label>
              <button 
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Olvidaste tu contrasena?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="........"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 pr-10 bg-background border-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Iniciando sesion...
              </div>
            ) : (
              <span className="flex items-center gap-2">
                Iniciar sesion
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        No tienes una cuenta?{" "}
        <button 
          type="button"
          onClick={onQuickSetup}
          className="text-foreground hover:text-foreground/80 font-medium transition-colors"
        >
          Registrate
        </button>
      </p>
    </div>
  )
}
