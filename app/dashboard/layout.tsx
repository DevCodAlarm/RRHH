"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { gsap } from "gsap"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { useAuth } from "@/lib/auth-context"
import { usePresence } from "@/lib/presence-context"
import { AIFloatingAssistant } from "@/components/assistant/ai-floating-assistant"
import { ROLE_ROUTE_RULES } from "@/lib/role-navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, hasPermission } = useAuth()
  const { setCurrentRole } = usePresence()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Pequeño delay para permitir que el contexto se hidrate
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    setCurrentRole(user?.role ?? null)
  }, [setCurrentRole, user?.role])

  useEffect(() => {
    const main = document.getElementById("snap-main-container")
    if (!main) return

    main.scrollTo({ top: 0 })
    gsap.fromTo(
      main,
      { opacity: 0, x: 12 },
      { opacity: 1, x: 0, duration: 0.35, ease: "power3.out", overwrite: "auto", clearProps: "transform" }
    )
  }, [pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const routeRule = ROLE_ROUTE_RULES.find((item) => pathname.startsWith(item.startsWith))
  const canSeeRoute = routeRule ? hasPermission(routeRule.permission, "canView") : true

  if (routeRule && !canSeeRoute) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md rounded-xl border bg-card p-6 text-center space-y-2">
          <h2 className="text-xl font-semibold">Acceso restringido por rol</h2>
          <p className="text-muted-foreground text-sm">
            Tu rol no tiene acceso a este modulo. Usa el asistente IA para encontrar opciones disponibles.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div 
        className="h-screen flex flex-col transition-[padding] duration-300 ease-in-out will-change-[padding]"
        style={{ paddingLeft: sidebarCollapsed ? '5rem' : '16rem' }}
      >
        <Header 
          onMenuClick={() => setMobileSidebarOpen(true)} 
        />
        <main
          id="snap-main-container"
          className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 lg:p-6 motion-safe:scroll-smooth"
        >
          {children}
        </main>
      </div>
      <AIFloatingAssistant />
    </div>
  )
}
