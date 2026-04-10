"use client"

import { useState } from "react"
import { Bell, X, Check, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useAnnouncements } from "@/lib/announcements-context"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface AnnouncementDisplayProps {
  userId: string
  isAdmin?: boolean
}

export function AnnouncementManager({ userId, isAdmin = false }: AnnouncementDisplayProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showUnreadOnly, setShowUnreadOnly] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isRequired: false,
    expiresAt: "",
  })

  const {
    announcements,
    addAnnouncement,
    removeAnnouncement,
    markAsRead,
    getUnreadAnnouncements,
    getUnreadCount,
    hasReadAnnouncement,
  } = useAnnouncements()

  const unreadCount = getUnreadCount(userId)
  const unreadAnnouncements = getUnreadAnnouncements(userId)
  
  const visibleAnnouncements = showUnreadOnly ? unreadAnnouncements : announcements

  const handleAddAnnouncement = () => {
    if (formData.title.trim() && formData.content.trim()) {
      addAnnouncement({
        title: formData.title,
        content: formData.content,
        isRequired: formData.isRequired,
        createdBy: "admin",
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      })

      setFormData({
        title: "",
        content: "",
        isRequired: false,
        expiresAt: "",
      })
      setIsOpen(false)
    }
  }

  const handleMarkAsRead = (announcementId: string) => {
    markAsRead(announcementId, userId)
  }

  const handleDelete = (announcementId: string) => {
    if (isAdmin) {
      removeAnnouncement(announcementId)
    }
  }

  return (
    <div className="space-y-4">
      {/* Encabezado con botón de crear */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Anuncios</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} nuevo{unreadCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {isAdmin && (
          <Button onClick={() => setIsOpen(true)} variant="default" size="sm">
            + Crear Anuncio
          </Button>
        )}
      </div>

      {/* Filtro */}
      {announcements.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="unread-only"
            checked={showUnreadOnly}
            onCheckedChange={(checked) => setShowUnreadOnly(checked as boolean)}
          />
          <Label htmlFor="unread-only" className="cursor-pointer">
            Mostrar solo no leídos
          </Label>
        </div>
      )}

      {/* Lista de Anuncios */}
      {visibleAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              {announcements.length === 0
                ? "No hay anuncios disponibles"
                : "No hay anuncios sin leer"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleAnnouncements.map((announcement) => {
            const isRead = hasReadAnnouncement(announcement.id, userId)
            const isRequired = announcement.isRequired && !isRead

            return (
              <Card
                key={announcement.id}
                className={`
                  transition-all
                  ${isRead ? "bg-gray-50 border-gray-200" : "border-blue-300 bg-blue-50"}
                  ${isRequired ? "border-l-4 border-l-red-500" : ""}
                `}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Icono de tipo */}
                    <div className="mt-1">
                      {isRequired ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Info className="w-5 h-5 text-blue-500" />
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base break-words">
                            {announcement.title}
                          </h3>
                          {isRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Obligatorio
                            </Badge>
                          )}
                          {isRead && (
                            <Badge variant="outline" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Leído
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-2 whitespace-pre-wrap break-words">
                        {announcement.content}
                      </p>

                      <p className="text-xs text-gray-500 mb-3">
                        {format(new Date(announcement.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })}
                        {announcement.expiresAt && (
                          <>
                            {" • Expira: "}
                            {format(new Date(announcement.expiresAt), "dd/MM/yyyy", {
                              locale: es,
                            })}
                          </>
                        )}
                      </p>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        {!isRead && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleMarkAsRead(announcement.id)}
                            className="text-xs"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Marcar como leído
                          </Button>
                        )}

                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(announcement.id)}
                            className="text-xs"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog para crear anuncio */}
      {isAdmin && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Anuncio</DialogTitle>
              <DialogDescription>
                Los anuncios marcados como obligatorios deberán ser confirmados por todos los empleados
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ej: Baño fuera de servicio"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  placeholder="Escriba el contenido del anuncio..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="required"
                  checked={formData.isRequired}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isRequired: checked as boolean })
                  }
                />
                <Label htmlFor="required" className="cursor-pointer">
                  Marcar como obligatorio (todos deben confirmar que lo leyeron)
                </Label>
              </div>

              <div>
                <Label htmlFor="expires">Fecha de vencimiento (opcional)</Label>
                <Input
                  id="expires"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddAnnouncement} disabled={!formData.title.trim() || !formData.content.trim()}>
                Crear Anuncio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
