import 'dotenv/config';
import { Hono } from 'hono';
import { create, getAge } from './db/db'; // Adjust the path as necessary
import { rateLimiter, Store } from 'hono-rate-limiter';
import {DatabaseError, ValidationError} from './errors.ts'
import { createClient } from 'redis'
import { RedisStore } from 'rate-limit-redis'
import { prometheus } from '@hono/prometheus'

const client = createClient({
  url: process.env.REDIS_URL!,

})

//@ts-expect-error
await client.connect()


const limiter = rateLimiter({
  windowMs: 15 * 60 * 10000, // 15 minutes
  limit: 100000, // Max 100000 requests per window
  keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
	standardHeaders: true,
  store: new RedisStore({
    sendCommand: (...args: string[]) => client.sendCommand(args),
  }) as unknown as Store
});

const app = new Hono();

const { printMetrics, registerMetrics } = prometheus()

app.get('/metrics', printMetrics) 

app.use('*', limiter, registerMetrics);

app.get('/', (c) => c.text('Cats API'))

app.post('/cats', async (ctx) => {
  const { cat_name, breed, age } = await ctx.req.json();
  try {
    const id = await create({ cat_name, breed, age });
    return ctx.json({ message: 'Cat created successfully', catId: id }, 201);
  } catch (err) {
    if (err instanceof ValidationError) {
      return ctx.json({ error: err.message }, 400);
    }
    if (err instanceof DatabaseError) {
      return ctx.json({ error: 'Database unavailable' }, 503);
    }
    return ctx.json({ error: 'Internal server error' }, 500);
  }
});


app.get('/cats/age', async (ctx) => {
  const { cat_name, breed } = ctx.req.query();
  try {
    const age = await getAge({ cat_name, breed });
    if (age !== null) {
      return ctx.json({ message: `The age of ${cat_name} is ${age}` }, 200);
    } else {
      return ctx.json({ error: 'Cat not found' }, 404);
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      return ctx.json({ error: err.message }, 400);
    }
    if (err instanceof DatabaseError) {
      return ctx.json({ error: 'Database unavailable' }, 503);
    }
    return ctx.json({ error: 'Internal server error' }, 500);
  }
});

export default app;