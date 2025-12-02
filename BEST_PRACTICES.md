# ✨ Best Practices для Animezilla 2026

## 🎯 Code Quality & Performance

### 1. TypeScript - Strict Mode
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2. ESLint + Prettier Configuration
```typescript
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}

// .prettierrc.json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### 3. Performance Optimization

#### Image Optimization
```typescript
import Image from 'next/image'

// ❌ BAD - не оптимізовано
<img src={posterUrl} alt={title} />

// ✅ GOOD - оптимізовано
<Image
  src={posterUrl}
  alt={title}
  width={200}
  height={300}
  placeholder="blur"
  blurDataURL={blurHash}
  quality={85}
  loading={isAboveFold ? 'eager' : 'lazy'}
/>
```

#### Code Splitting
```typescript
// ❌ BAD - весь код в одному бандлі
import { HeavyModal } from '@/components/HeavyModal'

// ✅ GOOD - динамічний імпорт
import dynamic from 'next/dynamic'

const HeavyModal = dynamic(
  () => import('@/components/HeavyModal'),
  { 
    loading: () => <Skeleton />,
    ssr: false // Не рендерити на сервері
  }
)
```

#### React Query Optimization
```typescript
// ❌ BAD - глобальний кеш для всього
useQuery({
  queryKey: ['animes'],
  queryFn: fetchAllAnimes
})

// ✅ GOOD - granular кешування з TTL
useQuery({
  queryKey: ['animes', { page, genre, sort }],
  queryFn: () => fetchAnimes({ page, genre, sort }),
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 30,   // 30 minutes
  keepPreviousData: true    // Smooth pagination
})
```

### 4. Database Performance

#### Efficient Queries
```typescript
// ❌ BAD - N+1 problem
const users = await db.user.findMany()
for (const user of users) {
  const watchlist = await db.watchList.findMany({
    where: { userId: user.id }
  })
}

// ✅ GOOD - eager loading
const users = await db.user.findMany({
  include: {
    watchlist: {
      include: {
        anime: {
          select: { id: true, title: true, rating: true }
        }
      }
    }
  }
})
```

#### Connection Pooling
```typescript
// .env
DATABASE_URL="postgresql://user:pass@host/db?connection_limit=20&pool_size=10"

// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn']
  })

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = db
```

---

## 🔒 Security Best Practices

### 1. Input Validation
```typescript
// ❌ BAD - без валідації
app.post('/comments', async (c) => {
  const { content } = await c.req.json()
  // Напряму в БД без перевірки
  await db.comment.create({ data: { content } })
})

// ✅ GOOD - Zod валідація
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Коментар не може бути пустим')
    .max(5000, 'Коментар завеликий')
    .trim()
})

app.post(
  '/comments',
  zValidator('json', CreateCommentSchema),
  async (c) => {
    const { content } = c.req.valid('json')
    const comment = await db.comment.create({
      data: { 
        content,
        authorId: c.get('userId')
      }
    })
    return c.json(comment)
  }
)
```

### 2. Authentication & Authorization
```typescript
// middleware.ts
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await auth()

  // Protect routes
  if (
    request.nextUrl.pathname.startsWith('/api/user') &&
    !session?.user?.id
  ) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Add user context
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', session?.user?.id || '')
  
  return NextResponse.next({
    request: { headers: requestHeaders }
  })
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*']
}
```

### 3. CSRF Protection
```typescript
// lib/csrf.ts
import { csrf } from '@hono/csrf'

export const csrfMiddleware = csrf({
  origin: [process.env.FRONTEND_URL]
})

// Use in routes
app.use(csrfMiddleware)

app.post('/api/anime/:id/rate', async (c) => {
  // CSRF token автоматично перевіряється
  const { rating } = await c.req.json()
  // Process...
})
```

### 4. Rate Limiting
```typescript
// lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
})

// API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')
  
  const { success, limit, remaining, reset } = 
    await ratelimit.limit(ip || 'anonymous')

  if (!success) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'Retry-After': new Date(reset).toUTCString(),
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString()
      }
    })
  }

  // Process request
}
```

### 5. Secure Headers
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

---

## 📝 Code Organization

### 1. Component Structure
```typescript
// ✅ GOOD - Clean component structure

'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/toast'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
  onDelete?: (id: number) => void
}

/**
 * PostCard component
 * Displays a single forum post with actions
 */
export function PostCard({
  post,
  onDelete
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { showError, showSuccess } = useToast()

  const { mutate: deletePost, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete')
      return res.json()
    },
    onSuccess: () => {
      showSuccess('Post deleted')
      onDelete?.(post.id)
    },
    onError: () => {
      showError('Failed to delete post')
    }
  })

  return (
    <article className="bg-slate-900 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-2">{post.title}</h3>
      <p className="text-gray-300 line-clamp-3">{post.content}</p>
      
      <div className="mt-4 flex gap-2">
        <Button 
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
        >
          {isExpanded ? 'Сховати' : 'Читати далі'}
        </Button>
        <Button
          onClick={() => deletePost()}
          isLoading={isPending}
          variant="destructive"
        >
          Видалити
        </Button>
      </div>
    </article>
  )
}
```

### 2. Custom Hooks Pattern
```typescript
// hooks/useAnimeFetch.ts
'use client'

import { useCallback, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'

interface UseAnimeFetchOptions {
  enabled?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

/**
 * Custom hook for fetching anime data
 */
export function useAnimeFetch(
  id: number,
  options?: UseAnimeFetchOptions
) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['anime', id],
    queryFn: async () => {
      const res = await fetch(`/api/anime/${id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 5
  })

  return { anime: data, isLoading, error }
}

// Usage
function AnimeDetail({ id }: { id: number }) {
  const { anime, isLoading } = useAnimeFetch(id)
  
  if (isLoading) return <Skeleton />
  return <div>{anime?.title}</div>
}
```

### 3. Service Layer Pattern
```typescript
// services/animeService.ts
import { db } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { es } from '@/lib/elasticsearch'

const CACHE_TTL = 3600 // 1 hour

class AnimeService {
  /**
   * Get anime by ID with caching
   */
  async getById(id: number) {
    const cacheKey = `anime:${id}`
    
    // Try cache first
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    // Fetch from DB
    const anime = await db.anime.findUnique({
      where: { id },
      include: {
        genres: { select: { name: true } },
        reviews: { take: 10, orderBy: { createdAt: 'desc' } }
      }
    })

    // Cache result
    if (anime) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(anime))
    }

    return anime
  }

  /**
   * Search anime with Elasticsearch
   */
  async search(query: string, page = 1) {
    const size = 20
    const from = (page - 1) * size

    const results = await es.search({
      index: 'anime',
      from,
      size,
      body: {
        query: {
          multi_match: {
            query,
            fields: ['title^3', 'description^2', 'genres'],
            fuzziness: 'AUTO'
          }
        }
      }
    })

    return {
      data: results.hits.hits.map(hit => hit._source),
      total: results.hits.total.value,
      hasMore: from + size < results.hits.total.value
    }
  }

  /**
   * Get recommendations for user
   */
  async getRecommendations(userId: string, limit = 20) {
    // Complex recommendation algorithm
    const recommendations = await this.hybridRecommend(userId)
    return recommendations.slice(0, limit)
  }

  private async hybridRecommend(userId: string) {
    // Collaborative filtering + content-based
    // Implementation...
  }
}

export const animeService = new AnimeService()
```

---

## 🧪 Testing Strategy

### 1. Unit Tests
```typescript
// __tests__/services/animeService.test.ts
import { animeService } from '@/services/animeService'
import { db } from '@/lib/prisma'

jest.mock('@/lib/prisma')

describe('AnimeService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getById', () => {
    it('should return anime by id', async () => {
      const mockAnime = { id: 1, title: 'Test Anime' }
      jest.spyOn(db.anime, 'findUnique').mockResolvedValue(mockAnime)

      const result = await animeService.getById(1)

      expect(result).toEqual(mockAnime)
      expect(db.anime.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })
  })
})
```

### 2. Component Tests
```typescript
// __tests__/components/AnimeCard.test.tsx
import { render, screen } from '@testing-library/react'
import { AnimeCard } from '@/components/anime/AnimeCard'

describe('AnimeCard', () => {
  it('should display anime title', () => {
    const anime = {
      id: 1,
      title: 'Attack on Titan',
      posterUrl: '/poster.jpg'
    }

    render(<AnimeCard {...anime} />)

    expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
  })

  it('should be clickable', () => {
    const anime = {
      id: 1,
      title: 'Demon Slayer',
      posterUrl: '/poster.jpg'
    }

    render(<AnimeCard {...anime} />)

    const card = screen.getByRole('link')
    expect(card).toHaveAttribute('href', '/anime/1')
  })
})
```

### 3. E2E Tests
```typescript
// e2e/anime.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Anime Catalog', () => {
  test('should search for anime', async ({ page }) => {
    await page.goto('/anime')
    
    await page.fill('input[placeholder="Пошук аніме..."]', 'Attack')
    await page.waitForTimeout(500)
    
    const results = await page.locator('[data-testid="search-result"]')
    expect(await results.count()).toBeGreaterThan(0)
  })

  test('should open anime detail page', async ({ page }) => {
    await page.goto('/anime')
    
    await page.click('[data-testid="anime-card"]:first-child')
    
    await expect(page).toHaveURL(/\/anime\/\d+/)
    await expect(page.locator('h1')).toBeVisible()
  })
})
```

---

## 📊 Monitoring & Logging

### 1. Structured Logging
```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
})

// Usage
logger.info({ userId: 123, action: 'login' }, 'User logged in')
logger.error({ error: err }, 'Failed to create post')
```

### 2. Error Tracking
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false
    })
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})

// Capture error with context
try {
  await someAsyncOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'anime_catalog',
      action: 'search'
    },
    level: 'error'
  })
}
```

### 3. Performance Monitoring
```typescript
// lib/analytics.ts
import { usePostHog } from 'posthog-js/react'

export function useAnalytics() {
  const posthog = usePostHog()

  const trackEvent = (event: string, properties?: Record<string, any>) => {
    posthog?.capture(event, properties)
  }

  const trackTiming = (event: string, duration: number) => {
    posthog?.capture(event, { duration_ms: duration })
  }

  return { trackEvent, trackTiming }
}
```

---

## 📋 Checklists

### Pre-Commit Checklist
```bash
# Code quality
npm run lint
npm run type-check
npm run format

# Tests
npm run test:unit
npm run test:component

# Build
npm run build
```

### Pre-Production Checklist
- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] Performance audits pass (Lighthouse 90+)
- [ ] Security audit passed
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Rollback plan documented

### Performance Checklist
- [ ] Largest Contentful Paint < 2.5s
- [ ] First Input Delay < 100ms
- [ ] Cumulative Layout Shift < 0.1
- [ ] Bundle size < 200KB (gzipped)
- [ ] Images optimized (WebP, responsive)
- [ ] Database queries < 100ms
- [ ] API responses < 500ms

---

Це **production-ready** набір best practices для weltklasse проекту! 🚀
