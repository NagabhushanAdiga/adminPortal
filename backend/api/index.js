// Vercel serverless entry: run Express app for every request
import app from '../server.js';

export default function handler(req, res) {
  return app(req, res);
}
