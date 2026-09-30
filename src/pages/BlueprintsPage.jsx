import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  appendPoint,
  createBlueprint,
  deleteBlueprint,
  fetchAuthors,
  fetchBlueprint,
  fetchByAuthor,
  removeBlueprintLocally,
  replaceBlueprintPoints,
  updateBlueprint,
} from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import BlueprintForm from '../components/BlueprintForm.jsx'
import BlueprintList from '../components/BlueprintList.jsx'
import { createStompClient, subscribeBlueprint } from '../services/stompClient.js'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const { byAuthor, current, status } = useSelector((s) => s.blueprints)
  const clientRef = useRef(null)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [realtimeMode, setRealtimeMode] = useState('none')
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [operationError, setOperationError] = useState('')
  const [saving, setSaving] = useState(false)
  const items = byAuthor[selectedAuthor] || []

  useEffect(() => {
    dispatch(fetchAuthors())
  }, [dispatch])

  useEffect(() => {
    if (realtimeMode !== 'stomp' || !current) {
      setConnectionStatus('disconnected')
      return undefined
    }

    let active = true
    let subscription
    const client = createStompClient(
      import.meta.env.VITE_STOMP_BASE_URL || 'http://localhost:8080',
    )
    client.onConnect = () => {
      if (!active) return
      setConnectionStatus('connected')
      subscription = subscribeBlueprint(client, current.author, current.name, (event) => {
        if (event.type === 'UPDATED') {
          dispatch(
            replaceBlueprintPoints({
              author: current.author,
              name: current.name,
              points: event.points,
            }),
          )
        } else if (event.type === 'DELETED') {
          dispatch(removeBlueprintLocally({ author: current.author, name: current.name }))
        } else if (event.point) {
          dispatch(
            appendPoint({
              author: event.author || current.author,
              name: event.name || current.name,
              point: event.point,
            }),
          )
        }
      })
    }
    client.onWebSocketClose = () => {
      if (active) setConnectionStatus('disconnected')
    }
    client.onStompError = () => {
      if (active) setConnectionStatus('error')
    }
    client.activate()
    clientRef.current = client

    return () => {
      active = false
      subscription?.unsubscribe()
      if (clientRef.current === client) clientRef.current = null
      void client.deactivate()
    }
  }, [current?.author, current?.name, dispatch, realtimeMode])

  const totalPoints = useMemo(
    () => items.reduce((acc, bp) => acc + (bp.points?.length || 0), 0),
    [items],
  )

  const getBlueprints = () => {
    if (!authorInput) return
    setSelectedAuthor(authorInput)
    dispatch(fetchByAuthor(authorInput))
  }

  const openBlueprint = (bp) => {
    setOperationError('')
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }

  const create = async (blueprint) => {
    setOperationError('')
    try {
      await dispatch(createBlueprint(blueprint)).unwrap()
      setAuthorInput(blueprint.author)
      setSelectedAuthor(blueprint.author)
      await dispatch(fetchByAuthor(blueprint.author)).unwrap()
    } catch (error) {
      setOperationError(error.message || 'No se pudo crear el blueprint.')
    }
  }

  const saveCurrent = async () => {
    if (!current) return
    setSaving(true)
    setOperationError('')
    try {
      await dispatch(updateBlueprint(current)).unwrap()
      await dispatch(fetchByAuthor(current.author)).unwrap()
    } catch (error) {
      setOperationError(error.message || 'No se pudo guardar el blueprint.')
    } finally {
      setSaving(false)
    }
  }

  const removeCurrent = async () => {
    if (!current || !window.confirm(`¿Eliminar ${current.name}?`)) return
    setSaving(true)
    setOperationError('')
    try {
      await dispatch(deleteBlueprint({ author: current.author, name: current.name })).unwrap()
      await dispatch(fetchByAuthor(current.author)).unwrap()
    } catch (error) {
      setOperationError(error.message || 'No se pudo eliminar el blueprint.')
    } finally {
      setSaving(false)
    }
  }

  const addPoint = (point) => {
    if (!current) return
    if (realtimeMode === 'stomp') {
      if (!clientRef.current?.connected) {
        setOperationError('STOMP aún no está conectado; el punto no se envió.')
        return
      }
      clientRef.current.publish({
        destination: '/app/draw',
        body: JSON.stringify({
          author: current.author,
          name: current.name,
          point,
        }),
      })
      return
    }
    dispatch(appendPoint({ author: current.author, name: current.name, point }))
  }

  return (
    <div className="grid blueprints-layout">
      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Blueprints</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              className="input"
              placeholder="Author"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
            />
            <button className="btn primary" onClick={getBlueprints}>
              Get blueprints
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            {selectedAuthor ? `${selectedAuthor}'s blueprints:` : 'Results'}
          </h3>
          {status === 'loading' && <p>Cargando...</p>}
          <BlueprintList items={items} onSelect={openBlueprint} />
          <p style={{ marginTop: 12, fontWeight: 700 }}>Total user points: {totalPoints}</p>
        </div>
        <BlueprintForm onSubmit={create} />
      </section>

      <section className="card">
        <div className="blueprint-toolbar">
          <h3 style={{ margin: 0 }}>Current blueprint: {current?.name || '—'}</h3>
          <label className="realtime-control">
            RT
            <select
              aria-label="Real-time mode"
              className="input"
              value={realtimeMode}
              onChange={(event) => setRealtimeMode(event.target.value)}
            >
              <option value="none">None</option>
              <option value="stomp">STOMP</option>
            </select>
          </label>
        </div>
        {realtimeMode === 'stomp' && (
          <p role="status" className="connection-status">
            {current ? `STOMP: ${connectionStatus}` : 'Abre un plano para conectar STOMP.'}
          </p>
        )}
        {operationError && <p role="alert">{operationError}</p>}
        <BlueprintCanvas points={current?.points || []} onPoint={current ? addPoint : undefined} />
        <div className="blueprint-actions">
          <button className="btn primary" onClick={saveCurrent} disabled={!current || saving}>
            Save / Update
          </button>
          <button className="btn" onClick={removeCurrent} disabled={!current || saving}>
            Delete
          </button>
        </div>
      </section>
    </div>
  )
}

{/*
          {!items.length && status !== 'loading' && <p>Sin resultados.</p>}
          {!!items.length && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '8px',
                        borderBottom: '1px solid #334155',
                      }}
                    >
                      Blueprint name
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '8px',
                        borderBottom: '1px solid #334155',
                      }}
                    >
                      Number of points
                    </th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #334155' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((bp) => (
                    <tr key={bp.name}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                        {bp.name}
                      </td>
                      <td
                        style={{
                          padding: '8px',
                          textAlign: 'right',
                          borderBottom: '1px solid #1f2937',
                        }}
                      >
                        {bp.points?.length || 0}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                        <button className="btn" onClick={() => openBlueprint(bp)}>
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ marginTop: 12, fontWeight: 700 }}>Total user points: {totalPoints}</p>
        </div>
      </section>
*/}