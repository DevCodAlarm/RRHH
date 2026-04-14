"use client"

import { useEffect, useState } from "react"

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in")

  useEffect(() => {
    // Mantener splash visible 1.8s luego fadeout
    const holdTimer = setTimeout(() => setPhase("out"), 1800)
    const doneTimer = setTimeout(() => onDone(), 2300)
    return () => {
      clearTimeout(holdTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #050c1a 0%, #060e1e 40%, #0a1628 100%)",
        opacity: phase === "out" ? 0 : 1,
        transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: phase === "out" ? "none" : "all",
      }}
    >
      {/* Orbes de fondo animados */}
      <div
        className="absolute"
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26, 50, 89, 0.35) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          animation: "pulse-slow 4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "900px",
          height: "900px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(10, 22, 40, 0.5) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          animation: "pulse-slow 6s ease-in-out 1s infinite",
        }}
      />

      {/* Grid pattern sutil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#4a7fd4 1px, transparent 1px), linear-gradient(90deg, #4a7fd4 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Contenido central */}
      <div className="relative flex flex-col items-center gap-6 select-none">
        {/* Logo */}
        <div className="splash-logo">
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #1a3259 0%, #0a1628 100%)",
              border: "1px solid rgba(74, 127, 212, 0.3)",
              boxShadow: "0 0 40px rgba(26, 50, 89, 0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(200, 218, 255, 0.9)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>

        {/* Nombre */}
        <div className="splash-text flex flex-col items-center gap-1">
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#e8ecf4",
              lineHeight: 1,
            }}
          >
            RRHH<span style={{ color: "#4a7fd4" }}> IA</span>
          </h1>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              color: "#5a6a85",
              textTransform: "uppercase",
            }}
          >
            Sistema de Recursos Humanos
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="splash-sub" style={{ width: "200px" }}>
          <div
            style={{
              height: "2px",
              borderRadius: "999px",
              background: "rgba(74, 127, 212, 0.15)",
              overflow: "hidden",
            }}
          >
            <div
              className="splash-bar"
              style={{
                height: "100%",
                borderRadius: "999px",
                background: "linear-gradient(90deg, #1a3259, #4a7fd4, #1a3259)",
                backgroundSize: "200% 100%",
              }}
            />
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#5a6a85",
              marginTop: "12px",
              letterSpacing: "0.05em",
            }}
          >
            Iniciando sistema...
          </p>
        </div>
      </div>
    </div>
  )
}
