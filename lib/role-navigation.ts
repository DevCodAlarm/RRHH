export interface RoleRouteRule {
  permission: string
  startsWith: string
}

export const ROLE_ROUTE_RULES: RoleRouteRule[] = [
  { permission: "dashboard", startsWith: "/dashboard" },
  { permission: "turnos", startsWith: "/dashboard/calendario" },
  { permission: "colaboradores", startsWith: "/dashboard/personas/colaboradores" },
  { permission: "turnos", startsWith: "/dashboard/personas/turnos" },
  { permission: "organigrama", startsWith: "/dashboard/personas/organigrama" },
  { permission: "contratacion", startsWith: "/dashboard/personas/contratacion" },
  { permission: "desempeno", startsWith: "/dashboard/personas/desempeno" },
  { permission: "periodos", startsWith: "/dashboard/nomina/periodos" },
  { permission: "procesar", startsWith: "/dashboard/nomina/procesar" },
  { permission: "historial", startsWith: "/dashboard/nomina/historial" },
  { permission: "mi_nomina", startsWith: "/dashboard/nomina/mi" },
  { permission: "prestamos", startsWith: "/dashboard/prestamos" },
  { permission: "solicitudes", startsWith: "/dashboard/solicitudes" },
  { permission: "declaraciones", startsWith: "/dashboard/declaraciones" },
  { permission: "reportes", startsWith: "/dashboard/reportes" },
  { permission: "configuracion", startsWith: "/dashboard/configuracion" },
  { permission: "perfil", startsWith: "/dashboard/perfil" },
]

export const ASSISTANT_LOCATIONS = [
  { key: "colaboradores", label: "Colaboradores", path: "/dashboard/personas/colaboradores", permission: "colaboradores" },
  { key: "nomina", label: "Nomina", path: "/dashboard/nomina/periodos", permission: "periodos" },
  { key: "prestamos", label: "Prestamos", path: "/dashboard/prestamos", permission: "prestamos" },
  { key: "solicitudes", label: "Solicitudes", path: "/dashboard/solicitudes", permission: "solicitudes" },
  { key: "reportes", label: "Reportes", path: "/dashboard/reportes", permission: "reportes" },
  { key: "calendario", label: "Calendario", path: "/dashboard/calendario", permission: "turnos" },
  { key: "configuracion", label: "Configuracion", path: "/dashboard/configuracion", permission: "configuracion" },
  { key: "perfil", label: "Perfil", path: "/dashboard/perfil", permission: "perfil" },
]
