import { useCallback, useLayoutEffect, useState } from 'react'

/**
 * 요소의 content 폭(px)을 ResizeObserver 로 추적 (측정 전에는 null).
 * 반환한 ref 콜백을 측정할 요소에 달면 요소가 교체(재마운트)돼도 따라간다.
 */
export const useElementWidth = () => {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [width, setWidth] = useState<number | null>(null)
  const elementRef = useCallback((node: HTMLElement | null) => setElement(node), [])

  useLayoutEffect(() => {
    if (!element) return

    const updateWidth = () => setWidth(element.clientWidth)
    updateWidth()

    if (typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [element])

  return { elementRef, width }
}
