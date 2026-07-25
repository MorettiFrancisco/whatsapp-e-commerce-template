import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProducts, type Product } from '@/lib/db'
import { FIELDS, getContent } from '@/lib/content'
import { formatPrice } from '@/lib/wa'
import { remove, save, saveContent } from './actions'
import { PanelForm } from './PanelForm'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

export default async function Admin({ params }: { params: Promise<{ secret: string }> }) {
  const { secret } = await params
  const expected = process.env.ADMIN_SECRET
  if (!expected || secret !== expected) notFound() // URL oculta: cualquier otra cosa es 404

  const [products, t] = await Promise.all([getProducts(), getContent()])

  return (
    <div className="wrap admin">
      <div className="topbar" style={{ position: 'static', border: 0, background: 'transparent' }}>
        <div className="topbar__row" style={{ padding: 0 }}>
          <h1 className="display">Panel {t.name}</h1>
          <Link className="btn ghost dark sm" href="/catalogo">
            Ver web
          </Link>
        </div>
      </div>

      <details className="panel admin__item">
        <summary>
          <span style={{ flex: 1 }}>
            <b style={{ display: 'block', fontSize: 14 }}>Landing y textos</b>
            <span className="muted" style={{ fontSize: 13 }}>
              Nombre, frases, quiénes somos, WhatsApp e Instagram
            </span>
          </span>
          <span className="muted">editar ▾</span>
        </summary>
        <PanelForm action={saveContent} submit="Guardar landing">
          <input type="hidden" name="secret" value={secret} />
          {FIELDS.map((f) => (
            <div className="field" key={f.key}>
              <label htmlFor={f.key}>{f.label}</label>
              {'big' in f && f.big ? (
                <textarea id={f.key} name={f.key} rows={f.key === 'aboutText' ? 8 : 4} defaultValue={t[f.key]} />
              ) : (
                <input id={f.key} name={f.key} defaultValue={t[f.key]} />
              )}
            </div>
          ))}
        </PanelForm>
      </details>

      <section className="panel">
        <h2 className="display" style={{ fontSize: 22, marginBottom: 10 }}>
          Nuevo producto
        </h2>
        <ProductForm secret={secret} />
      </section>

      <section className="admin" style={{ padding: 0 }}>
        <h2 className="display" style={{ fontSize: 22 }}>
          Productos
        </h2>
        {products.map((p) => (
          <details className="panel admin__item" key={p.id}>
            <summary>
              {p.image ? <img src={p.image} alt="" /> : <span className="ph">💜</span>}
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: 14 }}>{p.name}</b>
                <span className="muted" style={{ fontSize: 13 }}>
                  {formatPrice(p.price)} · {p.category || 'sin categoría'} {p.in_stock ? '' : '· sin stock'}
                </span>
              </span>
              <span className="muted">editar ▾</span>
            </summary>
            <ProductForm secret={secret} p={p} />
            <details>
              <summary className="muted" style={{ fontSize: 13, padding: '6px 0' }}>
                Eliminar producto
              </summary>
              <PanelForm action={remove} submit={`Sí, eliminar «${p.name}»`} danger>
                <input type="hidden" name="secret" value={secret} />
                <input type="hidden" name="id" value={p.id} />
              </PanelForm>
            </details>
          </details>
        ))}
        {products.length === 0 && <p className="muted">Todavía no hay productos. Cargá el primero arriba.</p>}
      </section>
    </div>
  )
}

function ProductForm({ secret, p }: { secret: string; p?: Product }) {
  return (
    <PanelForm action={save} submit={p ? 'Guardar cambios' : 'Agregar al catálogo'}>
      <input type="hidden" name="secret" value={secret} />
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="field">
        <label htmlFor={`n${p?.id ?? 0}`}>Nombre</label>
        <input id={`n${p?.id ?? 0}`} name="name" defaultValue={p?.name} required placeholder="Seda C 0.07 mix" />
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor={`p${p?.id ?? 0}`}>Precio</label>
          <input
            id={`p${p?.id ?? 0}`}
            name="price"
            type="number"
            step="0.01"
            inputMode="decimal"
            defaultValue={p?.price}
            placeholder="8500"
          />
        </div>
        <div className="field">
          <label htmlFor={`c${p?.id ?? 0}`}>Categoría</label>
          <input id={`c${p?.id ?? 0}`} name="category" defaultValue={p?.category} placeholder="Seda" />
        </div>
      </div>
      <div className="field">
        <label htmlFor={`d${p?.id ?? 0}`}>Descripción</label>
        <textarea id={`d${p?.id ?? 0}`} name="description" rows={3} defaultValue={p?.description} />
      </div>
      <div className="field">
        <label htmlFor={`f${p?.id ?? 0}`}>Foto (desde el celular)</label>
        <input id={`f${p?.id ?? 0}`} name="file" type="file" accept="image/*" />
      </div>
      <div className="field">
        <label htmlFor={`i${p?.id ?? 0}`}>…o pegar URL de imagen</label>
        <input id={`i${p?.id ?? 0}`} name="image" defaultValue={p?.image} placeholder="https://…" />
      </div>
      <label className="checkline">
        <input type="checkbox" name="in_stock" defaultChecked={p ? p.in_stock : true} />
        Disponible para la venta
      </label>
    </PanelForm>
  )
}
