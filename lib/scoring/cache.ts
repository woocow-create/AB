import crypto from "crypto";
import { CreativeScoreResponse } from "./schema";

const memoryCache = new Map<string, { data: CreativeScoreResponse; timestamp: number }>();

export function generateCreativeCacheKey(
  imageBufferOrUrl: string,
  headline: string,
  bodyText: string,
  ctaText: string,
  contextStr: string
): string {
  const hash = crypto.createHash("sha256");
  hash.update(imageBufferOrUrl);
  hash.update(headline);
  hash.update(bodyText);
  hash.update(ctaText);
  hash.update(contextStr);
  return hash.digest("hex");
}

export function getCachedScore(cacheKey: string): CreativeScoreResponse | null {
  const cached = memoryCache.get(cacheKey);
  if (!cached) return null;
  // Cache TTL: 24 hours
  if (Date.now() - cached.timestamp > 24 * 60 * 60 * 1000) {
    memoryCache.delete(cacheKey);
    return null;
  }
  return cached.data;
}

export function setCachedScore(cacheKey: string, score: CreativeScoreResponse): void {
  memoryCache.set(cacheKey, { data: score, timestamp: Date.now() });
}
