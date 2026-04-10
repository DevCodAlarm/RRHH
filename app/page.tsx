"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { QuickUserSetup } from "@/components/auth/quick-user-setup"

export default function LoginPage() {
  const [showQuickSetup, setShowQuickSetup] = useState(false)

  return (
    <main className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <svg className="w-6 h-6 text-sidebar-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <span className="text-xl font-semibold text-sidebar-foreground tracking-tight">RRHH<span className="text-sidebar-foreground">IA</span></span>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-sidebar-foreground leading-tight text-balance">
                Gestiona tu equipo de forma inteligente
              </h1>
              <p className="mt-4 text-lg text-sidebar-muted leading-relaxed">
                Sistema completo de recursos humanos con procesamiento de nomina, 
                prestamos, solicitudes y reportes automatizados.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                <div className="text-2xl font-bold text-sidebar-foreground">+500</div>
                <div className="text-sm text-sidebar-muted">Empresas activas</div>
              </div>
              <div className="p-4 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                <div className="text-2xl font-bold text-sidebar-foreground">98%</div>
                <div className="text-sm text-sidebar-muted">Satisfaccion</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-sidebar-muted">
            &copy; 2026 RRHH IA. Todos los derechos reservados.
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-foreground tracking-tight">RRHH<span className="text-foreground">IA</span></span>
          </div>

          {showQuickSetup ? (
            <QuickUserSetup onBack={() => setShowQuickSetup(false)} />
          ) : (
            <LoginForm onQuickSetup={() => setShowQuickSetup(true)} />
          )}
        </div>
      </div>
    </main>
  )
}
