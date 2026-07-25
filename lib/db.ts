import { neon } from '@neondatabase/serverless'

export type Product = {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
  in_stock: boolean
}
export type ProductInput = Omit<Product, 'id'>

// Según cómo se conecte Postgres en Vercel (Neon, Supabase, el marketplace) la
// connection string aparece con distintos nombres: se acepta cualquiera.
const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING
const sql = url ? neon(url) : null

// ponytail: la migración es un CREATE TABLE IF NOT EXISTS cacheado en la primera query.
// Si algún día hay más de una tabla, pasar a SQL versionado / drizzle-kit.
let ready: Promise<unknown> | null = null
function db() {
  if (!sql)
    throw new Error(
      'No hay base de datos conectada: en Vercel entrá a Storage → Postgres → Connect y volvé a deployar.'
    )
  ready ??= Promise.all([
    sql`
    CREATE TABLE IF NOT EXISTS products (
      id serial PRIMARY KEY,
      name text NOT NULL,
      description text NOT NULL DEFAULT '',
      price numeric NOT NULL DEFAULT 0,
      category text NOT NULL DEFAULT '',
      image text NOT NULL DEFAULT '',
      in_stock boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
    // ponytail: los textos de la landing viven en un único row JSON.
    // Son ~10 campos que se guardan juntos: una tabla por campo no compra nada.
    sql`CREATE TABLE IF NOT EXISTS settings (id int PRIMARY KEY, data jsonb NOT NULL DEFAULT '{}')`,
  ])
  return ready.then(() => sql)
}

export async function getProducts(): Promise<Product[]> {
  if (!sql) return [] // sin DB conectada la web igual levanta (catálogo vacío)
  const q = await db()
  return (await q`
    SELECT id, name, description, price::float AS price, category, image, in_stock
    FROM products ORDER BY in_stock DESC, created_at DESC`) as Product[]
}

export async function createProduct(p: ProductInput) {
  const q = await db()
  await q`INSERT INTO products (name, description, price, category, image, in_stock)
          VALUES (${p.name}, ${p.description}, ${p.price}, ${p.category}, ${p.image}, ${p.in_stock})`
}

export async function updateProduct(id: number, p: ProductInput) {
  const q = await db()
  await q`UPDATE products SET name=${p.name}, description=${p.description}, price=${p.price},
          category=${p.category}, image=${p.image}, in_stock=${p.in_stock} WHERE id=${id}`
}

export async function deleteProduct(id: number) {
  const q = await db()
  await q`DELETE FROM products WHERE id=${id}`
}

export async function getSettings(): Promise<Record<string, string>> {
  if (!sql) return {} // sin DB conectada: la landing muestra los textos por defecto
  const q = await db()
  const rows = (await q`SELECT data FROM settings WHERE id=1`) as { data: Record<string, string> }[]
  return rows[0]?.data ?? {}
}

export async function saveSettings(data: Record<string, string>) {
  const q = await db()
  await q`INSERT INTO settings (id, data) VALUES (1, ${JSON.stringify(data)}::jsonb)
          ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`
}
