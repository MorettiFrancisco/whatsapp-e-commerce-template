'use server'

import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'
import { createProduct, deleteProduct, saveSettings, updateProduct, type ProductInput } from '@/lib/db'
import { FIELDS } from '@/lib/content'

export type State = { ok?: string; error?: string } | null

// La URL secreta es la única llave: cada acción la re-valida contra el env,
// así nadie puede postear a un server action adivinando el endpoint.
// Los errores se devuelven como texto (no se lanzan) para que el panel los muestre:
// en producción Next oculta el mensaje de las excepciones y queda un 500 mudo.
async function run(fd: FormData, fn: () => Promise<string>): Promise<State> {
  const secret = process.env.ADMIN_SECRET
  if (!secret || fd.get('secret') !== secret) return { error: 'No autorizado' }
  try {
    const ok = await fn()
    revalidatePath('/', 'layout') // landing, catálogo, panel y metadatos
    return { ok }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error inesperado' }
  }
}

async function imageFrom(fd: FormData): Promise<string> {
  const file = fd.get('file') as File | null
  const url = String(fd.get('image') ?? '').trim()
  if (!file || file.size === 0) return url
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error(
      'Para subir fotos hay que conectar Vercel Blob (Storage → Blob → Connect y redeploy). ' +
        'Mientras tanto podés pegar la URL de la imagen en el campo de abajo.'
    )
  const blob = await put(`productos/${file.name}`, file, { access: 'public', addRandomSuffix: true })
  return blob.url
}

export async function save(_prev: State, fd: FormData) {
  return run(fd, async () => {
    const p: ProductInput = {
      name: String(fd.get('name') ?? '').trim(),
      description: String(fd.get('description') ?? '').trim(),
      price: Number(String(fd.get('price') ?? '0').replace(',', '.')) || 0,
      category: String(fd.get('category') ?? '').trim(),
      image: await imageFrom(fd),
      in_stock: fd.get('in_stock') === 'on',
    }
    if (!p.name) throw new Error('El nombre es obligatorio')

    const id = Number(fd.get('id'))
    if (id) {
      await updateProduct(id, p)
      return 'Cambios guardados'
    }
    await createProduct(p)
    return `«${p.name}» ya está en el catálogo`
  })
}

export async function saveContent(_prev: State, fd: FormData) {
  return run(fd, async () => {
    // solo se guardan las claves conocidas: lo que venga de más se ignora
    await saveSettings(Object.fromEntries(FIELDS.map((f) => [f.key, String(fd.get(f.key) ?? '').trim()])))
    return 'Landing actualizada'
  })
}

export async function remove(_prev: State, fd: FormData) {
  return run(fd, async () => {
    await deleteProduct(Number(fd.get('id')))
    return 'Producto eliminado'
  })
}
