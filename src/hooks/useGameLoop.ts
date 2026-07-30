import { useEffect, useRef, useCallback } from 'react'

interface GameLoopOptions {
  onUpdate: (deltaTime: number, totalTime: number) => void
  onRender?: (interpolation: number) => void
  targetFPS?: number
  running?: boolean
}

export function useGameLoop({
  onUpdate,
  onRender,
  targetFPS = 60,
  running = true,
}: GameLoopOptions) {
  const requestRef = useRef<number>(0)
  const previousTimeRef = useRef<number>(0)
  const accumulatorRef = useRef<number>(0)
  const totalTimeRef = useRef<number>(0)

  const timestep = 1000 / targetFPS

  const loop = useCallback(
    (currentTime: number) => {
      if (previousTimeRef.current === 0) {
        previousTimeRef.current = currentTime
      }

      const deltaTime = currentTime - previousTimeRef.current
      previousTimeRef.current = currentTime

      accumulatorRef.current += deltaTime
      totalTimeRef.current += deltaTime

      while (accumulatorRef.current >= timestep) {
        onUpdate(timestep, totalTimeRef.current)
        accumulatorRef.current -= timestep
      }

      if (onRender) {
        const interpolation = accumulatorRef.current / timestep
        onRender(interpolation)
      }

      requestRef.current = requestAnimationFrame(loop)
    },
    [onUpdate, onRender, timestep]
  )

  useEffect(() => {
    if (running) {
      previousTimeRef.current = 0
      accumulatorRef.current = 0
      requestRef.current = requestAnimationFrame(loop)
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [running, loop])

  const reset = useCallback(() => {
    previousTimeRef.current = 0
    accumulatorRef.current = 0
    totalTimeRef.current = 0
  }, [])

  return { reset }
}
