import { getProducts } from '@/lib/db'
import { getContent } from '@/lib/content'
import Shop from './Shop'

export const dynamic = 'force-dynamic' // el catálogo lo edita la dueña: siempre fresco

export default async function Catalogo() {
  const [products, t] = await Promise.all([getProducts(), getContent()])
  return <Shop products={products} t={t} />
}
