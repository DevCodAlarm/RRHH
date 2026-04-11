// Almacenamiento de imágenes en localStorage (base64)
const STORAGE_PREFIX = 'rrhh_employee_images_v2'

/**
 * Convierte un File a base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
  })
}

/**
 * Valida si el archivo es una imagen válida
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

  if (file.size > maxSize) {
    return { valid: false, error: 'La imagen no debe superar 5MB' }
  }

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Formato de imagen no válido (JPEG, PNG, WebP)' }
  }

  return { valid: true }
}

/**
 * Guarda la imagen de perfil de un empleado
 */
export function saveEmployeeImage(employeeId: string, base64: string): void {
  const key = `${STORAGE_PREFIX}_${employeeId}`
  localStorage.setItem(key, base64)
  window.dispatchEvent(new CustomEvent('employee-image-updated', { detail: { employeeId } }))
}

/**
 * Obtiene la imagen de perfil de un empleado
 */
export function getEmployeeImage(employeeId: string): string | null {
  const key = `${STORAGE_PREFIX}_${employeeId}`
  return localStorage.getItem(key)
}

/**
 * Elimina la imagen de perfil de un empleado
 */
export function deleteEmployeeImage(employeeId: string): void {
  const key = `${STORAGE_PREFIX}_${employeeId}`
  localStorage.removeItem(key)
  window.dispatchEvent(new CustomEvent('employee-image-deleted', { detail: { employeeId } }))
}

/**
 * Crea una imagen de placeholder con el avatar del usuario
 */
export function createAvatarPlaceholder(initials: string, size: number = 64): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // Fondo gradiente
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#3b82f6')
  gradient.addColorStop(1, '#1e40af')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // Texto
  ctx.font = `${size * 0.4}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fontWeight = 'bold'
  ctx.fillText(initials, size / 2, size / 2)

  return canvas.toDataURL('image/png')
}

/**
 * Redimensiona una imagen (requiere canvas)
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400
): Promise<File> {
  const base64 = await fileToBase64(file)
  const img = new Image()
  img.src = base64

  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      // Calcular nuevas dimensiones manteniendo ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
      }

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], file.name, { type: file.type }))
        } else {
          resolve(file)
        }
      }, file.type)
    }
  })
}
