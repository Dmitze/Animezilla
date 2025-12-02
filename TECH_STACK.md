# Технологічний стек Animezilla 2026

## 🎯 Огляд

Це **сучасна, скалюєма, enterprise-grade** платформа для спільноти аніме, розроблена з використанням best practices 2026 року.

---

## 🖥️ Frontend Stack

### **Next.js 14** (Framework)
```json
{
  "version": "14.0+",
  "features": [
    "App Router (Server & Client Components)",
    "Streaming SSR",
    "ISR (Incremental Static Regeneration)",
    "API Routes + Edge Runtime",
    "Built-in Image Optimization",
    "Font Optimization with next/font"
  ]
}
```

**Чому Next.js?**
- ✅ Server Components зменшують JS на клієнті
- ✅ Full-stack framework (frontend + backend)
- ✅ Built-in performance optimizations
- ✅ Serverless deployment на Vercel
- ✅ Incremental Static Regeneration (ISR) для кешування

### **React 19** (UI Library)
```typescript
// Server Component - батьківський компонент
export default async function AnimeList() {
  const animes = await fetchAnimes()
  
  return (
    <div>
      {animes.map(anime => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  )
}

// Client Component - інтерактивна частина
'use client'
function AnimeCard({ anime }: Props) {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(!liked)}>♥</button>
}
```

**Нові можливості React 19:**
- Concurrent Rendering (оновлення без блокування UI)
- Automatic Batching
- Transitions API для state updates
- Server Components ( 0-JS components)
- Async Components

### **TypeScript** (Type Safety)
```typescript
// Повна типізація скрізь код
interface Anime {
  id: number
  title: string
  rating: number
  episodes: Episode[]
  genres: Genre[]
  status: 'Ongoing' | 'Completed' | 'Upcoming'
}

type AnimeFilter = {
  genre?: string
  year?: number
  status?: Anime['status']
}

// Type-safe API call
async function searchAnime(
  filter: AnimeFilter
): Promise<Anime[]> {
  // IDE автоматично знає всі поля
}
```

### **TailwindCSS 4** (Styling)
```css
/* @layer директиви для організації стилів */
@layer components {
  @define-component card {
    @apply bg-slate-900 rounded-lg p-4 shadow-lg;
  }
}

/* CSS Grid/Flex з utility classes */
<div class="grid grid-cols-auto-fit gap-4">
  <div class="animate-fade-in">Content</div>
</div>
```

**Переваги:**
- ✅ Нема CSS перевантажувального коду
- ✅ Dark mode вбудований
- ✅ Accessibility first
- ✅ JIT compilation
- ✅ Smaller bundle

### **shadcn/ui** (Component Library)
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Копіюєте код компонента в свій проект
// Повна кастомізація без vendor lock-in
```

**Чому?**
- Headless компоненти (не навʼязує дизайн)
- Доступність (ARIA атрибути)
- Copy-paste компоненти (контроль коду)
- 200+ готових компонентів

### **Zustand** (State Management)
```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface AuthStore {
  user: User | null
  isLoading: boolean
  login: (credentials) => Promise<void>
  logout: () => void
}

const useAuth = create<AuthStore>(
  subscribeWithSelector((set) => ({
    user: null,
    isLoading: false,
    login: async (credentials) => {
      set({ isLoading: true })
      const user = await loginAPI(credentials)
      set({ user, isLoading: false })
    },
    logout: () => set({ user: null })
  }))
)

// Використання
function Component() {
  const { user, login } = useAuth()
  return <div>{user?.name}</div>
}
```

**Переваги:**
- ✅ Легше Redux
- ✅ Без boilerplate
- ✅ DevTools support
- ✅ Hydration friendly
- ✅ ~2KB bundle size

### **TanStack Query** (Server State)
```typescript
import { useQuery } from '@tanstack/react-query'

function AnimeDetail({ id }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => fetchAnime(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes
  })
  
  if (isLoading) return <Skeleton />
  if (error) return <Error message={error.message} />
  
  return <AnimeCard anime={data} />
}
```

**Зберігає:**
- ✅ Background refetching
- ✅ Smart caching
- ✅ Automatic garbage collection
- ✅ Optimistic updates
- ✅ Infinite queries

### **Zod** (Runtime Validation)
```typescript
import { z } from 'zod'

const AnimeSchema = z.object({
  id: z.number().positive(),
  title: z.string().min(1).max(255),
  rating: z.number().min(0).max(10),
  genres: z.array(z.string()),
  episodes: z.number().min(1).optional(),
  status: z.enum(['Ongoing', 'Completed', 'Upcoming'])
})

// Type inference
type Anime = z.infer<typeof AnimeSchema>

// Runtime validation
const anime = AnimeSchema.parse(data)
```

### **framer-motion** (Animations)
```typescript
import { motion } from 'framer-motion'

export function AnimeCard({ anime }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -10 }}
      transition={{ type: 'spring', stiffness: 300 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Image src={anime.poster} alt={anime.title} />
    </motion.div>
  )
}
```

### **next-intl** (Internationalization)
```typescript
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('home')
  
  return (
    <>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </>
  )
}
```

---

## 🔌 Backend Stack

### **Hono.js** (Web Framework)
```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

// Type-safe validation
const searchValidator = zValidator('query', z.object({
  q: z.string(),
  genre: z.string().optional()
}))

app.get('/anime/search', searchValidator, async (c) => {
  const { q, genre } = c.req.valid('query')
  
  const results = await db.anime.findMany({
    where: {
      title: { contains: q },
      genre: genre ? { has: genre } : undefined
    }
  })
  
  return c.json(results)
})

export default app
```

**Чому Hono?**
- ✅ Швидше ніж Express (175k req/s)
- ✅ Легко переносити на Edge
- ✅ TypeScript-first
- ✅ Мала footprint (14KB)
- ✅ Middleware chain pattern

### **Fastify** (Alternative)
```typescript
import Fastify from 'fastify'

const fastify = Fastify({ logger: true })

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET
})

fastify.post<{ Body: LoginRequest }>(
  '/auth/login',
  {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      }
    }
  },
  async (request, reply) => {
    const user = await db.user.findUnique({
      where: { email: request.body.email }
    })
    
    const token = fastify.jwt.sign({ userId: user.id })
    reply.send({ token })
  }
)

await fastify.listen({ port: 3000 })
```

### **Prisma ORM** (Database)
```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  username  String  @unique
  password  String  @db.VarChar(255)
  profile   Profile?
  
  // Relations
  watchlist     Anime[]      @relation("UserWatchlist")
  posts         Post[]
  comments      Comment[]
  follows       User[]       @relation("UserFollows")
  followers     User[]       @relation("UserFollows")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Anime {
  id          Int     @id
  title       String  @db.VarChar(255)
  description String  @db.Text
  posterUrl   String
  episodes    Int
  status      Status  @default(UPCOMING)
  
  // Full-text search index
  searchVector Unsupported("tsvector")?
  
  genres      Genre[]        @relation("AnimeGenres")
  reviews     Review[]
  watchers    User[]         @relation("UserWatchlist")
  
  @@index([status])
  @@fulltext([title, description])
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String  @db.Text
  
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
  
  comments  Comment[]
  likes     Int     @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([authorId])
  @@index([createdAt])
}

enum Status {
  UPCOMING
  ONGOING
  COMPLETED
}
```

---

## 🗄️ Database Stack

### **PostgreSQL 16** (Primary Database)
```sql
-- Connection pooling with PgBouncer
-- Max connections: 1000
-- Pool size per app: 20

-- Advanced features
CREATE TABLE anime_fts AS
SELECT 
  id,
  title,
  to_tsvector('ukrainian', title || ' ' || description) as search_vector
FROM anime;

CREATE INDEX idx_anime_search ON anime_fts 
  USING GIN(search_vector);

-- Partitioning for large tables
CREATE TABLE posts_2024 PARTITION OF posts
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

**Чому PostgreSQL?**
- ✅ JSONB для гнучкості
- ✅ Full-text search
- ✅ Array & UUID types
- ✅ Window functions
- ✅ Horizontal scaling з Citus

### **Redis** (Caching & Sessions)
```typescript
import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000)
})

// Session storage
async function saveSession(userId: string, token: string) {
  await redis.setex(
    `session:${token}`,
    3600, // 1 hour TTL
    JSON.stringify({ userId })
  )
}

// Cache with invalidation
async function getCachedAnime(id: number) {
  const cached = await redis.get(`anime:${id}`)
  
  if (cached) return JSON.parse(cached)
  
  const anime = await db.anime.findUnique({ where: { id } })
  
  // Cache for 1 hour
  await redis.setex(
    `anime:${id}`,
    3600,
    JSON.stringify(anime)
  )
  
  return anime
}

// Real-time notifications
async function publishNotification(userId: string, notification: any) {
  await redis.publish(
    `notifications:${userId}`,
    JSON.stringify(notification)
  )
}
```

### **Elasticsearch** (Full-Text Search)
```typescript
import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE
})

// Index anime data
async function indexAnime(anime: Anime) {
  await client.index({
    index: 'anime',
    id: anime.id.toString(),
    body: {
      title: anime.title,
      description: anime.description,
      genres: anime.genres,
      rating: anime.rating,
      episodes: anime.episodes,
      suggest: {
        input: [anime.title, ...anime.genres],
        weight: anime.rating
      }
    }
  })
}

// Search with fuzzy matching
async function searchAnime(query: string) {
  const results = await client.search({
    index: 'anime',
    body: {
      query: {
        multi_match: {
          query,
          fields: ['title^3', 'description', 'genres^2'],
          fuzziness: 'AUTO',
          operator: 'and'
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
  
  return results.hits.hits
}

// Auto-complete suggestions
async function getSuggestions(prefix: string) {
  const results = await client.search({
    index: 'anime',
    body: {
      suggest: {
        anime_suggest: {
          prefix,
          completion: {
            field: 'suggest',
            size: 10,
            skip_duplicates: true
          }
        }
      }
    }
  })
  
  return results.suggest.anime_suggest[0].options
}
```

---

## 🔄 Real-Time Features

### **Socket.io** (WebSocket)
```typescript
import { Server } from 'socket.io'

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  // Join room for anime discussions
  socket.on('join-anime-room', (animeId) => {
    socket.join(`anime:${animeId}`)
  })
  
  // Real-time comments
  socket.on('post-comment', async (data) => {
    const comment = await db.comment.create({
      data: {
        content: data.content,
        animeId: data.animeId,
        userId: socket.data.userId
      },
      include: {
        author: {
          select: { username: true, avatar: true }
        }
      }
    })
    
    // Broadcast to all in room
    io.to(`anime:${data.animeId}`).emit('new-comment', comment)
  })
  
  // Typing indicator
  socket.on('typing', (animeId) => {
    socket.broadcast.to(`anime:${animeId}`).emit('user-typing', {
      userId: socket.data.userId,
      username: socket.data.username
    })
  })
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})
```

---

## 🔐 Authentication & Security

### **NextAuth.js** (Auth)
```typescript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'

export const { handlers, auth } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),
    CredentialsProvider({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        const user = await db.user.findUnique({
          where: { email: credentials?.email }
        })
        
        if (!user) return null
        
        const passwordMatch = await bcrypt.compare(
          credentials?.password || '',
          user.password
        )
        
        return passwordMatch ? user : null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    }
  }
})

// Usage in Server Component
export default async function Dashboard() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }
  
  return <div>Welcome {session.user.name}</div>
}
```

### **Rate Limiting**
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(
    10, // 10 requests
    '10 s' // per 10 seconds
  )
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')
  
  const { success } = await ratelimit.limit(ip || '')
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 })
  }
  
  // Process request
}
```

---

## 📊 Monitoring & Analytics

### **Sentry** (Error Tracking)
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.url?.includes('/api/auth')) {
      return null
    }
    return event
  }
})
```

### **PostHog** (Product Analytics)
```typescript
import { usePostHog } from 'posthog-js/react'

function AnimeCard({ anime }) {
  const posthog = usePostHog()
  
  const handleClick = () => {
    posthog.capture('anime_clicked', {
      anime_id: anime.id,
      title: anime.title,
      genres: anime.genres,
      rating: anime.rating
    })
  }
  
  return <div onClick={handleClick}>...</div>
}
```

---

## 🚀 DevOps & Deployment

### **Containerization**
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

### **docker-compose.yml**
```yaml
version: '3.9'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/animezilla
      REDIS_URL: redis://redis:6379
      ELASTICSEARCH_NODE: http://elasticsearch:9200
    depends_on:
      - postgres
      - redis
      - elasticsearch

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: animezilla
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
```

### **GitHub Actions CI/CD**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

      - name: Deploy to Vercel
        uses: vercel/action@v5
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📦 Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^19.0.0",
    "typescript": "^5.3.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "react-hook-form": "^7.48.0",
    "@tanstack/react-query": "^5.16.0",
    "zustand": "^4.4.0",
    "framer-motion": "^10.16.0",
    "next-intl": "^3.0.0",
    "tailwindcss": "^3.3.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "@prisma/client": "^5.6.0",
    "hono": "^3.12.0",
    "socket.io": "^4.7.0",
    "ioredis": "^5.3.0",
    "@elastic/elasticsearch": "^8.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@testing-library/react": "^14.1.0",
    "jest": "^29.7.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "prisma": "^5.6.0"
  }
}
```

---

## ✅ Порівняння з конкурентами

| Feature | Animezilla | MAL | AniList |
|---------|-----------|-----|---------|
| **Tech Stack** | Next.js 14 + Hono | Node.js + GraphQL | Next.js + GraphQL |
| **Performance** | ⚡⚡⚡ | ⚡⚡ | ⚡⚡⚡ |
| **Type Safety** | TypeScript ✓ | JavaScript ⚠ | TypeScript ✓ |
| **Real-time** | WebSocket ✓ | No | Subscriptions ✓ |
| **AI/ML** | Recommendations ✓ | Basic | Advanced |
| **Mobile** | PWA | App | App |
| **Customization** | High | Low | Medium |

---

Це **production-ready** стек для побудови світового сервісу 2026 року! 🚀
