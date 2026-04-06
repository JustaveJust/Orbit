import { useCallback, useEffect, useRef, useState } from 'react'

export function useSensorPoll<T>(
  fetcher: () => Promise<T>,
  intervalMs = 5000,
): { data: T | null; error: string | null; isLoading: boolean } {
  const [data, setData]       = useState<T | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const mountedRef = useRef(true)

  const load = useCallback(async () => {
    try {
      const result = await fetcher()
      if (mountedRef.current) {
        setData(result)
        setError(null)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load sensor data')
      }
    } finally {
      if (mountedRef.current) setIsLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    mountedRef.current = true
    void load()
    const timer = setInterval(() => { void load() }, intervalMs)
    return () => {
      mountedRef.current = false
      clearInterval(timer)
    }
  }, [load, intervalMs])

  return { data, error, isLoading }
}
