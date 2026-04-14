"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  X,
  Building2,
  Clock,
  UserCheck,
  TrendingUp,
  FileSpreadsheet,
  Shield,
  CalendarDays,
  ChevronDown,
  LucideIcon,
  Wallet,
  Stethoscope,
  Laptop
} from "lucide-react"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

interface NavItemType {
  name: string
  href?: string
  icon: LucideIcon
  permission?: string
  children?: NavItemType[]
}

const navigation: NavItemType[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { name: "Calendario", href: "/dashboard/calendario", icon: CalendarDays, permission: "dashboard" },
  {
    name: "Personas", icon: Users,
    children: [
      { name: "Colaboradores", href: "/dashboard/personas/colaboradores", icon: Users, permission: "colaboradores" },
      { name: "Turnos", href: "/dashboard/personas/turnos", icon: Clock, permission: "turnos" },
      { name: "Organigrama", href: "/dashboard/personas/organigrama", icon: Building2, permission: "organigrama" },
      { name: "Contratacion", href: "/dashboard/personas/contratacion", icon: UserCheck, permission: "contratacion" },
      { name: "Desempeno", href: "/dashboard/personas/desempeno", icon: TrendingUp, permission: "desempeno" },
    ],
  },
  {
    name: "Nomina", icon: DollarSign,
    children: [
      { name: "Mi Nómina", href: "/dashboard/nomina/mi", icon: DollarSign, permission: "mi_nomina" },
      { name: "Periodos", href: "/dashboard/nomina/periodos", icon: Calendar, permission: "periodos" },
      { name: "Procesar", href: "/dashboard/nomina/procesar", icon: FileSpreadsheet, permission: "procesar" },
      { name: "Historial", href: "/dashboard/nomina/historial", icon: FileText, permission: "historial" },
    ],
  },
  {
    name: "Solicitudes", icon: FileText,
    children: [
      { name: "Vacaciones", href: "/dashboard/solicitudes/vacaciones", icon: Calendar, permission: "solicitudes" },
      { name: "Adelantos de Nómina", href: "/dashboard/solicitudes/adelantos", icon: Wallet, permission: "solicitudes" },
      { name: "Permisos", href: "/dashboard/solicitudes/permisos", icon: Clock, permission: "solicitudes" },
      { name: "Licencia Médica", href: "/dashboard/solicitudes/licencias", icon: Stethoscope, permission: "solicitudes" },
      { name: "Equipo", href: "/dashboard/solicitudes/equipo", icon: Laptop, permission: "solicitudes" },
      { name: "Prestamos", href: "/dashboard/prestamos", icon: CreditCard, permission: "prestamos" },
    ],
  },
  { name: "Declaraciones", href: "/dashboard/declaraciones", icon: FileSpreadsheet, permission: "declaraciones" },
  { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3, permission: "reportes" },
]

const bottomNavigation: NavItemType[] = [
  {
    name: "Administracion", icon: Shield,
    permission: "roles",
    children: [
      { name: "Aprobación de Préstamos", href: "/dashboard/admin/prestamos-solicitudes", icon: CreditCard, permission: "prestamos" },
    ],
  },
  {
    name: "Configuracion", icon: Settings,
    children: [
      { name: "General", href: "/dashboard/configuracion", icon: Settings, permission: "configuracion" },
      { name: "Tasas y Retenciones", href: "/dashboard/configuracion/tasas", icon: DollarSign, permission: "tasas" },
      { name: "Roles y Permisos", href: "/dashboard/configuracion/roles", icon: Shield, permission: "roles" },
    ],
  },
]

interface GliderState {
  translateY: number
  height: number
  visible: boolean
  initialized: boolean
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const { hasPermission, user } = useAuth()
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})
  const navRef = useRef<HTMLDivElement>(null)
  const gliderRef = useRef<HTMLDivElement>(null)

  // Estado del glider guardado en ref para no causar re-renders — solo actualizamos
  // el DOM directamente con element.style para máxima velocidad (sin pasar por React)
  const gliderState = useRef<GliderState>({ translateY: 0, height: 0, visible: false, initialized: false })

  const filterByPermission = (items: NavItemType[]): NavItemType[] => {
    return items
      .map((item) => {
        if (item.children) {
          const filteredChildren = item.children.filter(
            (child) => !child.permission || hasPermission(child.permission, "canView")
          )
          if (filteredChildren.length === 0) return null
          return { ...item, children: filteredChildren }
        }
        if (item.permission && !hasPermission(item.permission, "canView")) return null
        return item
      })
      .filter(Boolean) as NavItemType[]
  }

  const filteredNavigation = useMemo(() => filterByPermission(navigation), [hasPermission])
  const filteredBottomNavigation = useMemo(() => filterByPermission(bottomNavigation), [hasPermission])

  // Mover el glider directo al DOM — sin setState, sin re-render, puro GPU
  const moveGlider = () => {
    const nav = navRef.current
    const glider = gliderRef.current
    if (!nav || !glider) return

    const active = nav.querySelector<HTMLElement>('[data-active="true"]')
    if (!active) {
      glider.style.opacity = "0"
      glider.style.pointerEvents = "none"
      gliderState.current.visible = false
      return
    }

    const navRect = nav.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    const newY = activeRect.top - navRect.top + nav.scrollTop
    const newH = activeRect.height

    const state = gliderState.current

    if (!state.initialized) {
      // Primera vez: posicionar sin animación
      glider.style.transition = "none"
      glider.style.transform = `translate3d(0, ${newY}px, 0)`
      glider.style.height = `${newH}px`
      glider.style.opacity = "1"
      glider.getBoundingClientRect()
      glider.style.transition =
        "transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), height 280ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease"
      state.initialized = true
    } else {
      glider.style.transform = `translate3d(0, ${newY}px, 0)`
      glider.style.height = `${newH}px`
      glider.style.opacity = "1"
    }

    state.translateY = newY
    state.height = newH
    state.visible = true
  }

  // Mover glider cuando cambia la ruta, se expanden menús o se hace scroll
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const handleUpdate = () => {
      requestAnimationFrame(() => moveGlider())
    }

    // El listener de scroll es crítico para que la caja no se desfase
    nav.addEventListener("scroll", handleUpdate, { passive: true })
    
    // Medir inicial
    handleUpdate()

    return () => {
      nav.removeEventListener("scroll", handleUpdate)
    }
  }, [pathname, expandedMenus, collapsed])

  // Resetear initialized cuando se colapsa/expande el sidebar
  useEffect(() => {
    gliderState.current.initialized = false
  }, [collapsed])

  useEffect(() => {
    setExpandedMenus((prev) => {
      const next = { ...prev }
      let changed = false
      ;[...filteredNavigation, ...filteredBottomNavigation].forEach((item) => {
        if (!item.children) return
        const hasActiveChild = item.children.some((child) => child.href === pathname)
        if (hasActiveChild && !next[item.name]) {
          next[item.name] = true
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [filteredBottomNavigation, filteredNavigation, pathname])

  const toggleMenu = (key: string) => {
    setExpandedMenus((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const NavItem = ({ item, isChild = false }: { item: NavItemType; isChild?: boolean }) => {
    const isActive = item.href ? pathname === item.href : false
    const Icon = item.icon
    const hasChildren = "children" in item && item.children

    if (hasChildren) {
      const isExpanded = expandedMenus[item.name] ?? false
      const hasActiveChild = item.children!.some((child) => child.href === pathname)

      return (
        <div>
          <button
            type="button"
            onClick={() => !collapsed && toggleMenu(item.name)}
            className={cn(
              "group w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg",
              "transition-all duration-150 ease-out",
              hasActiveChild
                ? "text-sidebar-foreground"
                : "text-sidebar-muted hover:text-sidebar-foreground",
              collapsed && "justify-center px-2"
            )}
            aria-expanded={isExpanded}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-all duration-200",
                hasActiveChild ? "opacity-100 text-[#4a7fd4]" : "opacity-50 group-hover:opacity-80"
              )}
            />
            {!collapsed && (
              <>
                <span className={cn("flex-1 text-left text-[13px]", hasActiveChild ? "font-semibold" : "font-normal")}>
                  {item.name}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 opacity-30 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                    isExpanded && "rotate-180 opacity-50"
                  )}
                />
              </>
            )}
          </button>

          {!collapsed && (
            <div
              className="grid overflow-hidden"
              style={{
                gridTemplateRows: isExpanded ? "1fr" : "0fr",
                opacity: isExpanded ? 1 : 0,
                transition: "grid-template-rows 220ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
              }}
            >
              <div className="min-h-0">
                <div className="ml-5 pl-3 border-l py-1 space-y-0.5" style={{ borderColor: "#111e35" }}>
                  {item.children!.map((child) => (
                    <NavItem key={child.href} item={child} isChild />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        href={item.href || "#"}
        onClick={onMobileClose}
        data-active={isActive ? "true" : undefined}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-lg relative z-10",
          "transition-colors duration-150 ease-out",
          isActive
            ? "text-sidebar-foreground"
            : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
          collapsed && !isChild && "justify-center px-2",
        )}
      >
        <Icon
          className={cn(
            "shrink-0 h-4 w-4 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            isActive
              ? "opacity-100 text-[#4a7fd4]"
              : "opacity-40 group-hover:opacity-70"
          )}
        />
        {!collapsed && (
          <span className={cn("leading-none", isActive ? "font-semibold" : "font-normal")}>
            {item.name}
          </span>
        )}
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "flex items-center h-16 px-4 shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}
        style={{ borderBottom: "1px solid #0f1e38" }}
      >
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div
            className="shrink-0 flex items-center justify-center"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1a3259 0%, #0d1b30 100%)",
              border: "1px solid #1e3660",
              boxShadow: "0 0 12px rgba(74,127,212,0.15)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(180,210,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span
                className="block text-sm font-bold tracking-tight"
                style={{ color: "#e8ecf4", letterSpacing: "-0.01em" }}
              >
                RRHH<span style={{ color: "#4a7fd4" }}> IA</span>
              </span>
              <span className="block text-[10px]" style={{ color: "#3a4d65", letterSpacing: "0.05em" }}>
                SISTEMA RH
              </span>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="hidden lg:flex p-1.5 rounded-lg transition-colors duration-150"
            style={{ color: "#3a4d65" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#e8ecf4")}
            onMouseLeave={e => (e.currentTarget.style.color = "#3a4d65")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="hidden lg:flex absolute -right-3 top-6 p-1 rounded-full border transition-colors duration-150"
            style={{ background: "#060e1e", borderColor: "#111e35", color: "#3a4d65" }}
          >
            <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
          </button>
        )}
      </div>

      {/* Nav — position:relative para que el glider se posicione dentro */}
      <div ref={navRef} className="flex-1 px-3 py-4 overflow-y-auto relative">
        {/* GLIDER GPU — indicador deslizable sobre el item activo */}
        {!collapsed && (
          <div
            ref={gliderRef}
            aria-hidden="true"
            className="sidebar-glider"
          />
        )}

        <nav className="space-y-0.5">
          {filteredNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>

      {/* User badge */}
      {!collapsed && user && (
        <div className="px-4 py-3.5" style={{ borderTop: "1px solid #0f1e38" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold"
              style={{ background: "#1a3259", color: "#4a7fd4" }}
            >
              {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold truncate" style={{ color: "#c8deff" }}>
                {user.name.split(" ").slice(0, 2).join(" ")}
              </div>
              <div className="text-[10px]" style={{ color: "#3a5070" }}>
                {user.role === "admin" && "Administrador"}
                {user.role === "rrhh" && "Recursos Humanos"}
                {user.role === "supervisor" && "Supervisor"}
                {user.role === "empleado" && "Empleado"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      {filteredBottomNavigation.length > 0 && (
        <div className="p-3 space-y-0.5" style={{ borderTop: "1px solid #0f1e38" }}>
          {filteredBottomNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          style={{ transition: "opacity 200ms ease" }}
          onClick={onMobileClose}
        />
      )}

      {/* Mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          willChange: "transform",
          transition: "transform 280ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col",
          collapsed ? "lg:w-20" : "lg:w-64"
        )}
        style={{
          background: "#060e1e",
          borderRight: "1px solid #0f1e38",
          willChange: "width",
          transition: "width 280ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
