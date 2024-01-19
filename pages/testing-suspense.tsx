import { useState } from 'react'
import { ClientSideOnlySuspense } from '@/lib/ClientSideOnlySuspense'
import { ErrorBoundary } from '@/lib/ErrorBoundary'
import { clear, preload, suspend } from '@/lib/suspend-react'
import { useIsClient } from '@/lib/useIsClient'
import { useEffectOnce, useIsomorphicLayoutEffect } from '@/lib/useEffectUtils'
import { Loading } from '@/lib/Loading'

// typicode post
type Post = {
  userId: number
  id: number
  title: string
  body: string
}

const postKey = Symbol()

const getPostCacheKey = (id: number): [number, typeof postKey] => [id, postKey]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getPost = async (id: number) => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
  if (!res.ok) {
    throw new Error(res.status.toString())
  }
  const json = (await res.json()) as Post
  return json
}

const PostInner = ({
  getData,
  onReload,
}: {
  id: number
  getData: () => Post
  onReload: () => void
}) => {
  const data = getData()

  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.body}</p>

      <button type="button" onClick={onReload}>
        Refetch post
      </button>
    </article>
  )
}

const useSuspendSsrData = (id: number, ssrData?: Post) => {
  const isClient = useIsClient()

  // fill the SSR’d item data to the cache
  useEffectOnce(() => {
    if (ssrData) {
      preload(Promise.resolve(ssrData), getPostCacheKey(id))
    }
  }, useIsomorphicLayoutEffect)

  const getData = () => {
    const data = isClient ? suspend(getPost, getPostCacheKey(id)) : ssrData
    return data
  }

  return getData
}

const Post = ({ id, ssrDataForId }: { id: number; ssrDataForId?: Post }) => {
  const [, forceUpdate] = useState({})

  const getData = useSuspendSsrData(id, ssrDataForId)

  const isClient = useIsClient()

  return (
    <>
      <div>Displaying post with ID: {id}</div>

      <ErrorBoundary
        id={id}
        fallback={({ resetError }) => (
          <div>
            <div>
              Hi, ErrorBoundary here, an error occurred trying to get data
            </div>

            <button
              type="button"
              onClick={() => {
                clear(getPostCacheKey(id))
                resetError()
              }}
            >
              Reload
            </button>
          </div>
        )}
      >
        <ClientSideOnlySuspense
          isClient={isClient}
          fallback={<Loading />}
          shouldRenderChildrenOnSsr={Boolean(ssrDataForId)}
        >
          <PostInner
            id={id}
            getData={getData}
            onReload={() => {
              clear(getPostCacheKey(id))
              forceUpdate({})
            }}
          />
        </ClientSideOnlySuspense>
      </ErrorBoundary>
    </>
  )
}

const ssrData: Record<number, Post> = {
  1: {
    userId: 1,
    id: 1,
    title:
      '(SSR) sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
    body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
  },
}

export default function SuspendTestingPage() {
  const [id, setId] = useState(1)
  const ssrDataForId = ssrData[id]

  return (
    <div>
      <div>
        {Array.from({ length: 6 }, (_, i) => {
          const preloadData = () => preload(getPost, getPostCacheKey(i - 1))

          return (
            <button
              key={i - 1}
              type="button"
              onClick={() => setId(i - 1)}
              onMouseEnter={preloadData}
              onFocus={preloadData}
            >
              {i - 1}
            </button>
          )
        })}
      </div>

      <Post id={id} ssrDataForId={ssrDataForId} />
    </div>
  )
}
