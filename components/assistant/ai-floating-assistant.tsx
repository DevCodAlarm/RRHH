"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bot, MessageCircle, Send, Sparkles, Trash2, UserPlus, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"
import { useEmployees } from "@/lib/employees-context"
import { usePresence } from "@/lib/presence-context"
import { ASSISTANT_LOCATIONS } from "@/lib/role-navigation"
import { logActivity } from "@/lib/activity-log"

interface ChatMessage {
  id: string
  from: "user" | "assistant"
  text: string
}

const SUGGESTIONS = [
  "Ayuda: que puedo hacer con mi rol",
  "Donde queda reportes",
  "Consulta: cuantos empleados activos hay",
  "Crear empleado: Pedro Diaz, pedro@empresa.com, 809-555-0000, Tecnologia, QA, 42000",
  "Eliminar empleado: Carolina Estrella Peña",
  "Reporte de presencia",
  "Cuando pagan la nomina",
]

export function AIFloatingAssistant() {
  const router = useRouter()
  const { user, hasPermission } = useAuth()
  const { employees, createEmployee, deleteEmployee, getEmployeeByName } = useEmployees()
  const { score, hasAlert } = usePresence()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      from: "assistant",
      text: "Hola, soy tu asistente IA. Puedo crear/eliminar empleados, responder dudas de autoservicio y generar reportes rapidos.",
    },
  ])
  const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const employeeStats = useMemo(() => {
    const active = employees.filter((employee) => employee.status === "active").length
    return { total: employees.length, active }
  }, [employees])

  const availableLocations = useMemo(
    () => ASSISTANT_LOCATIONS.filter((item) => hasPermission(item.permission, "canView")),
    [hasPermission]
  )

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  function appendMessage(from: ChatMessage["from"], text: string) {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), from, text }])
  }

  function handleCreateCommand(text: string) {
    if (!hasPermission("colaboradores", "canCreate")) {
      return "Tu rol no tiene permiso para crear empleados."
    }

    const payload = text.split(":")[1]?.split(",").map((item) => item.trim()) ?? []
    if (payload.length < 6) {
      return "Formato esperado: Crear empleado: Nombre, email, telefono, departamento, posicion, salario"
    }

    const [name, email, phone, department, position, salaryRaw] = payload
    const salary = Number(salaryRaw)
    if (!Number.isFinite(salary) || salary <= 0) {
      return "El salario debe ser un numero valido."
    }

    const employee = createEmployee({ name, email, phone, department, position, salary })
    logActivity({
      type: "employee.created",
      message: `Empleado creado: ${employee.name} (${employee.department})`,
      actor: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : undefined,
      meta: { employeeId: employee.id },
    })
    return `Empleado creado: ${employee.name} (${employee.department}).`
  }

  function handleDeleteCommand(text: string) {
    if (!hasPermission("colaboradores", "canDelete")) {
      return "Tu rol no tiene permiso para eliminar empleados."
    }

    const name = text.split(":")[1]?.trim()
    if (!name) {
      return "Formato esperado: Eliminar empleado: Nombre Apellido"
    }

    const target = getEmployeeByName(name)
    if (!target) {
      return `No encontre a ${name} en el registro.`
    }

    setPendingDeleteName(target.name)
    return `Accion sensible detectada. Confirma la eliminacion de ${target.name}.`
  }

  function handleAutoservicio(text: string) {
    const normalized = text.toLowerCase()
    if (normalized.includes("vacaciones")) {
      return "Tienes 8 dias de vacaciones disponibles y 2 pendientes de aprobacion."
    }
    if (normalized.includes("nomina") || normalized.includes("pago")) {
      return "La proxima nomina se procesa el 15 de este mes."
    }
    if (normalized.includes("dias he trabajado")) {
      return "Este mes llevas 17 dias trabajados, 1 permiso y 0 faltas."
    }
    return null
  }

  function handleNavigationHelp(text: string) {
    const normalized = text.toLowerCase()
    if (!normalized.includes("donde") && !normalized.includes("queda") && !normalized.includes("ir a")) {
      return null
    }

    const match = availableLocations.find((item) => normalized.includes(item.key) || normalized.includes(item.label.toLowerCase()))
    if (match) {
      router.push(match.path)
      return `Te llevo a ${match.label}. Ruta: ${match.path}`
    }

    if (availableLocations.length === 0) {
      return "Tu rol no tiene modulos habilitados en este momento."
    }

    const options = availableLocations.map((item) => item.label).join(", ")
    return `No encontre ese modulo para tu rol. Puedes usar: ${options}.`
  }

  function handleGeneralHelp(text: string) {
    const normalized = text.toLowerCase()
    if (!normalized.includes("ayuda") && !normalized.includes("que puedo") && !normalized.includes("qué puedo")) {
      return null
    }

    const canUse = availableLocations.map((item) => item.label).join(", ")
    return `Como ${user?.role ?? "usuario"}, tienes acceso a: ${canUse || "ningun modulo"}. Puedes pedirme: "donde queda reportes" o "ir a colaboradores".`
  }

  function handleReport() {
    return `Reporte rapido: ${employeeStats.active}/${employeeStats.total} empleados activos. Score de presencia global: ${score}. Estado: ${hasAlert ? "Alerta" : "Estable"}.`
  }

  function runAssistant(text: string) {
    const normalized = text.toLowerCase()
    const help = handleGeneralHelp(text)
    if (help) return help
    const navigation = handleNavigationHelp(text)
    if (navigation) return navigation
    if (normalized.startsWith("crear empleado")) return handleCreateCommand(text)
    if (normalized.startsWith("eliminar empleado")) return handleDeleteCommand(text)
    if (normalized.includes("reporte de presencia")) return handleReport()
    if (normalized.includes("cuantos empleados")) return `Hay ${employeeStats.total} empleados registrados (${employeeStats.active} activos).`
    const autoservicio = handleAutoservicio(text)
    if (autoservicio) return autoservicio
    return "Puedo ayudarte con CRUD de empleados, reportes de presencia, vacaciones y nomina."
  }

  function onSend(messageText?: string) {
    const text = (messageText ?? input).trim()
    if (!text) return
    appendMessage("user", text)
    const reply = runAssistant(text)
    appendMessage("assistant", reply)
    setInput("")
  }

  function confirmDelete() {
    if (!pendingDeleteName) return
    const target = getEmployeeByName(pendingDeleteName)
    if (!target) {
      appendMessage("assistant", "El empleado ya no existe en la lista.")
      setPendingDeleteName(null)
      return
    }
    deleteEmployee(target.id)
    logActivity({
      type: "employee.deleted",
      message: `Empleado eliminado: ${target.name}`,
      actor: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : undefined,
      meta: { employeeId: target.id },
    })
    appendMessage("assistant", `Empleado eliminado: ${target.name}.`)
    setPendingDeleteName(null)
  }

  return (
    <>
      {/* Bottom-center pill trigger — FieldOS "Open Sales AI" style */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="assistant-pill-trigger flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-card text-foreground font-medium text-sm cursor-pointer border border-border min-w-[320px]"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary border border-border">
              <Sparkles className="h-4 w-4 text-foreground" />
            </span>
            <span>Abrir Asistente IA</span>
          </button>
        ) : (
          /* Expanded chat panel — slides up from the pill */
          <div className="assistant-panel w-[420px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
               style={{ maxHeight: 'min(540px, calc(100vh - 100px))' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Asistente IA RRHH</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.name ?? "usuario"} · {user?.role ?? "N/A"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer border-0 bg-transparent"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0" style={{ maxHeight: '320px' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl p-3 text-sm leading-relaxed ${
                    message.from === "assistant"
                      ? "bg-secondary/60 text-foreground"
                      : "bg-foreground text-background ml-8"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.from === "assistant" ? (
                      <Bot className="h-3.5 w-3.5 opacity-70" />
                    ) : (
                      <Send className="h-3.5 w-3.5 opacity-70" />
                    )}
                    <span className="font-medium text-xs uppercase tracking-wide opacity-80">
                      {message.from === "assistant" ? "IA" : "Tú"}
                    </span>
                  </div>
                  {message.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="px-4 py-2 border-t border-border/50">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {SUGGESTIONS.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => onSend(suggestion)}
                    className="px-2.5 py-1 rounded-full text-xs bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-border/50"
                  >
                    {suggestion.length > 30 ? `${suggestion.slice(0, 30)}...` : suggestion}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && onSend()}
                  placeholder="Escribe una accion o consulta..."
                  className="text-sm h-9"
                />
                <Button onClick={() => onSend()} size="sm" className="h-9 w-9 p-0 shrink-0">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Footer meta */}
              <div className="text-[10px] text-muted-foreground flex items-center gap-3 mt-2 pb-1">
                <span className="flex items-center gap-1"><UserPlus className="h-2.5 w-2.5" /> CRUD por rol</span>
                <span className="flex items-center gap-1"><Trash2 className="h-2.5 w-2.5" /> Confirmacion obligatoria</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingDeleteName} onOpenChange={(value) => !value && setPendingDeleteName(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmacion obligatoria</AlertDialogTitle>
            <AlertDialogDescription>
              Seguro que quieres eliminar este empleado: <strong>{pendingDeleteName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Si, eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
