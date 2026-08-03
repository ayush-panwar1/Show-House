import { createClient } from "redis";

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    // tls: true, // Uncomment for Redis Cloud if required
  },
});

client.on("error", (err) => {
  console.error("[Redis] Client Error:", err.message);
});

let connectPromise: Promise<void> | null = null;

/**
 * Returns true if Redis is ready.
 * Returns false if connection fails.
 * Never throws.
 */
async function connectRedis(): Promise<boolean> {
  try {
    // Already connected
    if (client.isReady) {
      return true;
    }

    // Another request is already connecting
    if (!connectPromise) {
      console.log("[Redis] Connecting...");

      connectPromise = client
        .connect()
        .then(() => {
          console.log("[Redis] Connected");
        })
        .catch((err) => {
          console.error("[Redis] Connection Failed:", err.message);
          throw err;
        })
        .finally(() => {
          connectPromise = null;
        });
    }

    await connectPromise;

    return client.isReady;
  } catch {
    return false;
  }
}

export async function getCache<T>(key: string): Promise<T |null> {
  const connected = await connectRedis();

  if (!connected) {
    console.warn(`[Redis] Cache MISS (Redis unavailable): ${key}`);
    return null;
  }

  try {
    const value = await client.get(key);

    if (!value) {
      console.log(`[Redis] Cache MISS: ${key}`);
      return null;
    }

    console.log(`[Redis] Cache HIT: ${key}`);

    return JSON.parse(value) as T;
  } catch (err) {
    console.error(
      `[Redis] Failed to read "${key}":`,
      err instanceof Error ? err.message : err
    );

    return null;
  }
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  const connected = await connectRedis();

  if (!connected) {
    console.warn(`[Redis] Skipping cache write: ${key}`);
    return;
  }

  const ttl =
    ttlSeconds ??
    (process.env.REDIS_DEFAULT_TTL
      ? Number(process.env.REDIS_DEFAULT_TTL)
      : 60 * 60);

  try {
    await client.set(key, JSON.stringify(value), {
      EX: ttl,
    });

    console.log(
      `[Redis] Cache SET: ${key} (TTL=${ttl}s)`
    );
  } catch (err) {
    console.error(
      `[Redis] Failed to cache "${key}":`,
      err instanceof Error ? err.message : err
    );
  }
}

export async function deleteCache(key: string): Promise<void> {
  const connected = await connectRedis();

  if (!connected) return;

  try {
    await client.del(key);
    console.log(`[Redis] Cache DELETE: ${key}`);
  } catch (err) {
    console.error(
      `[Redis] Failed to delete "${key}":`,
      err instanceof Error ? err.message : err
    );
  }
}

export async function getKeys(
  pattern = "*"
): Promise<string[]> {
  const connected = await connectRedis();

  if (!connected) return [];

  try {
    return await client.keys(pattern);
  } catch (err) {
    console.error(
      "[Redis] Failed to fetch keys:",
      err instanceof Error ? err.message : err
    );

    return [];
  }
}