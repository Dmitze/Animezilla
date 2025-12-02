# 📦 Документація компонентів Animezilla

## Структура папок компонентів

```
components/
├── ui/                    # shadcn/ui компоненти
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── anime/                 # Аніме-специфічні компоненти
│   ├── AnimeCard.tsx
│   ├── AnimeGrid.tsx
│   ├── AnimeDetail.tsx
│   ├── AnimeFilter.tsx
│   └── SearchBar.tsx
├── common/                # Повторно використовувані компоненти
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── Breadcrumb.tsx
├── auth/                  # Auth компоненти
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── ProtectedRoute.tsx
│   └── UserMenu.tsx
├── community/             # Спільнота компоненти
│   ├── PostCard.tsx
│   ├── CommentSection.tsx
│   ├── CreatePostForm.tsx
│   └── UserProfile.tsx
└── shared/                # Утиліти
    ├── Loading.tsx
    ├── Error.tsx
    ├── Modal.tsx
    └── Toast.tsx
```

---

## 🎨 UI компоненти (shadcn/ui)

### Button
```typescript
import { Button } from '@/components/ui/button'

// Варіанти
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// Розміри
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// Стани
<Button disabled>Disabled</Button>
<Button isLoading>Loading...</Button>
```

### Card
```typescript
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer here
  </CardFooter>
</Card>
```

### Input
```typescript
import { Input } from '@/components/ui/input'

<Input
  type="email"
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

<Input
  type="password"
  placeholder="Password"
  disabled
/>
```

### Dialog
```typescript
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    Dialog content here
  </DialogContent>
</Dialog>
```

---

## 🎌 Аніме компоненти

### AnimeCard
```typescript
// components/anime/AnimeCard.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnimeCardProps {
  id: number
  title: string
  posterUrl: string
  episodes: number
  rating: number
  genres: string[]
  viewCount: number
  isRanked?: number
}

export function AnimeCard({
  id,
  title,
  posterUrl,
  episodes,
  rating,
  genres,
  viewCount,
  isRanked
}: AnimeCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <Link href={`/anime/${id}`}>
      <div className="group cursor-pointer">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-slate-900 mb-3">
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 200px"
            priority={false}
          />
          
          {/* Rating Badge */}
          {isRanked && (
            <div className="absolute top-2 left-2 bg-cyan-500 text-black w-8 h-8 rounded flex items-center justify-center text-sm font-bold">
              #{isRanked}
            </div>
          )}

          {/* Views Badge */}
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
            <Eye size={14} />
            {(viewCount / 1000).toFixed(0)}K
          </div>

          {/* Episodes Badge */}
          <div className="absolute bottom-2 right-2 bg-cyan-500/20 border border-cyan-500 text-cyan-400 px-2 py-1 rounded text-xs font-semibold">
            {episodes} ep
          </div>

          {/* Like Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsLiked(!isLiked)
            }}
            className="absolute bottom-2 left-2 bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
          >
            <Heart
              size={20}
              className={cn(
                'transition-colors',
                isLiked ? 'fill-cyan-400 text-cyan-400' : 'text-gray-400'
              )}
            />
          </button>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
          <span>★ {rating.toFixed(1)}</span>
          <span className="flex gap-1 flex-wrap">
            {genres.slice(0, 2).map(g => (
              <span key={g} className="text-gray-500">{g}</span>
            ))}
          </span>
        </div>
      </div>
    </Link>
  )
}
```

### AnimeGrid
```typescript
// components/anime/AnimeGrid.tsx
'use client'

import { AnimeCard } from './AnimeCard'
import { Anime } from '@prisma/client'

interface AnimeGridProps {
  animes: Anime[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
}

export function AnimeGrid({
  animes,
  isLoading = false,
  hasMore = false,
  onLoadMore
}: AnimeGridProps) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {animes.map(anime => (
          <AnimeCard
            key={anime.id}
            {...anime}
          />
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border border-cyan-500 border-t-transparent" />
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center py-8">
          <button
            onClick={onLoadMore}
            className="px-6 py-2 bg-cyan-500 text-black rounded font-semibold hover:bg-cyan-600 transition-colors"
          >
            Завантажити більше
          </button>
        </div>
      )}
    </>
  )
}
```

### AnimeDetail
```typescript
// components/anime/AnimeDetail.tsx
'use client'

import Image from 'next/image'
import { Star, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CommentSection } from '@/components/community/CommentSection'

interface AnimeDetailProps {
  anime: {
    id: number
    title: string
    description: string
    posterUrl: string
    episodes: number
    status: string
    year: number
    rating: number
    genres: string[]
    viewCount: number
  }
}

export function AnimeDetail({ anime }: AnimeDetailProps) {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex gap-8 mb-12">
        {/* Poster */}
        <div className="flex-shrink-0 w-48">
          <Image
            src={anime.posterUrl}
            alt={anime.title}
            width={200}
            height={300}
            className="rounded-lg shadow-lg w-full"
          />
        </div>

        {/* Info */}
        <div className="flex-grow">
          <h1 className="text-4xl font-bold mb-4">{anime.title}</h1>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-900/50 p-4 rounded-lg">
            <div>
              <div className="text-xs text-gray-400 font-semibold">Статус</div>
              <div className="text-sm font-semibold">{anime.status}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold">Рік</div>
              <div className="text-sm font-semibold">{anime.year}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold">Епізоди</div>
              <div className="text-sm font-semibold">{anime.episodes}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold">Рейтинг</div>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-cyan-400" />
                <span className="text-sm font-semibold">{anime.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-6">
            {anime.genres.map(genre => (
              <span
                key={genre}
                className="px-3 py-1 border border-cyan-500/50 rounded text-sm text-cyan-400 hover:bg-cyan-500/10 cursor-pointer transition-colors"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600">
              Додати до списку
            </Button>
            <Button variant="outline" size="lg">
              <Eye size={18} className="mr-2" />
              {anime.viewCount} переглядів
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Опис</h2>
        <p className="text-gray-300 leading-relaxed text-lg">
          {anime.description}
        </p>
      </div>

      {/* Comments */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Обговорення</h2>
        <CommentSection animeId={anime.id} />
      </div>
    </div>
  )
}
```

### SearchBar
```typescript
// components/anime/SearchBar.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return []
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      return res.json()
    },
    enabled: query.length > 0
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative flex-1 max-w-md" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Пошук аніме..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:outline-none"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 animate-spin" size={18} />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
          {results && results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {results.map((anime: any) => (
                <Link
                  key={anime.id}
                  href={`/anime/${anime.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-700 last:border-b-0"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={anime.posterUrl}
                      alt={anime.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-semibold line-clamp-1">
                      {anime.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {anime.episodes} ep • {anime.year}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-400">
              Нічого не знайдено
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## 👥 Community компоненти

### CommentSection
```typescript
// components/community/CommentSection.tsx
'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Comment } from '@/types'
import { CommentForm } from './CommentForm'
import { CommentCard } from './CommentCard'

interface CommentSectionProps {
  animeId: number
}

export function CommentSection({ animeId }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'best'>('newest')

  const { data: comments, isLoading } = useQuery({
    queryKey: ['anime', animeId, 'comments', sortBy],
    queryFn: () =>
      fetch(`/api/anime/${animeId}/comments?sort=${sortBy}`).then(r =>
        r.json()
      )
  })

  const { mutate: postComment, isPending } = useMutation({
    mutationFn: (content: string) =>
      fetch(`/api/anime/${animeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['anime', animeId, 'comments']
      })
    }
  })

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <CommentForm onSubmit={postComment} isLoading={isPending} />

      {/* Sort Controls */}
      <div className="flex gap-2">
        {(['newest', 'oldest', 'best'] as const).map(sort => (
          <Button
            key={sort}
            variant={sortBy === sort ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy(sort)}
          >
            {sort === 'newest' && 'Новіші'}
            {sort === 'oldest' && 'Старіші'}
            {sort === 'best' && 'Найкращі'}
          </Button>
        ))}
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border border-cyan-500 border-t-transparent" />
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment: Comment) => (
            <CommentCard key={comment.id} comment={comment} animeId={animeId} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          Нема коментарів. Будьте першим!
        </div>
      )}
    </div>
  )
}
```

### CommentCard
```typescript
// components/community/CommentCard.tsx
'use client'

import { useState } from 'react'
import { Heart, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'
import { Comment } from '@/types'

interface CommentCardProps {
  comment: Comment
  animeId: number
}

export function CommentCard({ comment, animeId }: CommentCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [showReplies, setShowReplies] = useState(false)

  return (
    <div className="bg-slate-900/50 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">{comment.author.username}</h4>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(comment.createdAt), {
              locale: uk,
              addSuffix: true
            })}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-300 mb-3">{comment.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
        >
          <Heart
            size={16}
            className={isLiked ? 'fill-cyan-400 text-cyan-400' : ''}
          />
          {comment.likes}
        </button>

        <button className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
          <MessageSquare size={16} />
          Відповідь
        </button>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-2 border-l border-cyan-500/30 pl-4">
          {comment.replies.slice(0, showReplies ? undefined : 1).map(reply => (
            <CommentCard key={reply.id} comment={reply} animeId={animeId} />
          ))}

          {comment.replies.length > 1 && !showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              className="text-xs text-cyan-400 hover:underline"
            >
              Показати ще {comment.replies.length - 1} відповідей
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## 🛠️ Утиліти

### Loading Skeleton
```typescript
// components/shared/Skeleton.tsx
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      'bg-slate-900 animate-pulse rounded',
      className
    )} />
  )
}

// Використання
<div className="grid grid-cols-4 gap-4">
  {Array(8).fill(0).map((_, i) => (
    <Skeleton key={i} className="aspect-[2/3]" />
  ))}
</div>
```

### Toast Notifications
```typescript
// lib/toast.ts
import { toast } from 'sonner'

export function showSuccess(message: string) {
  toast.success(message, {
    description: undefined,
    duration: 3000
  })
}

export function showError(message: string, description?: string) {
  toast.error(message, { description, duration: 4000 })
}

export function showLoading(message: string) {
  return toast.loading(message)
}
```

---

Всі компоненти **fully typed**, **accessible**, та готові до production! ✅
