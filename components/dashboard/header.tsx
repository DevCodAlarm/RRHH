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
import { useAuth, roleDescriptions, SEED_USERS } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useActivityLog } from "@/hooks/use-activity-log"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const { user, logout, login, hasPermission } = useAuth()
  const [isDark, setIsDark] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { activities, unreadCount, markAllRead, clear } = useActivityLog(user?.id)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSwitchUser = (email: string, password: string) => {
    login(email, password)
    router.refresh()
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
    <header
      className="sticky top-0 z-20 h-14"
      style={{
        background: "rgba(240,242,245,0.88)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        borderBottom: "1px solid rgba(10,22,40,0.07)",
      }}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6 gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1">
          <button
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex relative flex-1 max-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar empleados, nóminas..."
              className="pl-9 h-9 text-sm border-border/60 bg-white/60 focus-visible:ring-1 focus-visible:ring-ring/40 rounded-lg"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications */}
          <Sheet
            open={notificationsOpen}
            onOpenChange={(open) => {
              setNotificationsOpen(open)
              if (open) markAllRead()
            }}
          >
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ background: "#0a1628" }}
                />
              )}
            </button>

            <SheetContent
              side="right"
              className="w-[400px] sm:max-w-[400px] will-change-transform"
              style={{ background: "#ffffff", borderLeft: "1px solid #c8d0de" }}
            >
              <SheetHeader className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #e4e8ef" }}>
                <SheetTitle className="text-base font-semibold text-foreground">Notificaciones</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Actividades recientes del sistema
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #e4e8ef" }}>
                <button
                  onClick={clear}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Limpiar todo
                </button>
                <span className="ml-auto text-xs text-muted-foreground">{activities.length} eventos</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {activities.length === 0 ? (
                  <div className="rounded-xl border border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground mt-2">
                    Sin actividades registradas
                  </div>
                ) : (
                  <div className="space-y-1">
                    {activities.slice(0, 120).map((a) => {
                      const { icon: Icon, color, bg } = getActivityConfig(a.type)
                      return (
                        <div
                          key={a.id}
                          className="rounded-xl border border-border bg-white px-3 py-3 hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-1.5 rounded-lg ${bg} shrink-0`}>
                              <Icon className={`h-3.5 w-3.5 ${color}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-medium text-foreground leading-snug line-clamp-2">
                                {a.message}
                              </div>
                              <div className="mt-1 flex items-center justify-between gap-2">
                                <span className="text-[11px] text-muted-foreground truncate">
                                  {a.actor?.name ?? "Sistema"}
                                </span>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(a.ts).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-1" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-secondary transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback
                    className="text-[11px] font-bold"
                    style={{ background: "#0a1628", color: "#4a7fd4" }}
                  >
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-[13px] font-semibold text-foreground leading-none">
                    {user?.name?.split(" ").slice(0, 2).join(" ") || "Usuario"}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                    {user?.role ? roleDescriptions[user.role].name : "Sin rol"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <p className="font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
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
              <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal uppercase tracking-widest">
                Cambiar usuario
              </DropdownMenuLabel>
              {SEED_USERS.map((seedUser) => (
                <DropdownMenuItem
                  key={seedUser.id}
                  onClick={() => handleSwitchUser(seedUser.email, seedUser.password)}
                  className={user?.id === seedUser.id ? "bg-secondary" : ""}
                >
                  <div
                    className="mr-2 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{ background: "#0a1628", color: "#4a7fd4" }}
                  >
                    {seedUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px]">{seedUser.name.split(" ").slice(0, 2).join(" ")}</span>
                    <span className="text-[11px] text-muted-foreground">{roleDescriptions[seedUser.role].name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-foreground">
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
