"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings, 
  Moon, 
  Sun,
  Key,
  UserPlus,
  UserCheck,
  UserX,
  FileText,
  DollarSign,
  Wallet,
  AlertCircle,
  Clock,
  Briefcase
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuth, roleDescriptions } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useActivityLog } from "@/hooks/use-activity-log"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const { user, logout, hasPermission } = useAuth()
  const [isDark, setIsDark] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { activities, unreadCount, markAllRead, clear } = useActivityLog(user?.id)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getActivityConfig = (type: string) => {
    if (type.startsWith("auth.")) return { icon: Key, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" }
    if (type.startsWith("employee.created")) return { icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" }
    if (type.startsWith("employee.deleted")) return { icon: UserX, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" }
    if (type.startsWith("request.")) return { icon: FileText, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" }
    if (type.startsWith("loan.")) return { icon: DollarSign, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" }
    if (type.startsWith("payroll.")) return { icon: Wallet, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30" }
    if (type.startsWith("profile.")) return { icon: Settings, color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-900/30" }
    if (type === "system.alert") return { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" }
    return { icon: Bell, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800" }
  }

  return (
    <header className="sticky top-0 z-20 h-16 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empleados, nominas..."
              className="w-64 lg:w-80 pl-9 h-9 bg-secondary/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <Sheet
            open={notificationsOpen}
            onOpenChange={(open) => {
              setNotificationsOpen(open)
              if (open) markAllRead()
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setNotificationsOpen(true)}
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-foreground rounded-full" />
              )}
            </Button>

            <SheetContent
              side="right"
              className="border-l border-border bg-card w-[420px] sm:max-w-[420px] will-change-transform"
            >
              <SheetHeader className="pr-10">
                <SheetTitle className="text-lg">Notificaciones</SheetTitle>
                <SheetDescription>
                  Panel de actividades del sistema (se actualiza en tiempo real).
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 pb-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clear}
                  className="h-8"
                >
                  Limpiar
                </Button>
                <div className="ml-auto text-xs text-muted-foreground">
                  {activities.length} eventos
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-2 pb-4">
                <div className="space-y-1">
                  {activities.length === 0 ? (
                    <div className="mx-2 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                      Aún no hay actividades registradas.
                    </div>
                  ) : (
                    activities.slice(0, 120).map((a) => {
                      const { icon: Icon, color, bg } = getActivityConfig(a.type)
                      return (
                        <div
                          key={a.id}
                          className="mx-2 rounded-lg border border-border bg-background px-3 py-3 transition-colors hover:bg-secondary/40"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-2 rounded-lg ${bg} shrink-0`}>
                              <Icon className={`h-4 w-4 ${color}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-foreground leading-tight line-clamp-2">
                                {a.message}
                              </div>
                              <div className="mt-1.5 flex items-center justify-between gap-2">
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {a.actor?.name ? `${a.actor.name}${a.actor.role ? ` · ${a.actor.role}` : ""}` : "Sistema"}
                                </div>
                                <div className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(a.ts).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-foreground">{user?.name || "Usuario"}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role ? roleDescriptions[user.role].name : "Sin rol"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              {hasPermission("configuracion", "canView") && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/configuracion">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuracion
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
