'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/db'
import type { Content } from '@/lib/content'
import { buildMessage, cartTotal, formatPrice, waLink } from '@/lib/wa'

type Line = { id: number; name: string; price: number; image: string; qty: number }
const KEY = 'lune-cart'

export default function Shop({ products, t }: { products: Product[]; t: Content }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Todos')
  const [sort, setSort] = useState('destacados')
  const [list, setList] = useState(false)
  const [cart, setCart] = useState<Line[]>([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')

  // el carrito y los datos del pedido sobreviven a un refresh
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
      setCart(saved.cart ?? [])
      setName(saved.name ?? '')
      setCity(saved.city ?? '')
    } catch {}
  }, [])
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ cart, name, city }))
  }, [cart, name, city])

  const cats = useMemo(
    () => ['Todos', ...[...new Set(products.map((p) => p.category).filter(Boolean))].sort()],
    [products]
  )

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase()
    const out = products.filter(
      (p) =>
        (cat === 'Todos' || p.category === cat) &&
        (!t || `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(t))
    )
    if (sort === 'precio-asc') out.sort((a, b) => a.price - b.price)
    if (sort === 'precio-desc') out.sort((a, b) => b.price - a.price)
    if (sort === 'nombre') out.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    return out
  }, [products, q, cat, sort])

  const add = (p: Product) =>
    setCart((c) =>
      c.some((l) => l.id === p.id)
        ? c.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l))
        : [...c, { id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 }]
    )
  const bump = (id: number, d: number) =>
    setCart((c) => c.flatMap((l) => (l.id !== id ? [l] : l.qty + d < 1 ? [] : [{ ...l, qty: l.qty + d }])))

  const units = cart.reduce((a, l) => a + l.qty, 0)
  const total = cartTotal(cart)
  const pedido = waLink(t.whatsapp, buildMessage({ name, city, items: cart }))

  return (
    <>
      <div className="topbar">
        <div className="wrap topbar__row">
          <Link href="/" className="iconbtn" aria-label="Volver al inicio">
            ←
          </Link>
          <h1 className="display">
            {t.name}
            <small>{t.tagline}</small>
          </h1>
          <button className="iconbtn" onClick={() => setOpen(true)} aria-label={`Carrito, ${units} items`}>
            🛍
            {units > 0 && <span className="badge">{units}</span>}
          </button>
        </div>
      </div>

      <div className="wrap">
        <div className="filters">
          <div className="search">
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Buscar seda, adhesivo, pinza…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar productos"
            />
            {q && (
              <button className="clear" onClick={() => setQ('')} aria-label="Limpiar búsqueda">
                ✕
              </button>
            )}
          </div>

          {cats.length > 1 && (
            <div className="chips" role="group" aria-label="Categorías">
              {cats.map((c) => (
                <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}

          <div className="toolbar">
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">
              <option value="destacados">Destacados</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
            <div className="viewtoggle">
              <button aria-pressed={!list} onClick={() => setList(false)} aria-label="Ver en cuadrícula">
                ▦
              </button>
              <button aria-pressed={list} onClick={() => setList(true)} aria-label="Ver en listado">
                ☰
              </button>
            </div>
          </div>
          <p className="count">
            {shown.length} {shown.length === 1 ? 'producto' : 'productos'}
            {cat !== 'Todos' && ` en ${cat}`}
          </p>
        </div>

        {shown.length === 0 ? (
          <div className="empty">
            <p className="display">Nada por acá</p>
            <p>
              {products.length === 0
                ? 'Todavía no cargamos productos. Escribinos por WhatsApp y te contamos qué hay.'
                : 'Probá con otra palabra o quitá los filtros.'}
            </p>
          </div>
        ) : (
          <div className={`grid${list ? ' list' : ''}`}>
            {shown.map((p, i) => (
              <article className="card" key={p.id} style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}>
                <div className="card__img">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 700px) 50vw, 300px"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <span className="ph">{t.name}</span>
                  )}
                </div>
                <div className="card__body">
                  {p.category && <span className="cat">{p.category}</span>}
                  <h3>{p.name}</h3>
                  {p.description && <p className="desc">{p.description}</p>}
                  <p className="price">{formatPrice(p.price)}</p>
                  {p.in_stock ? (
                    <button className="btn sm block" onClick={() => add(p)}>
                      Añadir
                    </button>
                  ) : (
                    <p className="out">Sin stock</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {units > 0 && !open && (
        <div className="cartbar">
          <button className="btn block" onClick={() => setOpen(true)}>
            Ver carrito · {units} · {formatPrice(total)}
          </button>
        </div>
      )}

      {open && (
        <div className="sheet" role="dialog" aria-modal="true" aria-label="Tu carrito">
          <div className="sheet__bg" onClick={() => setOpen(false)} />
          <div className="sheet__panel">
            <div className="sheet__head">
              <h2 className="display" style={{ fontSize: 24 }}>
                Tu pedido
              </h2>
              <button className="iconbtn" onClick={() => setOpen(false)} aria-label="Cerrar">
                ✕
              </button>
            </div>

            <div className="sheet__body">
              {cart.length === 0 && <p className="muted">Todavía no agregaste nada.</p>}
              {cart.map((l) => (
                <div className="line" key={l.id}>
                  {l.image ? (
                    <Image src={l.image} alt="" width={54} height={54} style={{ objectFit: 'cover' }} />
                  ) : (
                    <span className="ph">💜</span>
                  )}
                  <div className="info">
                    <b>{l.name}</b>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {formatPrice(l.price)} c/u
                    </span>
                  </div>
                  <div className="qty">
                    <button onClick={() => bump(l.id, -1)} aria-label={`Quitar uno de ${l.name}`}>
                      −
                    </button>
                    <span>{l.qty}</span>
                    <button onClick={() => bump(l.id, 1)} aria-label={`Agregar uno de ${l.name}`}>
                      +
                    </button>
                  </div>
                </div>
              ))}

              {cart.length > 0 && (
                <>
                  <div className="field">
                    <label htmlFor="n">Tu nombre</label>
                    <input id="n" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ana" />
                  </div>
                  <div className="field">
                    <label htmlFor="c">De dónde sos</label>
                    <input id="c" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Córdoba" />
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="sheet__foot">
                <div className="total">
                  <span className="muted">Total</span>
                  <b>{formatPrice(total)}</b>
                </div>
                <a className="btn wa block" href={pedido} target="_blank" rel="noopener">
                  Solicitar por WhatsApp
                </a>
                <button className="btn ghost dark block sm" onClick={() => setCart([])}>
                  Vaciar carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
