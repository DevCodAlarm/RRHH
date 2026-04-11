"use client"

import { useState } from "react"
import Image from "next/image"
import { LoginForm } from "@/components/auth/login-form"
import { QuickUserSetup } from "@/components/auth/quick-user-setup"

export default function LoginPage() {
  const [showQuickSetup, setShowQuickSetup] = useState(false)

  return (
    <main className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sidebar-primary/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-3">
              <Image 
                src="/hr-logo.png" 
                alt="HRFlow Pro" 
                width={40} 
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-sidebar-foreground tracking-tight">HRFlow Pro</span>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-sidebar-foreground leading-tight text-balance">
                Gestión de Recursos Humanos Inteligente
              </h1>
              <p className="mt-6 text-lg text-sidebar-muted leading-relaxed max-w-md">
                Plataforma completa para administración de nóminas, préstamos, solicitudes de empleados y análisis de recursos humanos en tiempo real.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-lg bg-sidebar-accent/60 border border-sidebar-border/60 backdrop-blur-sm">
                <div className="text-3xl font-bold text-sidebar-foreground">100%</div>
                <div className="text-sm text-sidebar-muted mt-1">Funcional</div>
              </div>
              <div className="p-4 rounded-lg bg-sidebar-accent/60 border border-sidebar-border/60 backdrop-blur-sm">
                <div className="text-3xl font-bold text-sidebar-foreground">0%</div>
                <div className="text-sm text-sidebar-muted mt-1">Sin backend</div>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-sidebar-primary/20 flex-shrink-0">
                <svg className="h-5 w-5 text-sidebar-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sidebar-foreground">Almacenamiento Local Seguro</p>
                <p className="text-sm text-sidebar-muted mt-1">Todos los datos se guardan en localStorage, sin dependencias externas</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-sidebar-muted pt-4">
            &copy; 2026 HRFlow Pro. Todos los derechos reservados.
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex flex-col items-center justify-center text-center gap-4">
            <Image 
              src="/hr-logo.png" 
              alt="HRFlow Pro" 
              width={48} 
              height={48}
              className="w-12 h-12"
            />
            <div>
              <h2 className="text-2xl font-bold text-foreground">HRFlow Pro</h2>
              <p className="text-sm text-muted-foreground mt-1">Gestión integral de recursos humanos</p>
            </div>
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
