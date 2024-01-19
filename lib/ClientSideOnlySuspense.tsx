import { Suspense, type SuspenseProps } from 'react'

/**
 * Suspense component that only renders on client side.
 * We’re already aware that Suspense doesn’t work on server side.
 * This component truly embraces it. Gets rid of this error:
 *
 * Error: ReactDOMServer does not yet support Suspense.
 */
export const ClientSideOnlySuspense = ({
  shouldRenderChildrenOnSsr,
  children,
  isClient,
  fallback,
}: SuspenseProps & {
  /**
   * If true, children will be rendered on server side.
   * This is only safe if children don’t contain suspendable (throws promise) components.
   * Otherwise you’ll get ReactDOMServer does not yet support Suspense error (in older version of React/Next.js).
   */
  shouldRenderChildrenOnSsr?: boolean
  isClient: boolean
}) => {
  if (!isClient) {
    return shouldRenderChildrenOnSsr ? <>{children}</> : <>{fallback}</>
  }

  return <Suspense fallback={fallback}>{children}</Suspense>
}
