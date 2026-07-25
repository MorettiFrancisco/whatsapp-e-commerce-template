'use server'

import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'
import { createProduct, deleteProduct, saveSettings, updateProduct, type ProductInput } from '@/lib/db'
import { FIELDS } from '@/lib/content'

// La URL secreta es la única llave: cada acción la re-valida contra el env,
// así nadie puede postear a un server action adivinando el endpoint.
function check(fd: FormData) {
  const secret = process.env.ADMIN_SECRET
  if (!secret || fd.get('secret') !== secret) throw new Error('No autorizado')
  return secret
}

async function imageFrom(fd: FormData): Promise<string> {
  const file = fd.get('file') as File | null
  const url = String(fd.get('image') ?? '').trim()
  if (!file || file.size === 0) return url
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('Para subir fotos falta conectar Vercel Blob (BLOB_READ_WRITE_TOKEN). Podés pegar una URL.')
  const blob = await put(`productos/${file.name}`, file, { access: 'public', addRandomSuffix: true })
  return blob.url
}

export async function save(fd: FormData) {
  const secret = check(fd)
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
  if (id) await updateProduct(id, p)
  else await createProduct(p)

  revalidatePath('/catalogo')
  revalidatePath(`/${secret}`)
}

export async function saveContent(fd: FormData) {
  check(fd)
  // solo se guardan las claves conocidas: lo que venga de más se ignora
  await saveSettings(Object.fromEntries(FIELDS.map((f) => [f.key, String(fd.get(f.key) ?? '').trim()])))
  revalidatePath('/', 'layout') // landing, catálogo y metadatos
}

export async function remove(fd: FormData) {
  const secret = check(fd)
  await deleteProduct(Number(fd.get('id')))
  revalidatePath('/catalogo')
  revalidatePath(`/${secret}`)
}
