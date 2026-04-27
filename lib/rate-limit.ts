// Simple in-memory rate limiter for API routes
// In production, consider using Redis or a dedicated rate limiting service

const rateLimits = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries
  const keysToDelete: string[] = []
  rateLimits.forEach((v, k) => {
    if (v.resetTime < now) {
      keysToDelete.push(k)
    }
  })
  keysToDelete.forEach(k => rateLimits.delete(k))

  // Get or create rate limit entry
  const entry = rateLimits.get(key)

  if (!entry || entry.resetTime < now) {
    // Create new entry
    const resetTime = now + config.windowMs
    rateLimits.set(key, { count: 1, resetTime })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime,
    }
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Increment count
  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

// Helper to get identifier from request
export function getRateLimitIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  // For authenticated requests, use user ID if available
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    return `auth:${authHeader.substring(0, 20)}`
  }
  
  return `ip:${ip}`
}
