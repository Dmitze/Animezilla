# 🔬 Алгоритми і процеси Animezilla

## 🤖 Система рекомендацій

### Гібридний підхід (Hybrid Recommender)

```
┌─────────────────────────────────────────────────────┐
│     USER INTERACTION DATA                           │
│  ├─ View history                                    │
│  ├─ Ratings & reviews                              │
│  ├─ Time spent watching                            │
│  └─ Completion status                              │
└──────────┬──────────────────────────────────────────┘
           │
    ┌──────┴──────┬────────────────┬─────────────┐
    │             │                │             │
    ▼             ▼                ▼             ▼
┌─────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────┐
│Collabor-│ │Content-  │ │Temporal    │ │Popularity│
│ative    │ │Based     │ │(Trends)    │ │(Trending)│
│Filtering│ │Filtering │ │            │ │          │
└────┬────┘ └────┬─────┘ └──────┬─────┘ └────┬─────┘
     │           │              │             │
     └───────────┼──────────────┼─────────────┘
                 │              │
                 ▼              ▼
            ┌─────────────────────────┐
            │   SCORING ALGORITHM      │
            │  (Weighted Combination)  │
            └────────────┬─────────────┘
                         │
                    ┌────▼────┐
                    │  RANK   │
                    │ & FILTER │
                    └────┬────┘
                         │
                    ┌────▼────────────┐
                    │ PERSONALIZED    │
                    │ RECOMMENDATIONS │
                    └─────────────────┘
```

### 1. Collaborative Filtering
```typescript
// lib/algorithms/collaborative.ts

interface UserVector {
  userId: string
  genres: Record<string, number>
  ratings: Record<number, number>
  watchTime: number
}

interface SimilarityScore {
  userId: string
  similarity: number
}

/**
 * Cosine similarity между двумя пользователями
 * Скорость: O(n) где n - количество общих аниме
 */
function calculateCosineSimilarity(
  user1: UserVector,
  user2: UserVector
): number {
  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0

  // Вычисляем dot product и magnitudes
  for (const genreId in user1.genres) {
    const val1 = user1.genres[genreId] || 0
    const val2 = user2.genres[genreId] || 0
    
    dotProduct += val1 * val2
    magnitude1 += val1 * val1
    magnitude2 += val2 * val2
  }

  const similarity = dotProduct / (
    Math.sqrt(magnitude1) * Math.sqrt(magnitude2)
  )
  
  return isNaN(similarity) ? 0 : similarity
}

/**
 * Найти похожих пользователей
 * Время: O(n²) где n - количество пользователей
 * Оптимизация: кешировать результаты на Redis
 */
async function findSimilarUsers(
  targetUserId: string,
  k: number = 10
): Promise<SimilarityScore[]> {
  // Получить вектор целевого пользователя
  const targetUser = await getUserVector(targetUserId)
  
  // Получить всех пользователей (можно оптимизировать с sampling)
  const allUsers = await getAllUserVectors()
  
  // Вычислить сходство с каждым
  const similarities = allUsers
    .filter(u => u.userId !== targetUserId)
    .map(user => ({
      userId: user.userId,
      similarity: calculateCosineSimilarity(targetUser, user)
    }))
    .filter(s => s.similarity > 0.1) // Минимальный порог
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k)
  
  return similarities
}

/**
 * Получить рекомендации на основе CF
 * Алгоритм: Rated by similar users but not by you
 */
async function getCollaborativeRecommendations(
  userId: string
): Promise<Array<{ animeId: number, score: number }>> {
  const similarUsers = await findSimilarUsers(userId)
  
  // Получить аниме, просмотренные похожими пользователями
  const userWatchlist = await db.watchList.findMany({
    where: { userId }
  })
  const userWatchedIds = new Set(userWatchlist.map(w => w.animeId))
  
  const animeScores = new Map<number, number>()
  
  for (const similar of similarUsers) {
    const similarUserWatchlist = await db.watchList.findMany({
      where: { userId: similar.userId },
      include: {
        anime: {
          select: { id: true, rating: true }
        }
      }
    })
    
    for (const item of similarUserWatchlist) {
      // Пропустить уже просмотренные
      if (userWatchedIds.has(item.animeId)) continue
      
      // Добавить взвешенный скор
      const score = (animeScores.get(item.animeId) || 0) +
        (item.anime.rating * similar.similarity)
      
      animeScores.set(item.animeId, score)
    }
  }
  
  return Array.from(animeScores.entries())
    .map(([animeId, score]) => ({ animeId, score }))
    .sort((a, b) => b.score - a.score)
}
```

### 2. Content-Based Filtering
```typescript
// lib/algorithms/content-based.ts

interface AnimeFeatures {
  animeId: number
  genres: Record<string, number>
  year: number
  episodes: number
  rating: number
  studio: string
}

interface UserPreferences {
  userId: string
  genrePreferences: Record<string, number>
  yearPreference: number
  ratingThreshold: number
}

/**
 * Извлечь предпочтения пользователя из истории просмотров
 */
function extractUserPreferences(
  watchHistory: Array<{ anime: AnimeFeatures, rating: number }>
): UserPreferences {
  const genrePreferences: Record<string, number> = {}
  let totalRating = 0
  let yearSum = 0
  let count = 0
  
  for (const item of watchHistory) {
    totalRating += item.rating
    yearSum += item.anime.year
    count++
    
    // Взвесить жанры по рейтингу
    for (const [genre, weight] of Object.entries(item.anime.genres)) {
      genrePreferences[genre] = (genrePreferences[genre] || 0) +
        weight * (item.rating / 10)
    }
  }
  
  return {
    userId: '', // Will be set later
    genrePreferences,
    yearPreference: yearSum / count,
    ratingThreshold: totalRating / count
  }
}

/**
 * Вычислить сходство между профилем пользователя и аниме
 * Используется простая версия формулы TF-IDF
 */
function calculateContentSimilarity(
  userPrefs: UserPreferences,
  anime: AnimeFeatures
): number {
  let similarity = 0
  
  // Genre similarity (60% weight)
  for (const [genre, userWeight] of Object.entries(userPrefs.genrePreferences)) {
    const animeWeight = anime.genres[genre] || 0
    similarity += animeWeight * userWeight * 0.6
  }
  
  // Year preference (20% weight)
  const yearDifference = Math.abs(anime.year - userPrefs.yearPreference)
  const yearSimilarity = Math.max(0, 1 - (yearDifference / 20))
  similarity += yearSimilarity * 0.2
  
  // Rating expectation (20% weight)
  if (anime.rating >= userPrefs.ratingThreshold) {
    similarity += 0.2 // Дополнительный бонус за хороший рейтинг
  }
  
  return similarity
}

async function getContentBasedRecommendations(
  userId: string
): Promise<Array<{ animeId: number, score: number }>> {
  // Получить историю просмотров пользователя
  const watchHistory = await db.watchList.findMany({
    where: { userId },
    include: {
      anime: true,
      review: {
        select: { rating: true }
      }
    }
  })
  
  // Извлечь предпочтения
  const userPrefs = extractUserPreferences(
    watchHistory.map(w => ({
      anime: w.anime as AnimeFeatures,
      rating: w.review?.rating || 5
    }))
  )
  
  // Получить все аниме (исключая просмотренные)
  const watchedIds = new Set(watchHistory.map(w => w.animeId))
  const allAnimes = await db.anime.findMany({
    where: {
      NOT: {
        id: { in: Array.from(watchedIds) }
      }
    }
  })
  
  // Оценить каждое аниме
  const recommendations = allAnimes
    .map(anime => ({
      animeId: anime.id,
      score: calculateContentSimilarity(userPrefs, anime as AnimeFeatures)
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
  
  return recommendations
}
```

### 3. Гибридный рейтинг
```typescript
/**
 * Объединить рекомендации от разных алгоритмов
 * 60% от CF, 40% от Content-Based
 */
async function getHybridRecommendations(
  userId: string
): Promise<Array<{ animeId: number, score: number, reason: string }>> {
  const [cfRecs, cbRecs] = await Promise.all([
    getCollaborativeRecommendations(userId),
    getContentBasedRecommendations(userId)
  ])
  
  const combinedScores = new Map<number, { score: number, sources: string[] }>()
  
  // Добавить CF рекомендации (60% weight)
  for (const rec of cfRecs) {
    const existing = combinedScores.get(rec.animeId) || { score: 0, sources: [] }
    existing.score += rec.score * 0.6
    existing.sources.push('collaborative')
    combinedScores.set(rec.animeId, existing)
  }
  
  // Добавить CB рекомендации (40% weight)
  for (const rec of cbRecs) {
    const existing = combinedScores.get(rec.animeId) || { score: 0, sources: [] }
    existing.score += rec.score * 0.4
    existing.sources.push('content-based')
    combinedScores.set(rec.animeId, existing)
  }
  
  // Отсортировать по скору
  return Array.from(combinedScores.entries())
    .map(([animeId, data]) => ({
      animeId,
      score: data.score,
      reason: data.sources.join(' + ')
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20) // Top 20
}
```

---

## 🔍 Алгоритм поиска (Full-Text Search)

### Elasticsearch Strategy
```typescript
// lib/elasticsearch-search.ts

/**
 * Multi-field поиск с fuzzy matching
 * Время: O(log n) благодаря инвертированному индексу
 */
async function searchAnime(query: string, page = 1) {
  const from = (page - 1) * 20
  
  const result = await elasticsearch.search({
    index: 'anime',
    from,
    size: 20,
    body: {
      query: {
        bool: {
          should: [
            // Точное совпадение в title (highest boost)
            {
              match: {
                title: {
                  query,
                  fuzziness: 0,
                  boost: 3
                }
              }
            },
            // Нечеткое совпадение в title
            {
              match: {
                title: {
                  query,
                  fuzziness: 'AUTO',
                  boost: 2
                }
              }
            },
            // Поиск в описании
            {
              match: {
                description: {
                  query,
                  fuzziness: 'AUTO',
                  boost: 1
                }
              }
            },
            // Поиск по жанрам
            {
              match: {
                genres: {
                  query,
                  boost: 1.5
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      highlight: {
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
        fields: {
          title: {},
          description: {}
        }
      }
    }
  })
  
  return {
    results: result.hits.hits.map(hit => ({
      ...hit._source,
      highlight: hit.highlight
    })),
    total: result.hits.total.value,
    page,
    pages: Math.ceil(result.hits.total.value / 20)
  }
}

/**
 * Auto-complete suggestions
 * Использует completion suggester для O(1) поиска
 */
async function getAutocompleteSuggestions(prefix: string) {
  const result = await elasticsearch.search({
    index: 'anime',
    body: {
      suggest: {
        anime-suggest: {
          prefix,
          completion: {
            field: 'title.completion',
            size: 10,
            skip_duplicates: true,
            fuzzy: {
              fuzziness: 'AUTO'
            }
          }
        }
      }
    }
  })
  
  return result.suggest['anime-suggest'][0].options.map(
    opt => opt.text
  )
}
```

---

## ⚡ Алгоритм кеширования

### Multi-Layer Cache Strategy
```
┌──────────────────────┐
│   Browser Cache      │  (HTTP Cache-Control)
│   Max-Age: 3600s    │
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│   CDN Cache          │  (Cloudflare)
│   Max-Age: 86400s   │
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│   Redis Cache        │  (Hot Data)
│   TTL: 300-3600s    │
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│   Database           │  (Source of Truth)
│   PostgreSQL         │
└──────────────────────┘
```

### Cache Invalidation Strategy
```typescript
// lib/cache-invalidation.ts

import { redis } from '@/lib/redis'

/**
 * Event-based cache invalidation
 * Когда пользователь добавляет аніме в список,
 * инвалидируем кеш его рекомендаций
 */
async function onAnimeAdded(userId: string, animeId: number) {
  // Инвалидировать
  await redis.del(`recommendations:${userId}`)
  await redis.del(`watchlist:${userId}`)
  
  // Инвалидировать для похожих пользователей
  const similarUsers = await getSimilarUsersFromCache(userId)
  for (const similarId of similarUsers) {
    await redis.del(`recommendations:${similarId}`)
  }
}

/**
 * Time-based cache с lazy regeneration
 * Если кеш истек, регенерируем в фоне
 */
async function getCachedRecommendations(userId: string) {
  const cacheKey = `recommendations:${userId}`
  const cached = await redis.get(cacheKey)
  
  if (cached) {
    return JSON.parse(cached)
  }
  
  // Кеш мисс - регенерировать в фоне
  const recommendations = await generateRecommendations(userId)
  
  // Кешировать на 1 час
  await redis.setex(
    cacheKey,
    3600,
    JSON.stringify(recommendations)
  )
  
  return recommendations
}
```

---

## 📊 Алгоритм ранжирования (Ranking Algorithm)

```typescript
// lib/ranking.ts

interface RankingFactors {
  relevance: number      // Поиск
  popularity: number     // Просмотры / лайки
  recency: number        // Дата релиза
  userPref: number       // Соответствие предпочтениям
  community: number      // Рейтинг спільноти
}

/**
 * Комплексный скор для ранжирования
 * Использует комбинацию разных факторов
 */
function calculateRankingScore(
  anime: any,
  searchQuery: string,
  userPrefs: any,
  weights = {
    relevance: 0.25,
    popularity: 0.20,
    recency: 0.15,
    userPref: 0.25,
    community: 0.15
  }
): number {
  const factors: RankingFactors = {
    // Relevance: TF-IDF скор от Elasticsearch
    relevance: anime.elasticsearchScore || 0,
    
    // Popularity: нормализованное количество просмотров
    popularity: Math.log(anime.viewCount + 1) / Math.log(1000),
    
    // Recency: бонус за недавний релиз
    recency: Math.max(0, 1 - (Date.now() - anime.releaseDate) / (365 * 24 * 60 * 60 * 1000)),
    
    // User preference: соответствие жанрам
    userPref: calculateUserPreferenceSimilarity(anime, userPrefs),
    
    // Community rating: нормализованный рейтинг
    community: anime.rating / 10
  }
  
  let score = 0
  for (const [factor, value] of Object.entries(factors)) {
    score += value * weights[factor as keyof typeof weights]
  }
  
  return score
}

async function rankSearchResults(
  results: any[],
  query: string,
  userId: string
): Promise<any[]> {
  const userPrefs = await getUserPreferences(userId)
  
  return results
    .map(anime => ({
      ...anime,
      rankScore: calculateRankingScore(anime, query, userPrefs)
    }))
    .sort((a, b) => b.rankScore - a.rankScore)
}
```

---

## 🔄 Alhorithm Real-Time Updates

```typescript
// lib/realtime.ts

import { pubsub } from '@/lib/pubsub'

/**
 * Event-driven архітектура для real-time оновлень
 * Використовує Redis Pub/Sub для broadcasting
 */

// 1. Користувач додає коментар
async function postComment(animeId: number, content: string) {
  const comment = await db.comment.create({
    data: { animeId, content, userId: getCurrentUserId() },
    include: { author: true }
  })
  
  // 2. Публікуємо événие
  await pubsub.publish(`anime:${animeId}:comments`, {
    type: 'COMMENT_CREATED',
    data: comment
  })
  
  return comment
}

// 3. WebSocket слухачі отримують оновлення
function listenToAnimeComments(animeId: number, callback: Function) {
  pubsub.subscribe(`anime:${animeId}:comments`, (event) => {
    callback(event.data)
  })
}
```

---

## 📈 Performance Optimization

```typescript
// lib/optimization.ts

/**
 * Query optimization: Use batch loading to avoid N+1
 */
async function getTopAnimes(limit = 10) {
  // ❌ BAD: N+1 queries
  // const animes = await db.anime.findMany({ take: limit })
  // const details = await Promise.all(
  //   animes.map(a => db.animeDetail.findUnique({ where: { id: a.id } }))
  // )
  
  // ✅ GOOD: Single query with eager loading
  return db.anime.findMany({
    take: limit,
    include: {
      genres: { select: { name: true } },
      reviews: { 
        select: { rating: true },
        take: 5 
      },
      _count: {
        select: { reviews: true, watchers: true }
      }
    },
    orderBy: { rating: 'desc' }
  })
}

/**
 * Pagination with keyset method (faster than OFFSET)
 */
async function getPaginatedAnimes(
  cursor?: number,
  limit = 20
) {
  return db.anime.findMany({
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1 // Skip the cursor itself
    }),
    take: limit + 1, // Fetch one extra to check hasMore
    orderBy: { id: 'asc' }
  })
}
```

Це **modern, scalable algorithms** для world-class платформи! 🚀
