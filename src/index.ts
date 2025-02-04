import 'dotenv/config';
import { Hono } from 'hono';
import { create, getAge } from './db/db'; // Adjust the path as necessary

const app = new Hono();

app.post('/cats', async (ctx) => {
  const { cat_name, breed, age } = await ctx.req.json();
  try {
    const id = await create({ cat_name, breed, age });
    return ctx.json({ message: 'Cat created successfully', catId: id }, 201);
  } catch (err) {
    return ctx.json({ error: 'Failed to create cat' }, 500);
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
    return ctx.json({ error: 'Failed to fetch cat age' }, 500);
  }
});

export default app;