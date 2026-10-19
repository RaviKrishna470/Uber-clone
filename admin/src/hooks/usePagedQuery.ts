import { useCallback, useEffect, useState } from 'react'

import type { Page } from '@/types'
import { getErrorMessage } from '@/utils/appError'

/** Loads a server-paginated list whenever `deps` change; exposes reload() for after mutations. */
export function usePagedQuery<T>(fetcher: () => Promise<Page<T>>, deps: unknown[]) {
  const [data, setData] = useState<Page<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fetcher, deps)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await load())
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [load])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload, setError }
}

/** Debounces a fast-changing value (search box). */
export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return v
}
