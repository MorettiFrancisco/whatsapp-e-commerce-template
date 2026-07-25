import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildMessage, cartTotal, waLink } from './wa.js'

const items = [
  { name: 'Pestañas C 0.07', price: 8000, qty: 2 },
  { name: 'Pinza curva', price: 12500, qty: 1 },
]

test('total suma cantidades', () => {
  assert.equal(cartTotal(items), 28500)
})

test('mensaje lista items, cantidad y total', () => {
  const msg = buildMessage({ name: 'Ana', city: 'Córdoba', items })
  assert.match(msg, /Mi nombre es Ana/)
  assert.match(msg, /soy de: Córdoba/)
  assert.match(msg, /- Pestañas C 0\.07 x2/)
  assert.match(msg, /- Pinza curva \(/)
  assert.doesNotMatch(msg, /Pinza curva x1/)
  assert.match(msg, /El total sería: .*28\.500/)
})

test('carrito vacío no rompe', () => {
  assert.match(buildMessage({ name: '', city: '', items: [] }), /El total sería/)
})

test('waLink limpia el teléfono y escapa el texto', () => {
  const url = waLink('+54 9 351 123-4567', 'hola mundo')
  assert.equal(url, 'https://wa.me/5493511234567?text=hola%20mundo')
})
