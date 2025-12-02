# Архітектура Animezilla - Сучасний веб-стек 2026

## 📊 Архітектурна модель

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Frontend)                   │
│  Next.js 14 + React 19 + TypeScript + TailwindCSS + shadcn   │
│                     (Server Components)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┬──────────────┐
        │                             │              │
┌───────▼────────┐        ┌────────────▼──┐   ┌──────▼────────┐
│  API Gateway   │        │  Real-time    │   │  CDN / Assets │
│  (Next.js API) │        │  WebSocket    │   │   (Vercel)    │
└───────┬────────┘        │  (Socket.io)  │   └────────────────┘
        │                 └────────┬───────┘
        │                          │
        └──────────────┬───────────┘
                       │
┌──────────────────────▼────────────────────────────────────┐
│               BACKEND LAYER (BFF Pattern)                 │
│  Hono.js + Fastify (High Performance)                     │
│  TypeScript + Zod (Type Safety)                           │
└──────────────────┬─────────────────────────────────────────┘
                   │
        ┌──────────┴─────────────┬──────────────┐
        │                        │              │
┌───────▼──────┐       ┌────────▼────┐   ┌─────▼──────┐
│ Business     │       │ Data        │   │ External   │
│ Logic Layer  │       │ Access      │   │ Services   │
│ (Services)   │       │ Layer       │   │ (APIs)     │
└──────────────┘       └────────┬────┘   └────────────┘
                                │
┌───────────────────────────────▼────────────────────┐
│           DATABASE & CACHE LAYER                   │
│  PostgreSQL 16 + Redis + Elasticsearch             │
│  Prisma ORM + Query Optimization                   │
└───────────────────────────────────────────────────┘
```

## 🏗️ Шарова архітектура

### 1. **Presentation Layer** (Frontend)
```
Next.js 14 Structure:
├── app/
│   ├── (auth)/          # Auth pages
│   ├── (main)/          # Main app
│   │   ├── page.tsx     # Homepage
│   │   ├── anime/[id]   # Detail page
│   │   ├── profile/     # User profile
│   │   └── ...
│   ├── api/            # API routes
│   └── layout.tsx      # Root layout
├── components/         # Reusable components
│   ├── ui/            # shadcn components
│   ├── anime/         # Anime-specific
│   └── ...
├── hooks/             # Custom React hooks
├── lib/              # Utilities
├── store/            # Zustand state
└── styles/           # Global styles
```

**Key Technologies:**
- **Next.js 14** - App Router, Server Components (SSR/SSG)
- **React 19** - Concurrent rendering, automatic batching
- **TypeScript** - Type safety, better DX
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - Headless component library
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **Zod** - Runtime type validation

### 2. **API Layer** (Backend-for-Frontend)
```
BFF Pattern with Hono.js:
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── anime.ts
│   │   ├── user.ts
│   │   └── community.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rateLimit.ts
│   │   └── cors.ts
│   ├── services/
│   │   └── external APIs
│   └── index.ts
```

**Hono.js + Fastify:**
- Ultra-fast routing (175k req/s)
- Built-in validation with Zod
- Native TypeScript support
- Middleware chain pattern
- Edge computing ready

### 3. **Business Logic Layer**
```
Services Architecture:
├── AnimeService
│   ├── fetchAnimeData()
│   ├── searchAnime()
│   ├── getRecommendations()
│   └── cacheStrategy()
├── UserService
│   ├── createUser()
│   ├── updateProfile()
│   └── manageWatchlist()
├── CommunityService
│   ├── createPost()
│   ├── getComments()
│   └── moderation()
└── RecommendationEngine
    ├── collaborative filtering
    ├── content-based filtering
    └── hybrid approach
```

### 4. **Data Access Layer** (Prisma ORM)
```prisma
// schema.prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  username  String    @unique
  profile   Profile?
  watchlist Anime[]   @relation("UserWatchlist")
  posts     Post[]
  comments  Comment[]
  following User[]    @relation("UserFollows")
  followers User[]    @relation("UserFollows")
}

model Anime {
  id          Int       @id
  title       String
  description String
  posterUrl   String
  episodes    Int
  genre       Genre[]
  reviews     Review[]
  watchers    User[]    @relation("UserWatchlist")
}

model Post {
  id        Int       @id @default(autoincrement())
  title     String
  content   String
  author    User      @relation(fields: [authorId], references: [id])
  comments  Comment[]
  likes     Int       @default(0)
  createdAt DateTime  @default(now())
}
```

### 5. **Database Layer**

**PostgreSQL 16:**
```sql
-- Indices for performance
CREATE INDEX idx_anime_title ON anime USING gin(title);
CREATE INDEX idx_user_email ON users USING btree(email);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);

-- Full-text search
CREATE INDEX idx_anime_search ON anime 
  USING GIN(to_tsvector('ukrainian', title || ' ' || description));
```

**Redis Cache:**
- Session storage
- Real-time notifications
- Rate limiting
- Cache warming for hot data

**Elasticsearch:**
- Full-text search
- Aggregations
- Analytics

## 🔄 Data Flow

### Esempio 1: Користувач переглядає аніме

```
User Click
    ↓
Next.js Page Component (Server Component)
    ↓
getAnimeData() via Prisma
    ↓
PostgreSQL Query + Redis Cache
    ↓
Server-side rendering
    ↓
Send optimized HTML/JSON
    ↓
Client-side hydration
    ↓
Interactive UI with React 19
```

### Esempio 2: Real-time Comments

```
User types comment
    ↓
Client sends to API
    ↓
Hono.js validates (Zod)
    ↓
Save to PostgreSQL
    ↓
Emit WebSocket event
    ↓
Redis Pub/Sub broadcast
    ↓
All connected clients receive
    ↓
Optimistic update + real sync
```

## 🎯 Design Patterns

### 1. **Server-Driven Components**
```typescript
// app/anime/[id]/page.tsx - Server Component
export default async function AnimePage({ params }) {
  // Direct database access - zero client-side overhead
  const anime = await db.anime.findUnique({
    where: { id: params.id },
    include: { 
      reviews: { take: 10 },
      recommendations: true
    }
  })
  
  return <AnimeDetail anime={anime} />
}
```

### 2. **Client Components for Interactivity**
```typescript
// components/AnimeCard.tsx
'use client'

export function AnimeCard({ anime }: Props) {
  const [liked, setLiked] = useState(false)
  
  return (
    <Card>
      <Image src={anime.poster} />
      <Button 
        onClick={() => handleLike(anime.id)}
      >
        ♥ {anime.likes}
      </Button>
    </Card>
  )
}
```

### 3. **API Route Handlers with Validation**
```typescript
// app/api/anime/search/route.ts
import { z } from 'zod'

const SearchSchema = z.object({
  q: z.string().min(1).max(100),
  genre: z.string().optional(),
  year: z.number().optional()
})

export async function POST(req: Request) {
  const body = await req.json()
  const validated = SearchSchema.parse(body)
  
  const results = await elasticsearch.search({
    index: 'anime',
    body: {
      query: {
        multi_match: {
          query: validated.q,
          fields: ['title^2', 'description']
        }
      }
    }
  })
  
  return Response.json(results)
}
```

### 4. **Middleware Pattern for Cross-Cutting Concerns**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Auth check
  const token = request.cookies.get('auth')?.value
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Add request ID for tracing
  const requestId = crypto.randomUUID()
  const response = NextResponse.next()
  response.headers.set('x-request-id', requestId)
  
  return response
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*']
}
```

## 🚀 Performance Optimizations

### 1. **Image Optimization**
```typescript
import Image from 'next/image'

<Image
  src={anime.posterUrl}
  alt={anime.title}
  width={200}
  height={300}
  priority={isAboveFold}
  quality={85}
  placeholder="blur"
  blurDataURL={blurredImage}
/>
```

### 2. **Bundle Optimization**
```typescript
// Dynamic imports for heavy components
const HeavyModal = dynamic(
  () => import('@/components/Modal'),
  { loading: () => <Skeleton /> }
)
```

### 3. **Database Query Optimization**
```typescript
// Efficient eager loading
const anime = await db.anime.findMany({
  include: {
    genre: { select: { name: true } },
    reviews: { 
      take: 5, 
      orderBy: { likes: 'desc' }
    }
  },
  skip: (page - 1) * 20,
  take: 20
})
```

### 4. **Caching Strategy**
```typescript
// ISR (Incremental Static Regeneration)
export const revalidate = 3600 // 1 hour

// On-demand revalidation
export async function revalidateAnime(id: string) {
  revalidatePath(`/anime/${id}`)
}
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────┐
│        Cloudflare / WAF Layer           │
│  (DDoS, Bot Protection, IP Filtering)   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│     Next.js Middleware (Auth, CORS)     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Input Validation (Zod)               │
│    Rate Limiting (Redis)                │
│    CSRF Protection                      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  OAuth 2.0 / JWT Authentication         │
│  Session Management                     │
│  Role-Based Access Control (RBAC)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  Database Encryption (PG Native)        │
│  API Key Rotation                       │
│  Secrets Management (Vault)             │
└─────────────────────────────────────────┘
```

## 📈 Scalability Strategy

### Horizontal Scaling
```yaml
Load Balancer (NGINX)
    ├── Next.js Server 1
    ├── Next.js Server 2
    ├── Next.js Server 3
    └── Next.js Server N
    
All connecting to:
    ├── PostgreSQL (Primary + Replicas)
    ├── Redis Cluster
    └── Elasticsearch Cluster
```

### Database Sharding
```typescript
// User-based sharding for analytics
const shardId = hashUserId(userId) % SHARD_COUNT
const connection = getShardConnection(shardId)
```

## 🤖 AI/ML Integration

```typescript
// Recommendation Engine
const getRecommendations = async (userId: string) => {
  // 1. Collaborative Filtering
  const similarUsers = await findSimilarUsers(userId)
  const cfRecommendations = await getCFRecommendations(similarUsers)
  
  // 2. Content-Based
  const userGenres = await getUserGenrePreferences(userId)
  const contentRecommendations = await getContentRecommendations(userGenres)
  
  // 3. Hybrid with ML ranking
  const combined = hybridRecommendations(
    cfRecommendations,
    contentRecommendations
  )
  
  return combined
}
```

## 📊 Monitoring & Analytics

```typescript
// Sentry for error tracking
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
})

// PostHog for product analytics
import { usePostHog } from 'posthog-js/react'

const posthog = usePostHog()
posthog.capture('anime_viewed', {
  anime_id: id,
  duration: watchTime
})
```

## 🔌 Integration Points

```
┌──────────────────────────────┐
│  External APIs               │
├──────────────────────────────┤
│ • MyAnimeList API            │
│ • AniDB API                  │
│ • TMDB API (related movies)  │
│ • Google Translate API       │
│ • Discord Webhook            │
│ • Stripe/PayPal (Premium)    │
└──────────────────────────────┘
```

---

**Ця архітектура забезпечує:**
✅ Скалюємість на мільйони користувачів
✅ Sub-second response times
✅ Real-time features
✅ Type safety throughout
✅ Developer experience
✅ Easy testing & maintenance
✅ Enterprise-grade security
