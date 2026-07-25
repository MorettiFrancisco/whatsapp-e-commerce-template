'use client'

import { useActionState } from 'react'
import type { State } from './actions'

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
    <form action={formAction}>
      {children}
      {state?.error && <p className="msg err">{state.error}</p>}
      {state?.ok && <p className="msg ok">✓ {state.ok}</p>}
      <button className={`btn block${danger ? ' danger' : ''}`} type="submit" disabled={pending}>
        {pending ? 'Guardando…' : submit}
      </button>
    </form>
  )
}
