// 缓存项接口
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

// 缓存管理器
class CacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  // 设置缓存
  set<T>(key: string, data: T, ttl?: number): void {
    // 检查缓存大小，如果超出限制则清理过期项
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    }

    this.cache.set(key, item)
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  // 检查缓存是否存在且未过期
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // 删除缓存
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // 清空所有缓存
  clear(): void {
    this.cache.clear()
  }

  // 获取缓存大小
  size(): number {
    return this.cache.size
  }

  // 清理过期项
  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // 获取缓存统计信息
  getStats() {
    const now = Date.now()
    let expiredCount = 0
    let validCount = 0

    for (const item of this.cache.values()) {
      if (now - item.timestamp > item.ttl) {
        expiredCount++
      } else {
        validCount++
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      maxSize: this.maxSize,
    }
  }
}

// 创建默认缓存实例
export const cacheManager = new CacheManager()

// 缓存装饰器（用于函数）
export function cache<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : `${fn.name}_${JSON.stringify(args)}`

    // 尝试从缓存获取
    const cached = cacheManager.get(key)
    if (cached !== null) {
      return cached
    }

    // 执行函数并缓存结果
    const result = fn(...args)

    // 处理 Promise
    if (result instanceof Promise) {
      return result.then(data => {
        cacheManager.set(key, data, ttl)
        return data
      })
    } else {
      cacheManager.set(key, result, ttl)
      return result
    }
  }) as T
}

// API 缓存工具
export class APICache {
  private cache = new CacheManager(50, 2 * 60 * 1000) // 50项，2分钟TTL

  // 缓存 API 请求
  async cachedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // 尝试从缓存获取
    const cached = this.cache.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // 执行请求并缓存结果
    const result = await requestFn()
    this.cache.set(key, result, ttl)
    return result
  }

  // 清除特定前缀的缓存
  clearByPrefix(prefix: string): void {
    for (const key of this.cache['cache'].keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }

  // 获取统计信息
  getStats() {
    return this.cache.getStats()
  }
}

// 创建默认 API 缓存实例
export const apiCache = new APICache()

// 导出类型
export type { CacheItem }
