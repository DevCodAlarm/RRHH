// Sistema de auditoría para registrar todas las acciones de usuarios
export interface AuditLog {
  id: string
  userId: string
  action: string
  actionType: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'view' | 'download'
  target: string // Qué tipo de documento/solicitud/nómina
  targetId: string // ID del documento
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
  metadata?: {
    ip?: string
    userAgent?: string
    reason?: string
  }
  createdAt: string
  timestamp: number
}

const STORAGE_KEY = 'rrhh_audit_logs_v2'

export function logAction(
  userId: string,
  action: string,
  actionType: AuditLog['actionType'],
  target: string,
  targetId: string,
  changes?: AuditLog['changes'],
  metadata?: AuditLog['metadata']
): AuditLog {
  const log: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    action,
    actionType,
    target,
    targetId,
    changes,
    metadata,
    createdAt: new Date().toISOString(),
    timestamp: Date.now(),
  }

  // Guardar en localStorage
  const existing = getAllLogs()
  existing.push(log)
  
  // Mantener solo últimos 10000 logs para no saturar
  const limited = existing.slice(-10000)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))

  // Disparar evento personalizado para sincronización
  window.dispatchEvent(new CustomEvent('audit-log-added', { detail: log }))

  return log
}

export function getAllLogs(): AuditLog[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getLogsByUserId(userId: string): AuditLog[] {
  return getAllLogs().filter(log => log.userId === userId)
}

export function getLogsByTarget(target: string, targetId?: string): AuditLog[] {
  return getAllLogs().filter(
    log => log.target === target && (!targetId || log.targetId === targetId)
  )
}

export function getLogsByActionType(actionType: AuditLog['actionType']): AuditLog[] {
  return getAllLogs().filter(log => log.actionType === actionType)
}

export function getLogsForDateRange(from: Date, to: Date): AuditLog[] {
  const fromTime = from.getTime()
  const toTime = to.getTime()
  return getAllLogs().filter(log => log.timestamp >= fromTime && log.timestamp <= toTime)
}

export function clearOldLogs(daysToKeep: number = 90): void {
  const now = Date.now()
  const cutoff = now - (daysToKeep * 24 * 60 * 60 * 1000)
  
  const remaining = getAllLogs().filter(log => log.timestamp > cutoff)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining))
}

export function searchLogs(query: string): AuditLog[] {
  const lowerQuery = query.toLowerCase()
  return getAllLogs().filter(
    log =>
      log.action.toLowerCase().includes(lowerQuery) ||
      log.target.toLowerCase().includes(lowerQuery) ||
      log.userId.toLowerCase().includes(lowerQuery) ||
      log.actionType.toLowerCase().includes(lowerQuery)
  )
}
