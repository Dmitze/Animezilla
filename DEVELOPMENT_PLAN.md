# 🚀 План розробки Animezilla - 2026

## 📋 Фази розвитку

### **ФАЗА 1: MVP (1-2 місяці)** 
*Мінімально життєздатний продукт*

#### 1.1 Базова структура
- [x] Next.js 14 проект з App Router
- [x] Design System (Tailwind + shadcn/ui)
- [x] PostgreSQL setup з Prisma
- [ ] Docker & docker-compose
- [ ] GitHub Actions CI/CD

```bash
# Встановлення
npx create-next-app@latest animezilla --typescript --tailwind
npm install @hookform/resolvers react-hook-form zod @tanstack/react-query zustand
npx prisma init
```

#### 1.2 Автентифікація
```typescript
// app/auth/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Вхід на Animezilla</h1>
        <LoginForm />
        <div className="mt-4">
          <button 
            onClick={() => signIn('github')}
            className="w-full btn btn-secondary"
          >
            Увійти через GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### 1.3 Каталог аніме
- [x] Сторінка списку аніме з пагінацією
- [x] Детальна сторінка аніме
- [x] Базовий пошук
- [x] Фільтрація за жанром

```typescript
// app/anime/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { AnimeGrid } from '@/components/anime/AnimeGrid'

export default function AnimeCatalog() {
  const { data: animes, isLoading } = useQuery({
    queryKey: ['animes'],
    queryFn: () => fetch('/api/anime').then(r => r.json())
  })

  if (isLoading) return <div>Завантаження...</div>
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Каталог аніме</h1>
      <AnimeGrid animes={animes} />
    </div>
  )
}
```

#### 1.4 API маршрути
```typescript
// app/api/anime/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const genre = searchParams.get('genre')

  const animes = await db.anime.findMany({
    where: {
      genre: genre ? { has: genre } : undefined
    },
    skip: (page - 1) * 20,
    take: 20,
    include: {
      genres: true,
      reviews: { take: 5 }
    }
  })

  return NextResponse.json(animes)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const anime = await db.anime.create({
    data: body
  })

  return NextResponse.json(anime, { status: 201 })
}
```

#### 1.5 Список перегляду користувача
```typescript
// app/dashboard/watchlist/page.tsx
export default async function WatchlistPage() {
  const session = await auth()
  
  if (!session) redirect('/login')

  const watchlist = await db.watchList.findMany({
    where: { userId: session.user.id },
    include: {
      anime: {
        include: { genres: true }
      }
    }
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Мій список</h1>
      <WatchlistGrid items={watchlist} />
    </div>
  )
}
```

---

### **ФАЗА 2: Спільнота (2-3 місяці)**
*Додання соціальних функцій*

#### 2.1 Система коментарів
```typescript
// components/anime/CommentSection.tsx
'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { CommentForm } from './CommentForm'

interface CommentSectionProps {
  animeId: number
}

export function CommentSection({ animeId }: CommentSectionProps) {
  const { data: comments } = useQuery({
    queryKey: ['anime', animeId, 'comments'],
    queryFn: () => 
      fetch(`/api/anime/${animeId}/comments`)
        .then(r => r.json())
  })

  const { mutate: postComment } = useMutation({
    mutationFn: (content: string) =>
      fetch(`/api/anime/${animeId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content })
      })
  })

  return (
    <div className="space-y-6">
      <CommentForm onSubmit={postComment} />
      <CommentList comments={comments} />
    </div>
  )
}
```

#### 2.2 Форум обговорення
```typescript
// app/forum/page.tsx
'use client'

import { CreatePostButton } from '@/components/forum/CreatePostButton'
import { PostList } from '@/components/forum/PostList'

export default function ForumPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Форум</h1>
        <CreatePostButton />
      </div>
      <PostList />
    </div>
  )
}
```

#### 2.3 Real-time коментарі з Socket.io
```typescript
// lib/socket.ts
import { io } from 'socket.io-client'

export const socket = io(process.env.NEXT_PUBLIC_API_URL)

// hooks/useComments.ts
'use client'

import { useEffect, useState } from 'react'
import { socket } from '@/lib/socket'

export function useComments(animeId: number) {
  const [comments, setComments] = useState([])

  useEffect(() => {
    // Join room
    socket.emit('join-anime', animeId)

    // Listen for new comments
    socket.on('comment:new', (comment) => {
      setComments(prev => [comment, ...prev])
    })

    return () => {
      socket.emit('leave-anime', animeId)
      socket.off('comment:new')
    }
  }, [animeId])

  const postComment = (content: string) => {
    socket.emit('comment:post', {
      animeId,
      content
    })
  }

  return { comments, postComment }
}
```

#### 2.4 Система рейтингів
```typescript
// app/api/anime/[id]/rate/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { rating } = await request.json()

  const review = await db.review.upsert({
    where: {
      userId_animeId: {
        userId: session.user.id,
        animeId: parseInt(params.id)
      }
    },
    update: { rating },
    create: {
      rating,
      userId: session.user.id,
      animeId: parseInt(params.id)
    }
  })

  return Response.json(review)
}
```

#### 2.5 Профілі користувачів
```typescript
// app/user/[username]/page.tsx
export default async function UserProfile({
  params
}: {
  params: { username: string }
}) {
  const user = await db.user.findUnique({
    where: { username: params.username },
    include: {
      profile: true,
      watchlist: { take: 6 },
      posts: { take: 10 }
    }
  })

  if (!user) return <div>Користувача не знайдено</div>

  return (
    <div className="container mx-auto py-8">
      <UserProfileCard user={user} />
      <UserWatchlist items={user.watchlist} />
      <UserPosts posts={user.posts} />
    </div>
  )
}
```

---

### **ФАЗА 3: Пошук & Рекомендації (3-4 місяці)**
*Розширена функціональність*

#### 3.1 Elasticsearch інтеграція
```typescript
// lib/elasticsearch.ts
import { Client } from '@elastic/elasticsearch'

export const es = new Client({
  node: process.env.ELASTICSEARCH_NODE
})

// Індексування аніме
export async function indexAnime(anime: Anime) {
  await es.index({
    index: 'anime',
    id: anime.id.toString(),
    body: {
      title: anime.title,
      description: anime.description,
      genres: anime.genres,
      year: anime.year,
      rating: anime.rating,
      poster: anime.posterUrl,
      suggest: {
        input: [anime.title, ...anime.genres],
        weight: Math.round(anime.rating * 10)
      }
    }
  })
}

// Пошук
export async function searchAnime(query: string) {
  const result = await es.search({
    index: 'anime',
    body: {
      query: {
        multi_match: {
          query,
          fields: ['title^3', 'description^2', 'genres'],
          fuzziness: 'AUTO'
        }
      },
      highlight: {
        fields: {
          title: {},
          description: {}
        }
      },
      size: 20
    }
  })

  return result.hits.hits.map(hit => hit._source)
}
```

#### 3.2 API маршрут для пошуку
```typescript
// app/api/search/route.ts
import { searchAnime, suggestAnime } from '@/lib/elasticsearch'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q) return Response.json([])

  const results = await searchAnime(q)
  return Response.json(results)
}

// Auto-complete suggestions
export async function POST(request: Request) {
  const { q } = await request.json()

  const suggestions = await suggestAnime(q)
  return Response.json(suggestions)
}
```

#### 3.3 Система рекомендацій
```typescript
// lib/recommendations.ts
import { db } from '@/lib/prisma'

interface RecommendationScore {
  animeId: number
  score: number
  reason: string
}

export async function getRecommendations(
  userId: string
): Promise<RecommendationScore[]> {
  // 1. Collaborative Filtering
  const userWatchlist = await db.watchList.findMany({
    where: { userId },
    include: { anime: { include: { genres: true } } }
  })

  const similarUsers = await findSimilarUsers(userId, userWatchlist)
  const cfRecommendations = await getCollaborativeFilteringRecs(similarUsers)

  // 2. Content-Based Filtering
  const userGenres = extractGenrePreferences(userWatchlist)
  const contentRecommendations = await getContentBasedRecs(userGenres)

  // 3. Hybrid scoring
  const combined = hybridScoring(
    cfRecommendations,
    contentRecommendations,
    0.6, // 60% collaborative
    0.4  // 40% content-based
  )

  return combined.slice(0, 20)
}

function hybridScoring(
  cf: RecommendationScore[],
  content: RecommendationScore[],
  cfWeight: number,
  contentWeight: number
): RecommendationScore[] {
  const scores = new Map<number, RecommendationScore>()

  for (const rec of cf) {
    const existing = scores.get(rec.animeId)
    scores.set(rec.animeId, {
      ...rec,
      score: (existing?.score || 0) + rec.score * cfWeight
    })
  }

  for (const rec of content) {
    const existing = scores.get(rec.animeId)
    scores.set(rec.animeId, {
      ...rec,
      score: (existing?.score || 0) + rec.score * contentWeight
    })
  }

  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
}
```

#### 3.4 Сторінка рекомендацій
```typescript
// app/recommendations/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export default function RecommendationsPage() {
  const { data: session } = useSession()
  
  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', session?.user?.id],
    queryFn: () =>
      fetch('/api/recommendations').then(r => r.json()),
    enabled: !!session?.user?.id
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Для вас</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations?.map(anime => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            reason={anime.reason}
          />
        ))}
      </div>
    </div>
  )
}
```

---

### **ФАЗА 4: Просунуті функції (4-6 місяців)**
*Enterprise функції*

#### 4.1 Система сповіщень
```typescript
// lib/notifications.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendNotification(
  userId: string,
  type: 'comment' | 'follow' | 'new_anime' | 'review_reply',
  data: any
) {
  const user = await db.user.findUnique({
    where: { id: userId }
  })

  const notification = await db.notification.create({
    data: {
      userId,
      type,
      data: JSON.stringify(data),
      isRead: false
    }
  })

  // Email notification
  if (user?.emailNotifications) {
    await resend.emails.send({
      from: 'notifications@animezilla.ua',
      to: user.email,
      subject: getNotificationSubject(type),
      html: getNotificationTemplate(type, data)
    })
  }

  // Push notification
  if (user?.pushTokens?.length > 0) {
    await sendPushNotifications(user.pushTokens, notification)
  }

  return notification
}
```

#### 4.2 PWA (Progressive Web App)
```typescript
// public/manifest.json
{
  "name": "Animezilla",
  "short_name": "Animezilla",
  "description": "Український аніме-хаб",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0A0A",
  "theme_color": "#00D9C0",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

#### 4.3 Кешування і offline функціональність
```typescript
// public/service-worker.js
const CACHE_NAME = 'animezilla-v1'
const urlsToCache = [
  '/',
  '/offline.html',
  '/styles/main.css',
  '/js/main.js'
]

// Cache on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache)
    })
  )
})

// Serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request)
      })
      .catch(() => caches.match('/offline.html'))
  )
})
```

#### 4.4 Analytics & Monitoring
```typescript
// app/layout.tsx
import * as Sentry from "@sentry/nextjs"
import { PostHogProvider } from '@/lib/posthog'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
})

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <PostHogProvider>
        <body>{children}</body>
      </PostHogProvider>
    </html>
  )
}
```

---

### **ФАЗА 5: Масштабування (6+ місяців)**
*Готування до продакшену*

#### 5.1 Оптимізація навантаження БД
```typescript
// Database indexing
await db.$executeRaw`
  CREATE INDEX CONCURRENTLY idx_anime_genres 
  ON anime USING GIN(genres);
  
  CREATE INDEX CONCURRENTLY idx_posts_created 
  ON posts(created_at DESC);
  
  CREATE INDEX CONCURRENTLY idx_watchlist_user 
  ON watchlist(user_id);
`

// Connection pooling with Prisma
// .env
DATABASE_URL="postgresql://user:pass@localhost:5432/animezilla?schema=public&connection_limit=20"
```

#### 5.2 CDN інтеграція
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.animezilla.ua',
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
}

module.exports = nextConfig
```

#### 5.3 Horizontal scaling
```yaml
# kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: animezilla-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: app
        image: animezilla:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## 📅 Тимлайн

| Період | Фаза | Результат |
|--------|------|-----------|
| **Тиждень 1-2** | 1.1-1.2 | Next.js проект, Auth |
| **Тиждень 3-4** | 1.3-1.4 | Каталог, API |
| **Тиждень 5-8** | 2.1-2.5 | Спільнота, коментарі |
| **Тиждень 9-12** | 3.1-3.4 | Пошук, рекомендації |
| **Місяць 4-6** | 4.1-4.4 | PWA, сповіщення, аналітика |
| **Місяць 6+** | 5.1-5.3 | Масштабування, продакшен |

---

## 🎯 KPI & Метрики

```typescript
// Відстеження успіху проекту
const KPIs = {
  // Performance
  pageLoadTime: '< 2s',
  firstContentfulPaint: '< 1.2s',
  coreWebVitals: 'all green',
  
  // Engagement
  monthlyActiveUsers: '10K → 1M',
  dailyActiveUsers: '1K → 100K',
  commentPerDay: '100 → 10K',
  
  // Business
  premiumSubscribers: '5% → 30%',
  userRetention: '30% → 70%',
  nps: '0 → 50+',
  
  // Technical
  uptime: '99.9%',
  errorRate: '< 0.1%',
  databaseQueryTime: '< 100ms',
  redisHitRate: '> 80%'
}
```

---

Це **реалістичний план** для побудови **world-class** аніме-сервісу! 🎌✨
