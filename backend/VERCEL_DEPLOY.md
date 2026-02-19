# Deploy Backend to Vercel

1. **Root Directory**  
   If your repo root is the parent of `backend/`, set in Vercel: **Root Directory** = `backend`.

2. **Environment variables** (Vercel project → Settings → Environment Variables):
   - `MONGODB_URI` = your MongoDB connection string (e.g. `mongodb+srv://...`)
   - `DB_NAME` = `adminportal` (or your database name)

3. Deploy. The app is served as a serverless function; all routes go through `api/index.js`.

4. **Test after deploy**
   - `GET https://your-app.vercel.app/api/health` → should return `{"ok":true,"connected":true}` if MongoDB is reachable.
