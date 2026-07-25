'use client'

import { useActionState } from 'react'
import type { State } from './actions'

// Una foto de celular pesa 3-5 MB y un server action acepta ~4 MB: se reduce en el
// navegador antes de enviarla. Además hace que el catálogo cargue liviano en mobile.
// ponytail: 1400px al lado más largo alcanza para la grilla; subir el número si algún
// día se quiere zoom en la ficha del producto.
const processed = new WeakSet<File>()

async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1400 / Math.max(bmp.width, bmp.height))
  if (scale === 1 && file.size < 600_000) return file
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.82))
  if (!blob) return file
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
}

async function optimizeFileInput(e: React.ChangeEvent<HTMLFormElement>) {
  const input = e.target as unknown as HTMLInputElement
  const file = input.type === 'file' ? input.files?.[0] : null
  if (!file || processed.has(file)) return // el reemplazo dispara otro change: se corta acá
  const small = await shrink(file)
  processed.add(small)
  if (small === file) return
  const dt = new DataTransfer()
  dt.items.add(small)
  input.files = dt.files
}

// Envoltorio de los formularios del panel: muestra el resultado del server action
// (guardado / error) y bloquea el botón mientras trabaja.
export function PanelForm({
  action,
  submit,
  danger,
  children,
}: {
  action: (prev: State, fd: FormData) => Promise<State>
  submit: string
  danger?: boolean
  children: React.ReactNode
}) {
  const [state, formAction, pending] = useActionState(action, null)
  return (
    <form action={formAction} onChange={optimizeFileInput}>
      {children}
      {state?.error && <p className="msg err">{state.error}</p>}
      {state?.ok && <p className="msg ok">✓ {state.ok}</p>}
      <button className={`btn block${danger ? ' danger' : ''}`} type="submit" disabled={pending}>
        {pending ? 'Guardando…' : submit}
      </button>
    </form>
  )
}
