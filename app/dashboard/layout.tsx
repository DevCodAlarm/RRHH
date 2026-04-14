"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { SplashScreen } from "@/components/dashboard/splash-screen"
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
  const [showSplash, setShowSplash] = useState(true)
  const mainRef = useRef<HTMLElement>(null)
  const prevPathRef = useRef(pathname)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/")
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    setCurrentRole(user?.role ?? null)
  }, [setCurrentRole, user?.role])

  // Animación de transición de página con RAF puro — sin GSAP dependency
  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    if (prevPathRef.current === pathname) return
    prevPathRef.current = pathname

    main.scrollTo({ top: 0 })

    // Kick off: invisible y desplazado
    main.style.transition = "none"
    main.style.opacity = "0"
    main.style.transform = "translateY(10px)"

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        main.style.transition =
          "opacity 260ms cubic-bezier(0.22,1,0.36,1), transform 260ms cubic-bezier(0.22,1,0.36,1)"
        main.style.opacity = "1"
        main.style.transform = "translateY(0)"
      })
    })
  }, [pathname])

  const handleSplashDone = useCallback(() => setShowSplash(false), [])

  if (isLoading) return null

  if (!isAuthenticated) return null

  const routeRule = ROLE_ROUTE_RULES.find((item) => pathname.startsWith(item.startsWith))
  const canSeeRoute = routeRule ? hasPermission(routeRule.permission, "canView") : true

  if (routeRule && !canSeeRoute) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div
          className="max-w-md rounded-xl border border-border bg-card p-8 text-center space-y-3"
          style={{ animation: "scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          <div
            className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center"
            style={{ background: "#0a1628" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7fd4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Acceso restringido</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Tu rol no tiene acceso a este módulo. Usa el asistente IA para encontrar opciones disponibles.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Splash screen — solo en el primer montaje del dashboard */}
      {showSplash && <SplashScreen onDone={handleSplashDone} />}

      <div
        className="h-screen overflow-hidden bg-background"
        style={{
          opacity: showSplash ? 0 : 1,
          transition: "opacity 400ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div
          className="h-screen flex flex-col will-change-[padding]"
          style={{
            paddingLeft: sidebarCollapsed ? "5rem" : "16rem",
            transition: "padding-left 280ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <Header onMenuClick={() => setMobileSidebarOpen(true)} />
          <main
            ref={mainRef}
            id="snap-main-container"
            className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 lg:p-6"
            style={{ willChange: "opacity, transform" }}
          >
            {children}
          </main>
        </div>
        <AIFloatingAssistant />
      </div>
    </>
  )
}
