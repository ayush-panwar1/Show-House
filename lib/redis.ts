import { createClient } from "redis";

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    // tls: true, // Required for Redis Cloud
  },
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

let connected = false;

async function connectRedis() {
  if (!connected) {
    await client.connect();
    connected = true;
    console.log("Connected to Redis");
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  await connectRedis();

  const value = await client.get(key);

  if (!value) return null;

  return JSON.parse(value) as T;
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  await connectRedis();

  // Priority:
  // 1. TTL passed to function
  // 2. REDIS_DEFAULT_TTL from .env
  // 3. 1 hour default
  const ttl =
    ttlSeconds ??
    (process.env.REDIS_DEFAULT_TTL
      ? Number(process.env.REDIS_DEFAULT_TTL)
      : 60 * 60);

  await client.set(key, JSON.stringify(value), {
    EX: ttl,
  });
}

export async function deleteCache(key: string): Promise<void> {
  await connectRedis();
  await client.del(key);
}

export async function getKeys(pattern = "*"): Promise<string[]> {
  await connectRedis();
  return client.keys(pattern);
}