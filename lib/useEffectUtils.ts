import { EffectCallback, useEffect, useLayoutEffect } from 'react'

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export const useEffectOnce = (
  cb: EffectCallback,
  useEffectFn: typeof useEffect
) => useEffectFn(cb, [])
