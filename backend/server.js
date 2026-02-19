import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(routes);

// Catch unhandled errors so serverless doesn't hang
app.use((err, req, res, next) => {
  console.error('[Server error]', err);
  const isDev = process.env.NODE_ENV !== 'production';
  const message = isDev && err?.message ? err.message : 'Server error';
  res.status(500).json({ ok: false, error: message });
});

// Only listen when running locally (not on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Admin Portal API running at http://localhost:${PORT}`);
  });
}

export default app;
