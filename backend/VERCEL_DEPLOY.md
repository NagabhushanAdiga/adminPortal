# Deploy Backend to Vercel

1. **Root Directory**  
   If your repo root is the parent of `backend/`, set in Vercel: **Root Directory** = `backend`.

2. **Environment variables** (Vercel project → Settings → Environment Variables):
   - `MONGODB_URI` = your MongoDB connection string (e.g. `mongodb+srv://...`)
   - `DB_NAME` = `adminportal` (or your database name)

3. Deploy. The app is served as a serverless function; all routes go through `api/index.js`.

4. **Test after deploy**
   - `GET https://your-app.vercel.app/api/ping` → should return `{"ok":true}` (no DB).
   - `GET https://your-app.vercel.app/api/health` → should return `{"ok":true,"connected":true}` if MongoDB is reachable.

5. **If you get "Server error" (500)**  
   Ensure `MONGODB_URI` and `DB_NAME` are set in Vercel Environment Variables. Redeploy after adding them.
