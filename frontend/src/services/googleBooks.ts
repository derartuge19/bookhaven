// src/services/googleBooks.ts
import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

if (!API_KEY) {
  console.warn('Google Books API key is not set. Please add VITE_GOOGLE_BOOKS_API_KEY to your .env file');
}

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const googleBooksApi = axios.create({
  baseURL: 'https://www.googleapis.com/books/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add API key to all requests
googleBooksApi.interceptors.request.use((config) => {
  if (API_KEY) {
    config.params = {
      ...config.params,
      key: API_KEY,
    };
  }
  return config;
});

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Rate limiting: ensure minimum time between requests
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
      }
      lastRequestTime = Date.now();
      
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        // Don't retry on client errors (except 429)
        if (status && status >= 400 && status < 500 && status !== 429) {
          throw error;
        }
        
        // For 429 or 5xx errors, retry with exponential backoff
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt);
          const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
          const totalDelay = delay + jitter;
          
          console.log(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${Math.round(totalDelay)}ms...`);
          await sleep(totalDelay);
          continue;
        }
      }
      
      throw lastError;
    }
  }
  
  throw lastError;
}

/**
 * Get data from cache or fetch if not available/expired
 */
function getCachedOrFetch<T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> {
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Returning cached data for:', cacheKey);
    return Promise.resolve(cached.data);
  }
  
  return fetchFn().then(data => {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
    return data;
  });
}

/**
 * Search books with retry logic and caching
 */
export const searchBooks = async (query: string, maxResults = 4) => {
  if (!query) {
    return [];
  }

  const cacheKey = `search:${query}:${maxResults}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    try {
      const response = await retryWithBackoff(() =>
        googleBooksApi.get('/volumes', {
          params: {
            q: query,
            maxResults,
            orderBy: 'newest',
            country: 'US',
          },
        })
      );
      return response.data.items || [];
    } catch (error) {
      console.error('Error searching books:', error);
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw error;
    }
  });
};

/**
 * Fetch books with advanced parameters, retry logic, and caching
 */
export const fetchBooksWithRetry = async (params: any) => {
  const cacheKey = `fetch:${JSON.stringify(params)}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    try {
      const response = await retryWithBackoff(() =>
        googleBooksApi.get('/volumes', {
          params,
        }),
        3, // max retries
        2000 // initial delay (2 seconds)
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before searching again.');
        } else if (status === 403) {
          throw new Error('API access denied. Please check your API key.');
        } else if (status && status >= 500) {
          throw new Error('Google Books service is temporarily unavailable. Please try again later.');
        }
      }
      
      throw error;
    }
  });
};

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export const clearCache = () => {
  cache.clear();
  console.log('Cache cleared');
};